import os
import logging
from opentelemetry import trace, metrics  # metrics 패키지 추가
from opentelemetry.sdk.resources import Resource

# [Traces] 타임라인 추적용 엔진 임포트
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

# [Metrics] 프로메테우스 통계 통신용 엔진 임포트 (새로 추가)
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

# 자동 계측 플러그인 레이어
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

from src.db.session import engine
from src.core.config import settings

logger = logging.getLogger(__name__)

def setup_otel(app):
    """
    OpenTelemetry 설정을 초기화하고 FastAPI 앱에 Traces 및 Metrics 계측을 동시에 주입
    """
    # [수정]: 배포 환경 플래그를 하드코딩하지 않고 .env.production(ConfigMap)과 동적 싱크
    env_mode = os.getenv("APP_ENV", "development")
    
    # 1. 리소스 정의 (K3s 클러스터 내부 식별용 명세 마킹)
    resource = Resource.create({
        "service.name": settings.OTEL_SERVICE_NAME,
        "deployment.environment": env_mode
    })

    # 📡 공통 타겟 주소 획득 (K3s에서는 OTel Collector 서비스 주소:4317 저격)
    jaeger_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")

    # =================================================================
    # LAYERS 1 : 트레이스(Trace) 파이프라인 가동 ➔ Jaeger 목적지 설정
    # =================================================================
    trace_provider = TracerProvider(resource=resource)
    otlp_trace_exporter = OTLPSpanExporter(endpoint=jaeger_endpoint, insecure=True)
    
    # 비동기 일괄 처리를 통해 AI 엔진의 추론 오버헤드를 제로화합니다.
    span_processor = BatchSpanProcessor(otlp_trace_exporter)
    trace_provider.add_span_processor(span_processor)
    
    # 전역 인스턴스 락
    trace.set_tracer_provider(trace_provider)

    # =================================================================
    # LAYERS 2 : 메트릭(Metric) 파이프라인 증설 ➔ Prometheus 목적지 설정 (신규)
    # =================================================================
    # OTel Collector 터미널이 번역할 수 있도록 OTLP gRPC 프로토콜 포맷으로 발송 세팅
    if env_mode == "production":
        otlp_metric_exporter = OTLPMetricExporter(endpoint=jaeger_endpoint, insecure=True)
        metric_reader = PeriodicExportingMetricReader(
            exporter=otlp_metric_exporter, 
            export_interval_millis=5000
        )
        metric_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
        metrics.set_meter_provider(metric_provider)
        logger.info("프로덕션 통합 메트릭(Metrics) 파이프라인이 정상 활성화되었습니다.")
    else:
        logger.info("로컬 개발 모드 진입: 메트릭 수집을 유연하게 스킵하고 트레이스(Trace) 레이어만 격리 가동합니다.")

    # =================================================================
    # LAYERS 3 : 플러그인 계측 자동 활성화 (Instrumentation)
    # =================================================================
    # FastAPI HTTP 수동/자동 수집 진입
    FastAPIInstrumentor.instrument_app(app)

    # Logging 계측: 애플리케이션 에러 로그와 트레이스 ID 연결 고리 생성
    LoggingInstrumentor().instrument(set_logging_format=True)

    # SQLAlchemy 계측: pgvector DB 지식 인출 쿼리 타임 밀리초 자동 수집
    SQLAlchemyInstrumentor().instrument(engine=engine.sync_engine)
    
    logger.info(f"OpenTelemetry 통합 관측성(Traces & Metrics) 인프라 레이어가 바인딩되었습니다. 타겟 우체국: {jaeger_endpoint}")

def get_tracer():
    """비즈니스 노드(graph.py, vector_service.py)에서 커스텀 스판을 선언할 때 호출합니다."""
    return trace.get_tracer(__name__)