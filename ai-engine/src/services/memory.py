import logging
import uuid
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.graph import rag_engine
from src.services.embedding import embedding_service
from src.services.vector_service import vector_service

# 로깅 설정
logger = logging.getLogger(__name__)

class MemoryService:
    """
    사용자의 질문에 대해 추론을 실행하고, 
    그 결과를 다시 장기 기억으로 저장하는 피드백 루프를 관리
    """

    async def process_chat(
        self, 
        db: AsyncSession, 
        question: str, 
        session_id: str
    ) -> Dict[str, Any]:
        """
        1. LangGraph 추론 엔진 가동
        2. 답변 및 참조 문헌 획득
        3. (피드백 루프) 생성된 답변을 벡터 DB에 저장
        """
        # A. 고유 추적 ID 생성 (Glass-box 시각화의 핵심)
        trace_id = f"trace-{uuid.uuid4().hex[:10]}"
        
        try:
            # B. LangGraph 실행 (Retrieve -> Generate)
            # 초기 상태(State) 주입
            initial_state = {
                "question": question,
                "session_id": session_id,
                "db": db,
                "trace_id": trace_id,
                "context": None,
                "answer": None,
                "references": []
            }

            logger.info(f"[{trace_id}] LangGraph 추론 엔진 시작")
            final_state = await rag_engine.ainvoke(initial_state)

            # C. 생성된 답변을 미래를 위한 '기억'으로 저장 (Feedback Loop)
            # 이 과정을 거쳐야 다음 질문에서 AI가 이 답변을 참고할 수 있음
            await self._record_as_memory(
                db=db,
                text=final_state["answer"],
                session_id=session_id,
                trace_id=trace_id
            )

            return {
                "answer": final_state["answer"],
                "references": final_state["references"],
                "trace_id": trace_id
            }

        except Exception as e:
            logger.error(f"[{trace_id}] 채팅 프로세스 중 오류 발생: {str(e)}")
            raise e

    async def _record_as_memory(
        self, 
        db: AsyncSession, 
        text: str, 
        session_id: str, 
        trace_id: str
    ) -> None:
        """AI의 답변을 벡터화하여 장기 기억 저장소에 보관"""
        try:
            # 1. 답변 텍스트 임베딩 생성
            vector = await embedding_service.get_embedding(text)
            
            # 2. 벡터 DB 저장
            await vector_service.upsert_document_chunks(
                db=db,
                texts=[f"AI의 이전 답변: {text}"], # 문맥 식별을 위한 접두어 추가
                vectors=[vector],
                session_id=session_id,
                trace_id=trace_id,
                metadata_list=[{"role": "assistant", "type": "feedback_loop"}]
            )
            logger.info(f"[{trace_id}] AI의 답변이 장기 기억으로 저장되었습니다.")
            
        except Exception as e:
            # 메모리 저장 실패가 전체 답변 반환을 막지 않도록 예외를 로깅만 하고 통과시킬 수 있음
            logger.error(f"기억 저장 실패 (비중요): {str(e)}")

# 전역 인스턴스 생성
memory_service = MemoryService()