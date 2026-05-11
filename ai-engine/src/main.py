from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.core.config import settings
from src.db.session import get_db
from src.services.embedding import embedding_service
from typing import List
import google.generativeai as genai

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

@app.get("/test/embedding")
async def test_embedding(q: str = "안녕하세요, CleanViewAI 테스트입니다."):
    """
    Gemini API를 통해 텍스트를 벡터로 변환하는지 테스트합니다.
    """
    try:
        vector = await embedding_service.get_embedding(q)
        return {
            "input_text": q,
            "vector_length": len(vector),  # 768이어야 함
            "preview": vector[:5],         # 앞부분 5개 숫자만 샘플로 확인
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/test/list-models")
async def list_models():
    """사용 가능한 임베딩 모델 목록을 출력합니다."""
    models = [m.name for m in genai.list_models() if 'embedContent' in m.supported_generation_methods]
    return {"available_embedding_models": models}

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}