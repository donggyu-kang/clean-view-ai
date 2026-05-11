from fastapi import FastAPI, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.core.config import settings
from src.db.session import get_db
from src.services.embedding import embedding_service
from typing import List
import google.generativeai as genai
from src.services.vector_service import vector_service
import uuid
import logging

logger = logging.getLogger(__name__)

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


@app.get("/test/rag-flow")
async def test_rag_flow(
    q: str = Query(..., description="기억할 문장을 입력하세요."),
    session_id: str = "test_user_session",
    db: AsyncSession = Depends(get_db)
):
    """
    RAG 전체 프로세스 테스트:
    1. 텍스트 임베딩 생성 (Gemini)
    2. 벡터 DB 저장 (pgvector)
    3. 저장된 데이터 기반 유사도 검색 수행
    """
    try:
        # Step 1: 텍스트 -> 768차원 벡터 변환
        logger.info(f"Step 1: 임베딩 생성 시작 - {q}")
        vector = await embedding_service.get_embedding(q)
        
        # Step 2: DB에 저장 (Glass-box를 위한 trace_id 포함)
        test_trace_id = f"test-trace-{uuid.uuid4().hex[:8]}"
        logger.info(f"Step 2: DB 저장 시작 (trace_id: {test_trace_id})")
        await vector_service.upsert_document_chunks(
            db=db,
            texts=[q],
            vectors=[vector],
            session_id=session_id,
            trace_id=test_trace_id
        )
        
        # Step 3: 방금 저장한 내용 검색 테스트
        logger.info("Step 3: 유사도 검색 수행")
        search_results = await vector_service.search_similar_chunks(
            db=db,
            query_vector=vector,
            session_id=session_id,
            limit=3
        )

        # 결과 가공
        retrieved_memories = []
        for chunk, score in search_results:
            retrieved_memories.append({
                "content": chunk.content,
                "similarity": round(float(score), 4),
                "trace_id": chunk.trace_id
            })

        return {
            "status": "success",
            "process": "Embedding -> Storage -> Retrieval",
            "input": q,
            "saved_trace_id": test_trace_id,
            "search_results": retrieved_memories
        }

    except Exception as e:
        logger.error(f"RAG 테스트 중 오류 발생: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}