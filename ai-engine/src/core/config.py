import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    CleanViewAI 설정 클래스
    Pydantic Settings를 사용하여 .env 파일의 환경 변수를 자동으로 로드
    """

    PROJECT_NAME: str = "CleanViewAI-Engine"

    # [DATABASE] PostgreSQL + pgvector 설정
    DATABASE_URL: str
    
    # [POOLING] 결정론적 커넥션 쿼터 할당
    # 공식: Max_Connections >= (Max_Pods * Pool_Size) + Buffer
    DB_POOL_SIZE: int = 4
    DB_MAX_OVERFLOW: int = 0

    # [AI MODEL] Google Gemini API 설정
    GOOGLE_API_KEY: str
    EMBEDDING_MODEL: str = "models/text-embedding-004"

    # [OBSERVABILITY] OpenTelemetry & Jaeger 설정
    JAEGER_ENDPOINT: str = "http://localhost:14268/api/traces"
    OTEL_SERVICE_NAME: str = "cleanview-ai-engine"

    # Pydantic Settings 설정부
    model_config = SettingsConfigDict(
        # .env 파일을 현재 작업 디렉토리에서 찾기
        env_file=".env",
        env_file_encoding="utf-8",
        # .env에 정의된 변수 중 Settings 클래스에 선언되지 않은 변수는 무시
        extra="ignore"
    )

# 전역에서 공유할 단일 설정 인스턴스 생성
settings = Settings()