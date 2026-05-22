from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class DocumentBase(BaseModel):
    """문서(기억 조각)의 공통 속성"""
    content: str = Field(..., description="기억 조각의 실제 텍스트 내용")
    session_id: str = Field(..., description="해당 기억이 속한 세션 ID")
    metadata_json: Optional[Dict[str, Any]] = Field(None, description="추가 메타데이터 (출처, 날짜 등)")

class DocumentCreate(DocumentBase):
    """새로운 지식을 저장(Ingestion)할 때 사용하는 규격"""
    pass

class DocumentReference(DocumentBase):
    """
    AI 답변 시 참고한 근거 자료를 프론트엔드에 전달할 때 사용하는 규격.
    '유리병 AI' 시각화를 위한 핵심 데이터가 포함됩니다.
    """
    id: int = Field(..., description="기억 조각의 고유 식별자")
    similarity: float = Field(..., description="질문과의 유사도 점수 (0.0 ~ 1.0)")
    trace_id: Optional[str] = Field(None, description="해당 기억이 생성/사용된 추적 ID")
    created_at: datetime = Field(..., description="기억 저장 시점")

    class Config:
        from_attributes = True # SQLAlchemy 모델 객체를 Pydantic 객체로 자동 변환