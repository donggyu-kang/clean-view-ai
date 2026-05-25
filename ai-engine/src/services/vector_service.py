import os
import logging
from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.document import DocumentChunk
from src.core.otel import get_tracer 

# 로깅 및 트레이서 설정
logger = logging.getLogger(__name__)
tracer = get_tracer()

class VectorService:
    """
    pgvector를 사용하여 벡터 데이터의 저장 및 크로스 세션 유사도 검색을 수행하는 서비스.
    사용자의 전방위적 채팅방 기억을 검색하되, 출처를 투명하게 분류합니다.
    """

    async def upsert_document_chunks(
        self, 
        db: AsyncSession, 
        texts: List[str], 
        vectors: List[List[float]], 
        user_id: str,
        session_id: int,
        trace_id: Optional[str] = None,
        metadata_list: Optional[List[Dict[str, Any]]] = None
    ) -> None:
        """
        텍스트 조각과 그에 대응하는 임베딩 벡터를 특정 채팅방(session_id) 명세로 DB에 저장
        """
        try:
            chunks = []
            for i, (text, vector) in enumerate(zip(texts, vectors)):
                meta = metadata_list[i] if metadata_list else {}
                
                chunk = DocumentChunk(
                    content=text,
                    embedding=vector, 
                    user_id=user_id,
                    session_id=session_id,
                    trace_id=trace_id,
                    metadata_json=meta
                )
                chunks.append(chunk)
            
            db.add_all(chunks)
            await db.commit()
            logger.info(f"세션 {session_id}: {len(chunks)}개의 기억 조각 저장 완료.")
            
        except Exception as e:
            await db.rollback()
            logger.error(f"지식 저장 중 오류 발생: {str(e)}")
            raise e

    async def search_similar_chunks(
        self, 
        db: AsyncSession, 
        query_vector: List[float], 
        user_id: str,
        current_session_id: int,                     # 현재 질문이 들어온 채팅방 ID
        allowed_session_ids: Optional[List[int]] = None, # 유저가 보유한 전체 채팅방 ID 목록 (Spring Boot 연동)
        excluded_session_ids: Optional[List[int]] = None,
        limit: int = int(os.getenv("VECTOR_SEARCH_LIMIT", 3)),
        min_similarity: float = float(os.getenv("VECTOR_MIN_SIMILARITY", 0.72))
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        사용자 질문과 유사한 과거 기억을 검색하되, 허용된 모든 세션(채팅목록)을 대상으로 함.
        어떤 세션에서 인출되었는지 출처를 구분하여 계보 추적 지표를 생성합니다.
        """
        with tracer.start_as_current_span("vector_db_retrieval") as span:
            try:
                span.set_attribute("db.retrieval.user_id", user_id)

                distance_fn = DocumentChunk.embedding.cosine_distance(query_vector)
                similarity_score = (1 - distance_fn).label("similarity_score")

                # [이중 잠금 1단계] 타인의 기억은 연산 조차 안 되도록 user_id 필터를 상단에 강제 배치
                query = (
                    select(DocumentChunk, similarity_score)
                    .filter(DocumentChunk.user_id == user_id) 
                )
                
                # [이중 잠금 2단계] 내 기억들 중에서, 유저가 보유한 채팅 세션 리스트 안에서만 크로스 검색 허용
                if allowed_session_ids:
                    query = query.filter(DocumentChunk.session_id.in_(allowed_session_ids))

                # 블랙리스트 제외 처리 수행
                # SQLAlchemy의 notin_ 연산자를 이용하여 차단된 방의 지식 조각은 완전히 제외
                if excluded_session_ids:
                    query = query.filter(DocumentChunk.session_id.notin_(excluded_session_ids))

                query = (
                    query.filter(similarity_score >= min_similarity)
                    .order_by(similarity_score.desc())
                    .limit(limit)
                )

                result = await db.execute(query)
                rows = result.all()

                # 4. 결과 지표 추출 및 '출처 세션' 동적 판별 알고리즘
                scores = []
                source_sessions = []
                
                for row in rows:
                    chunk = row[0]  # DocumentChunk 객체
                    score = float(row.similarity_score)
                    scores.append(score)
                    
                    # [설계 반영] 현재 방에서 나온 기억인지, 타 세션방에서 빌려온 기억인지 라벨링
                    if chunk.session_id == current_session_id:
                        source_sessions.append("current")
                    else:
                        source_sessions.append("other")

                # 5. OpenTelemetry 결과 속성 세팅 
                span.set_attribute("db.retrieval.hit_count", len(scores))
                span.set_attribute("db.retrieval.scores", scores)
                span.set_attribute("db.retrieval.source_sessions", source_sessions) # 예: ["current", "other", "other"]

                return rows
                
            except Exception as e:
                span.record_exception(e)
                logger.error(f"벡터 검색 중 오류 발생: {str(e)}")
                raise e

# 싱글톤 인스턴스 생성
vector_service = VectorService()