import logging
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.otel import setup_otel
from src.db.session import get_db
from src.api.router import api_router

# 1. 로깅 설정: 애플리케이션 전반의 로그를 관리합니다.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# 2. FastAPI 앱 초기화
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CleanViewAI - AI의 기억을 투명하게 추적하는 RAG 엔진 (Glass-box AI)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

setup_otel(app)

# 3. 통합 라우터 등록
# 모든 비즈니스 API는 /api 접두사 아래에 위치하게 됩니다 (예: /api/v1/chat/ask)
app.include_router(api_router, prefix="/api")

# =================================================================
# 4. K3s 인프라 및 가용성 확인 API (Health Probes 레이어)
# =================================================================

@app.get("/health/live", tags=["Infrastructure"], status_code=status.HTTP_200_OK)
async def liveness_check():
    """
    K3s Liveness Probe 전용 엔드포인트
    - 애플리케이션 프로세스가 정상 작동 중인지 프로세스 생존 여부만 가볍게 확인합니다.
    - 외부 인프라(DB 등)가 일시적으로 끊겨도 애플리케이션 자체를 강제 재시작하지 않도록 격리합니다.
    """
    return {"status": "alive", "service": settings.OTEL_SERVICE_NAME}


@app.get("/health/ready", tags=["Infrastructure"], status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    K3s Readiness Probe 전용 엔드포인트
    - FastAPI 엔진이 핵심 저장소인 pgvector DB에 정상 접근 가능한지 체크합니다.
    - 연결 실패 시 명시적으로 503 에러를 던져, K3s가 해당 Pod를 서비스 로드밸런서(Ingress) 라우팅에서 즉시 제외시키도록 유도합니다.
    """
    try:
        # DB 연결 확인을 위한 최소 비용의 커넥션 검증 쿼리 실행
        await db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "service": settings.OTEL_SERVICE_NAME
        }
    except Exception as e:
        logger.error(f"Readiness check failed (Database disconnected): {str(e)}")
        # 🎯 [핵심 보정]: K3s 오케스트레이터가 감지할 수 있도록 HTTP 503 에러 코드를 강제 송출합니다.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database disconnected. Engine is not ready to accept traffic."
        )

@app.get("/", tags=["Root"])
async def root():
    """서버 접속 확인용 루트 엔드포인트"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": "1.0.0",
        "documentation": "/docs"
    }
