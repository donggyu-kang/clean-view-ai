import logging
from typing import List, Tuple, Dict, Any, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.document import DocumentChunk
from src.core.otel import get_tracer 

# 로깅 설정
logger = logging.getLogger(__name__)
tracer = get_tracer()

class VectorService:
    """
    pgvector를 사용하여 벡터 데이터의 저장 및 유사도 검색을 수행하는 서비스
    RAG(Retrieval-Augmented Generation) 파이프라인의 핵심 엔진 역할
    """

    async def upsert_document_chunks(
        self, 
        db: AsyncSession, 
        texts: List[str], 
        vectors: List[List[float]], 
        session_id: str,
        trace_id: Optional[str] = None,
        metadata_list: Optional[List[Dict[str, Any]]] = None
    ) -> None:
        """
        텍스트 조각과 그에 대응하는 임베딩 벡터를 DB에 저장
        '유리병 AI'를 위해 trace_id를 함께 기록
        """
        try:
            chunks = []
            for i, (text, vector) in enumerate(zip(texts, vectors)):
                # 메타데이터가 있으면 가져오고 없으면 빈 딕셔너리
                meta = metadata_list[i] if metadata_list else {}
                
                chunk = DocumentChunk(
                    content=text,
                    embedding=vector, # 768차원 벡터
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
        session_id: str, 
        limit: int = 3,
        min_similarity: float = 0.7
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        사용자 질문(벡터)과 가장 유사한 과거 기억을 검색
        pgvector의 '<=>' 연산자를 사용하여 코사인 거리를 계산
        """
        with tracer.start_as_current_span("vector_db_retrieval") as span:
            try:
                # 입력 속성 기록
                span.set_attribute("db.retrieval.top_k", limit)
                span.set_attribute("db.retrieval.session_id", session_id)

                # 1. 코사인 거리(Cosine Distance) 계산
                # pgvector: <=> 연산자는 코사인 거리를 반환 (0: 일치, 2: 정반대)
                distance_fn = DocumentChunk.embedding.cosine_distance(query_vector)
                
                # 2. 유사도 점수 변환 (1 - distance) -> 1.0에 가까울수록 유사함
                similarity_score = (1 - distance_fn).label("similarity_score")

                # 3. 쿼리 구성: 특정 세션 내에서 유사도가 높은 순으로 검색
                query = (
                    select(DocumentChunk, similarity_score)
                    .filter(DocumentChunk.session_id == session_id)
                    .filter(similarity_score >= min_similarity) # 일정 수준 이상의 결과만 채택
                    .order_by(similarity_score.desc())
                    .limit(limit)
                )

                result = await db.execute(query)
                rows = result.all()

                # 결과 속성 기록 [설계 2단계 반영]
                scores = [float(row.similarity_score) for row in rows]
                span.set_attribute("db.retrieval.hit_count", len(scores))
                span.set_attribute("db.retrieval.scores", scores)
                
                # 각 청크가 현재 세션에서 왔는지 여부 (로직상 현재는 모두 current)
                span.set_attribute("db.retrieval.source_sessions", ["current"] * len(scores))

                return rows
                
            except Exception as e:
                span.record_exception(e)
                logger.error(f"벡터 검색 중 오류 발생: {str(e)}")
                raise e

# 싱글톤 인스턴스 생성
vector_service = VectorService()