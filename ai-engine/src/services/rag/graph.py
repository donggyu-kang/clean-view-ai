import logging
from typing import List, Dict, Any, TypedDict, Optional
from langgraph.graph import StateGraph, END
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.embedding import embedding_service
from src.services.vector_service import vector_service
from src.services.rag.chains import rag_chain
from src.utils.parser import parse_answer_to_segments

# 로깅 설정
logger = logging.getLogger(__name__)

# 1. 그래프 상태(State) 정의
# 노드 간에 공유될 데이터의 구조를 정의합니다.
class RAGState(TypedDict):
    question: str                    # 사용자의 실시간 질문 메시지
    #[1차 방화벽] 멀티테넌시 보안을 위한 마스터 키
    user_id: str                     
    #[타입 동기화] Spring Boot 엔티티와 싱크를 맞춘 정수형 현재 방 식별자
    current_session_id: int          
    #[2차 맥락 필터] 유저 소유의 전체 채팅 세션방 숫자 목록
    allowed_session_ids: List[int]   
    db: AsyncSession                 # 결정론적 커넥션 풀을 타는 비동기 DB 세션
    context: Optional[str]           # 지식 쿼리를 통해 인출 및 증감된과거 기억 텍스트 원문
    answer: Optional[str]            # Gemini LLM이 도출해 낸 최종 답변

    segments: List[Dict[str, Any]]   # 하이라이트 팝업 매핑용 문장 단위 슬라이싱 세그먼트 배열

    references: List[Dict[str, Any]] # 프론트 단의 기억 카드 팝업을 그리기 위한 하위 패킷 리스트
    trace_id: Optional[str]          # OpenTelemetry 추적 컨텍스트 ID

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
        user_id=state["user_id"],                         # 1차 보안 잠금 장착
        current_session_id=state["current_session_id"],   # 정수형 스위칭 연동
        allowed_session_ids=state["allowed_session_ids"],
        limit=3
    )
    
    # 검색 결과 가공
    context_parts = []
    refs = []
    
    #[핵심 변경]: enumerate를 사용하여 인출된 기억 조각에 1부터 순서대로 번호표를 강제 부여
    for idx, (chunk, score) in enumerate(search_results, start=1):
        # LLM이 인덱스를 명확히 식별할 수 있도록 포맷팅 가공하여 주입
        context_parts.append(f"[기억 조각 {idx}]\n내용: {chunk.content}")
        
        # 프론트엔드 응답용 매핑 배열 저장 (여기서 session_id는 정수형으로 가볍게 전송)
        refs.append({
            "id": chunk.id,                
            "session_id": chunk.session_id, # int형 동기화 완료
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

    # 2. [핵심 추가]: 도출된 answer 원문과 retrieve 단계에서 넘어온 refs 정보를 대조하여 
    # 프론트 단에서 밑줄을 칠 수 있는 문장 단위 하이라이트 맵(`segments`)을 정밀 빌드
    calculated_segments = parse_answer_to_segments(
        answer=answer,
        retrieved_refs=state["references"]
    )
    
    return {
        "answer": answer,
        "segments": calculated_segments
    }

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