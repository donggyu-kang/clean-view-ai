from pydantic import BaseModel, Field
from typing import List, Optional
from src.schemas.document import DocumentReference

class ChatRequest(BaseModel):
    """
    사용자의 채팅 요청 규격
    """
    message: str = Field(..., min_length=1, description="AI에게 보낼 사용자의 질문 메시지")
    session_id: str = Field(..., description="대화 흐름을 유지하기 위한 세션 식별자")

    model_config = {
        "json_schema_extra": {
            "example": {
                "message": "오늘 아침 식단 추천해줘",
                "session_id": "user_1234_session_01"
            }
        }
    }

class ChatResponse(BaseModel):
    """
    AI의 답변 및 근거 정보를 포함하는 응답 규격
    '유리병 AI' 시각화를 위한 핵심 데이터셋입니다.
    """
    answer: str = Field(..., description="AI가 생성한 최종 답변 텍스트")
    trace_id: str = Field(..., description="Jaeger 등에서 답변 생성 과정을 추적하기 위한 ID")
    
    # 설계도 기준: 답변의 근거가 된 기억 조각들의 리스트
    references: List[DocumentReference] = Field(
        default_factory=list, 
        description="답변 생성에 참고한 장기 기억(Chunk) 리스트"
    )

    model_config = {
        "from_attributes": True, # SQLAlchemy 모델에서 자동으로 변환 지원
        "json_schema_extra": {
            "example": {
                "answer": "고단백 식단으로 닭가슴살 샐러드를 추천합니다.",
                "trace_id": "otel-trace-uuid-1234",
                "references": [
                    {
                        "id": 1,
                        "content": "사용자는 평소 운동 후 고단백 식사를 선호함",
                        "similarity": 0.92,
                        "session_id": "user_1234_session_01",
                        "created_at": "2024-05-20T10:00:00"
                    }
                ]
            }
        }
    }