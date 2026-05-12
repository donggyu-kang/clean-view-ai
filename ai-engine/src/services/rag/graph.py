import logging
from typing import List, Dict, Any, TypedDict, Optional
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.embedding import embedding_service
from src.services.vector_service import vector_service
from src.services.rag.chains import rag_chain

# 로깅 설정
logger = logging.getLogger(__name__)

# 1. 그래프 상태(State) 정의
# 노드 간에 공유될 데이터의 구조를 정의합니다.
class RAGState(TypedDict):
    question: str           # 사용자의 질문
    session_id: str         # 세션 ID (데이터 격리 및 검색용)
    db: AsyncSession        # 데이터베이스 세션
    context: Optional[str]  # 검색된 과거 기억 텍스트
    answer: Optional[str]   # AI가 생성한 최종 답변
    references: List[Dict[str, Any]] # 시각화에 필요한 참고 문헌 정보
    trace_id: Optional[str] # 추적을 위한 ID

# 2. 노드(Node) 구현: 기억 인출 (Retrieve)
async def retrieve_node(state: RAGState):
    """질문의 의미를 파악하여 DB에서 관련 기억을 가져옵니다."""
    logger.info(f"[{state.get('trace_id')}] 기억 인출 노드 시작")
    
    # 질문 임베딩 생성
    query_vector = await embedding_service.get_embedding(state["question"])
    
    # 유사한 기억 조각 검색 (Issue #5에서 만든 VectorService 활용)
    search_results = await vector_service.search_similar_chunks(
        db=state["db"],
        query_vector=query_vector,
        session_id=state["session_id"],
        limit=3
    )
    
    # 검색 결과 가공
    context_parts = []
    refs = []
    for chunk, score in search_results:
        context_parts.append(chunk.content)
        refs.append({
            "id": chunk.id,                
            "session_id": chunk.session_id,
            "content": chunk.content,
            "similarity": float(score),
            "trace_id": chunk.trace_id,
            "created_at": chunk.created_at
        })
    
    # 다음 노드로 전달할 상태 업데이트
    return {
        "context": "\n\n".join(context_parts) if context_parts else "관련된 기억이 없습니다.",
        "references": refs
    }

# 3. 노드(Node) 구현: 답변 생성 (Generate)
async def generate_node(state: RAGState):
    """가져온 기억과 질문을 바탕으로 답변을 생성합니다."""
    logger.info(f"[{state.get('trace_id')}] 답변 생성 노드 시작")
    
    # RAGChain을 호출하여 최종 답변 도출
    answer = await rag_chain.ainvoke(
        question=state["question"],
        context=state["context"]
        # 필요 시 state에서 history를 추출하여 전달할 수 있습니다.
    )
    
    return {"answer": answer}

# 4. 그래프 구성 (Graph Construction)
def build_rag_graph():
    """노드와 엣지를 연결하여 전체 추론 워크플로우를 완성합니다."""
    
    workflow = StateGraph(RAGState)

    # 노드 추가
    workflow.add_node("retrieve", retrieve_node)
    workflow.add_node("generate", generate_node)

    # 엣지 연결: retrieve가 끝나면 무조건 generate로 진행
    workflow.set_entry_point("retrieve")
    workflow.add_edge("retrieve", "generate")
    workflow.add_edge("generate", END)

    # 그래프 컴파일
    return workflow.compile()

# 전역에서 사용할 추론 엔진 인스턴스
rag_engine = build_rag_graph()