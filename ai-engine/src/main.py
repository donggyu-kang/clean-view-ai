import logging
from fastapi import FastAPI, Depends
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

# 4. 인프라 및 상태 확인 API (Health Check)
@app.get("/health", tags=["Infrastructure"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    시스템 상태 확인 API
    - DB 연결 상태를 확인하여 서비스 가용성을 체크합니다.
    - 인프라 모니터링 및 로드밸런서의 상태 확인용으로 사용됩니다.
    """
    try:
        # DB 연결 확인을 위한 간단한 쿼리 실행
        await db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "service": settings.OTEL_SERVICE_NAME
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

@app.get("/", tags=["Root"])
async def root():
    """서버 접속 확인용 루트 엔드포인트"""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": "1.0.0",
        "documentation": "/docs"
    }
