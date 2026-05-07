from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.core.config import settings
from src.db.session import get_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="CleanViewAI - AI의 기억을 투명하게 추적하는 RAG 엔진",
    version="1.0.0"
)

@app.get("/health", tags=["Infrastructure"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    시스템 상태 확인 API
    - DB 연결 상태를 확인하여 결정론적 쿼터 할당이 정상 작동하는지 체크
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
        return {
            "status": "unhealthy",
            "database": str(e)
        }

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}