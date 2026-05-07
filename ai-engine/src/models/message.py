from sqlalchemy import Column, Integer, Text, String, DateTime
from sqlalchemy.sql import func
from src.models.base import Base

class ChatMessage(Base):
    """
    사용자와 AI 간의 대화 이력을 저장하는 테이블 모델
    """
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # 세션 관리: 특정 대화방을 식별합니다.
    session_id = Column(String(100), index=True, nullable=False)
    
    # 역할 구분: 'user' 또는 'assistant'
    role = Column(String(20), nullable=False)
    
    # 메시지 본문
    content = Column(Text, nullable=False)
    
    # 추적 ID: AI 답변의 경우, 답변 생성 시의 OTel Trace ID를 기록합니다. (Glass-box 핵심)
    trace_id = Column(String(100), nullable=True)
    
    # 생성 시간
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, role='{self.role}', session_id='{self.session_id}')>"