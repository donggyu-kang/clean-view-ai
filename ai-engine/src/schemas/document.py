from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    """
    문서(기억 조각)의 공통 속성 규격
    식별자인 session_id(int)만 깔끔하게 Spring Boot에 보냄
    """
    content: str = Field(..., description="기억 조각의 실제 텍스트 내용")
    
    # Spring Boot가 매핑을 완벽히 대행해주므로, 숫자 ID만 전달
    session_id: int = Field(..., description="해당 기억 조각이 속한 숫자형 세션방 ID (Spring에서 Title로 치환)")

class DocumentCreate(DocumentBase):
    metadata_json: Optional[Dict[str, Any]] = None

class DocumentReference(DocumentBase):
    """
    AI 답변 완료 후, 참고한 근거 지식을 Spring Boot에 전달하는 다이어트 규격.
    여기서 session_id(int)를 받은 Spring Boot가 자바 단에서 실제 방 제목으로 갈아 끼워 프론트에 내려줌
    """
    id: int = Field(..., description="기억 조각 레코드의 고유 일련번호 (블랙리스트 차단 제어용 마스터 키)")
    similarity: float = Field(..., description="사용자 질문 벡터와 해당 과거 기억 간의 코사인 유사도 점수 (0.0 ~ 1.0)")
    trace_id: Optional[str] = Field(None, description="분산 추적 타인라인을 엮기 위한 OpenTelemetry Trace ID")
    created_at: datetime = Field(..., description="과거 대화 발생 시점 (UI의 날짜 시각화용)")

    model_config = {
        "from_attributes": True
    }