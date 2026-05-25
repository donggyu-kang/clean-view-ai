from sqlalchemy import Column, Integer, Text, String, JSON, DateTime, BigInteger
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from src.models.base import Base

class DocumentChunk(Base):
    """
    AI의 장기 기억 및 지식 조각을 저장하는 테이블 모델.
    pgvector를 활용하여 Gemini 임베딩 벡터를 저장하고 크로스 세션 검색을 수행합니다.

    [이중 잠금 구조 정책]
    1. 1차 방화벽 (보안 격리): user_id 필드를 통해 타 유저와의 데이터 공유를 원천 차단
    2. 2차 맥락 필터 (UI 링킹): session_id 필드를 통해 유저 소유의 다른 채팅방 출처를 표시
    """
    __tablename__ = "document_chunks"

    # 유일 식별자
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # 실제 텍스트 내용 (기억의 실체 - UI 카드 및 LLM 컨텍스트 주입용)
    content = Column(Text, nullable=False)
    
    # 벡터 데이터: Gemini 'text-embedding-004' 모델의 출력 차원인 768로 설정
    embedding = Column(Vector(768), nullable=False)
    
    # =================================================================
    # [보안 및 필터링 메타데이터 레이어]
    # =================================================================
    
    # [1차 방화벽] 사용자 식별자 (멀티테넌시 데이터 격리의 절대적 기준)
    user_id = Column(String(100), index=True, nullable=False)
    
    # [2차 맥락 필터] 사이드바 채팅방 식별자 (출처방 분류 및 하이라이팅 기준)
    session_id = Column(BigInteger, index=True, nullable=False)  
    
    # OTel Trace ID (OpenTelemetry/Jaeger 답변 계보 추적용)
    trace_id = Column(String(100), nullable=True) 
    
    # 추가 정보를 위한 확장 필드 (예: 카테고리 태그, 제목 등)
    metadata_json = Column(JSON, nullable=True)
    
    # 레코드 생성 시각 (시간 순서에 따른 계보 시각화 기준선)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<DocumentChunk(id={self.id}, user_id='{self.user_id}', session_id='{self.session_id}', trace_id='{self.trace_id}')>"