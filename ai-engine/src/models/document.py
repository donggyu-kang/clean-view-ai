from sqlalchemy import Column, Integer, Text, String, JSON, DateTime
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from src.models.base import Base

class DocumentChunk(Base):
    """
    AI의 장기 기억 및 지식 조각을 저장하는 테이블 모델
    pgvector를 활용하여 Gemini 임베딩 벡터를 저장하고 검색
    """
    __tablename__ = "document_chunks"

    # 유일 식별자
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # 실제 텍스트 내용 (기억의 실체)
    content = Column(Text, nullable=False)
    
    # 벡터 데이터: Gemini 'text-embedding-004' 모델의 출력 차원인 768로 설정
    embedding = Column(Vector(768), nullable=False)
    
    # 필터링용 메타데이터
    session_id = Column(String(100), index=True, nullable=False)  # 채팅방별 기억 격리
    trace_id = Column(String(100), nullable=True)                # OTel Trace ID (답변 추적용)
    
    # 추가 정보를 위한 확장 필드 (예: 출처 URL, 생성 시각 등)
    metadata_json = Column(JSON, nullable=True)
    
    # 레코드 생성 시각
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<DocumentChunk(id={self.id}, session_id='{self.session_id}', trace_id='{self.trace_id}')>"