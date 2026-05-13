import os
import logging
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.logging import LoggingInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

from src.db.session import engine
from src.core.config import settings

# 로깅 설정
logger = logging.getLogger(__name__)

def setup_otel(app):
    """
    OpenTelemetry 설정을 초기화하고 FastAPI 앱에 인스트루멘테이션을 적용
    """
    # 1. 리소스 정의 (서비스 이름 및 속성)
    resource = Resource.create({
        "service.name": settings.OTEL_SERVICE_NAME,
        "deployment.environment": "development"
    })

    # 2. TracerProvider 설정
    provider = TracerProvider(resource=resource)
    
    # 3. OTLP Exporter 설정 (Jaeger의 OTLP 수신 포트는 보통 4317)
    # 환경 변수나 config에서 JAEGER_ENDPOINT를 가져옴
    jaeger_endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317")
    
    otlp_exporter = OTLPSpanExporter(endpoint=jaeger_endpoint, insecure=True)
    
    # 4. Span Processor 추가 (Batch 처리가 성능상 유리함)
    span_processor = BatchSpanProcessor(otlp_exporter)
    provider.add_span_processor(span_processor)

    # 5. 전역 Tracer 설정
    trace.set_tracer_provider(provider)

    # 6. FastAPI 자동 계측 적용
    # 이 설정만으로 모든 HTTP 요청의 시작과 끝이 자동으로 추적됨
    FastAPIInstrumentor.instrument_app(app)

    # Logging 계측: 애플리케이션 로그를 Trace ID와 연결
    # 이제 로그 출력 시 [trace_id=...] 가 자동으로 붙어 Jaeger에서 로그를 함께 볼 수 있음
    LoggingInstrumentor().instrument(set_logging_format=True)

    # SQLAlchemy 계측: pgvector DB 쿼리 속도 추적
    # "기억 인출" 노드에서 DB를 뒤지는 시간을 정확히 측정
    SQLAlchemyInstrumentor().instrument(engine=engine.sync_engine)
    
    logger.info(f"OpenTelemetry가 설정되었습니다. 서비스명: {settings.OTEL_SERVICE_NAME}")

def get_tracer():
    """커스텀 Span을 만들기 위한 tracer 객체를 반환합니다."""
    return trace.get_tracer(__name__)