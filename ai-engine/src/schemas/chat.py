from pydantic import BaseModel, Field
from typing import List, Optional
from src.schemas.document import DocumentReference

class SentenceSegment(BaseModel):
    """프론트엔드가 답변의 문장별 밑줄 및 하이라이팅을 렌더링하기 위한 데이터 묶음 규격"""
    text: str = Field(..., description="분할된 문장 또는 어구 텍스트 원문")
    has_citation: bool = Field(..., description="해당 문장이 과거 기억을 인용한 근거 문장인지 여부")
    ref_id: Optional[int] = Field(None, description="인용한 경우 매핑되는 실제 기억 조각(Chunk)의 고유 식별자 ID")
    session_id: Optional[int] = Field(None, description="인용한 경우 해당 과거 기억이 속했던 출처 방 숫자 ID")

class ChatRequest(BaseModel):
    """
    사용자의 채팅 요청 규격 (Spring Boot 게이트웨이 연동 명세)
    이중 잠금 아키텍처에 대응하여 최상위 격리를 위한 user_id와 
    크로스 세션 조회를 위한 allowed_session_ids 리스트가 추가
    """
    message: str = Field(..., min_length=1, description="AI에게 보낼 사용자의 질문 메시지")
    session_id: int = Field(..., description="현재 질문이 발생한 실시간 채팅방 식별자")
    
    # [1차 방화벽] 사용자 간 데이터 침범을 물리적으로 격리하는 마스터 키
    user_id: str = Field(..., description="유저 간 멀티테넌시 보안 격리를 위한 사용자 고유 ID")
    
    # [2차 맥락 필터] 사이드바에 표시된 유저 소유의 전체 채팅목록
    allowed_session_ids: List[int] = Field(
        default_factory=list, 
        description="과거 기억 탐색을 허용할 현재 유저의 전체 채팅 세션방 ID 리스트"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "오늘 아침 식단 추천해줘",
                "session_id": 1,
                "user_id": "user_charlie_99",
                "allowed_session_ids": [1, 2, 3]
            }
        }
    }

class ChatResponse(BaseModel):
    """
    AI의 답변 및 근거 정보를 포함하는 응답 규격
    '유리병 AI' 시각화와 출처 하이라이팅을 위한 핵심 데이터셋입니다.
    """
    answer: str = Field(..., description="AI가 생성한 최종 답변 텍스트")
    trace_id: str = Field(..., description="Jaeger 등에서 답변 생성 과정을 역추적하기 위한 OpenTelemetry Trace ID")
    
    segments: List[SentenceSegment] = Field(
        default_factory=list,
        description="답변 문장들을 쪼개어 출처 바인딩 여부를 마킹해 둔 하이라이팅 렌더링용 배열 세트"
    )

    # 설계도 기준: 답변의 근거가 된 기억 조각들의 리스트 (프론트 단의 카드 팝업 바인딩용)
    references: List[DocumentReference] = Field(
        default_factory=list, 
        description="답변 생성에 참고하여 프론트 단에 하이라이트 및 카드로 노출할 장기 기억(Chunk) 리스트"
    )

    model_config = {
        "from_attributes": True, # SQLAlchemy ORM 객체(rows)에서 DTO로 자동 매핑 전환 지원
        "json_schema_extra": {
            "example": {
                "answer": "고단백 식단으로 닭가슴살 샐러드를 추천합니다. 평소 공부하시느라 앉아있는 시간이 기시니 아침은 가볍게 드시는 것이 좋습니다.",
                "trace_id": "otel-trace-uuid-1234",
                "references": [
                    {
                        "id": 1054,
                        "content": "저는 백엔드 개발자 직무를 준비하느라 하루 종일 앉아있는 시간이 깁니다.",
                        "similarity": 0.91,
                        "session_id": 2,  # 출처 라벨링용: 현재방(room_diet_01)과 달라 프론트에서 'other'로 밑줄 시각화
                        "created_at": "2026-05-20T10:00:00"
                    }
                ]
            }
        }
    }