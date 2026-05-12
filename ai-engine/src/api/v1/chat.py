import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_db
from src.schemas.chat import ChatRequest, ChatResponse
from src.services.memory import memory_service

# 로깅 설정
logger = logging.getLogger(__name__)

# API 라우터 설정 (태그를 지정하여 Swagger UI에서 그룹화)
router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post(
    "/ask", 
    response_model=ChatResponse, 
    status_code=status.HTTP_200_OK,
    summary="AI에게 질문하기 (RAG 기반)",
    description="사용자의 질문에 대해 과거 기억을 검색하고, Gemini LLM을 통해 투명한 답변을 생성합니다."
)
async def ask_question(
    request: ChatRequest, 
    db: AsyncSession = Depends(get_db)
):
    """
    RAG 추론 프로세스를 실행하고 답변 및 참고 문헌을 반환합니다.
    """
    logger.info(f"질문 수신 - 세션: {request.session_id}, 메시지: {request.message[:20]}...")

    try:
        # MemoryService를 통해 전체 RAG 사이클 실행
        # (기억 인출 -> 답변 생성 -> 답변 재저장)
        result = await memory_service.process_chat(
            db=db,
            question=request.message,
            session_id=request.session_id
        )

        # 결과 반환 (Issue #3에서 정의한 ChatResponse 규격 준수)
        return ChatResponse(
            answer=result["answer"],
            references=result["references"],
            trace_id=result["trace_id"]
        )

    except Exception as e:
        logger.error(f"채팅 처리 중 에러 발생: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI 엔진 내부에서 오류가 발생했습니다. 로그를 확인해주세요."
        )