import logging
import uuid
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.rag.graph import rag_engine
from src.services.embedding import embedding_service
from src.services.vector_service import vector_service
from langchain_text_splitters import RecursiveCharacterTextSplitter

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
        user_id: str,                                # 1차 방화벽 유저 ID 인수 주입
        current_session_id: int,                     # str -> int 동기화 (현재 채팅방 식별자)
        allowed_session_ids: List[int]
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
                "user_id": user_id,                          # 상태 맵에 보안 키 장착
                "current_session_id": current_session_id,     # 정수형 타입 동기화 주입
                "allowed_session_ids": allowed_session_ids,
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
                user_id=user_id,                             # 보안 격리 저장 강제
                session_id=current_session_id,               # 정수형(int)으로 이전 답변 적재
                trace_id=trace_id
            )

            return {
                "answer": final_state["answer"],
                "references": final_state["references"],
                "segments": final_state.get("segments", []),
                "trace_id": trace_id
            }

        except Exception as e:
            logger.error(f"[{trace_id}] 채팅 프로세스 중 오류 발생: {str(e)}")
            raise e

    async def _record_as_memory(
        self, 
        db: AsyncSession, 
        text: str, 
        user_id: str,                                
        session_id: int,
        trace_id: str
    ) -> None:
        """AI의 답변을 벡터화하여 장기 기억 저장소에 보관"""
        try:
            # 1. 가이드라인 준수: 의미론적 텍스트 분할기 세팅
            # 글자 수 기준이 아니라 문단(\n\n), 문장(\n), 공백 순으로 안전하게 쪼갭니다.
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=300,       # 한 조각당 글자 수 타겟을 줄여 정밀도 향상
                chunk_overlap=50      # 앞뒤 조각을 50자씩 겹쳐 문맥 단절 방지 (Overlap 15~20% 준수)
            )
            
            # 장문의 답변을 여러 개의 작은 청크 리스트로 분할
            child_chunks = text_splitter.split_text(text)
            
            logger.info(f"[{trace_id}] 장문 답변을 {len(child_chunks)}개의 핵심 의미 조각으로 슬라이싱했습니다.")

            # 2. 각 조각별로 루프를 돌며 개별 임베딩 생성 및 파이프라인 적재
            texts_to_save = []
            vectors_to_save = []
            
            for chunk_text in child_chunks:
                # 문맥 식별 접두사 결합
                formatted_text = f"AI의 이전 답변 조각: {chunk_text}"
                
                # 각각 벡터화 실행
                vector = await embedding_service.get_embedding(formatted_text)
                
                texts_to_save.append(formatted_text)
                vectors_to_save.append(vector)
            
            # 3. 고속 일괄(Bulk) Vector DB 저장 실행
            await vector_service.upsert_document_chunks(
                db=db,
                texts=texts_to_save,
                vectors=vectors_to_save,
                user_id=user_id,
                session_id=session_id,
                trace_id=trace_id,
                metadata_list=[{"role": "assistant", "type": "feedback_loop"} for _ in child_chunks]
            )
            logger.info(f"[{trace_id}] {len(texts_to_save)}개의 다이어트 청크가 유저 {user_id}의 뉴런 저장소에 안착했습니다.")
            
        except Exception as e:
            # 메모리 저장 실패가 전체 답변 반환을 막지 않도록 예외를 로깅만 하고 통과시킬 수 있음
            logger.error(f"기억 저장 실패 (비중요): {str(e)}")

# 전역 인스턴스 생성
memory_service = MemoryService()