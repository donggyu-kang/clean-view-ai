from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.core.config import settings

# =================================================================
# [DATABASE ENGINE] 비동기 엔진 생성
# =================================================================
# '결정론적 쿼터 할당' 전략 구현
# - pool_size: 각 Pod가 가질 수 있는 고정된 커넥션 수 (.env의 DB_POOL_SIZE=4)
# - max_overflow: 0으로 설정하여, 설정된 pool_size를 넘어서는 커넥션 생성을 차단
# 이를 통해 (최대 Pod 10개 * 4개 = 40개)로 DB 부하를 정확히 예측 및 통제 가능
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,        # 결정론적 쿼터 할당 (지분 고정) 
    max_overflow=settings.DB_MAX_OVERFLOW,  # 초과분 허용 안 함 (DB 생존 최우선) 
    pool_recycle=3600,                      # 1시간마다 커넥션 재생성 (좀비 커넥션 방지)
    echo=False                              # SQL 로그 출력 여부 (운영 시 False 권장)
)

# =================================================================
# [SESSION FACTORY] 비동기 세션 생성기
# =================================================================
# 실제 DB 작업을 수행할 세션 객체를 생성하는 팩토리
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,  # 세션 종료 후에도 객체 속성에 접근 가능하도록 설정
)

# =================================================================
# [DEPENDENCY] FastAPI 종속성 주입용 함수
# =================================================================
# 각 API 요청마다 독립된 세션을 생성하고 작업 완료 후 자동으로 닫음
async def get_db():
    """
    FastAPI의 Depends(get_db)를 통해 비동기 DB 세션을 주입받음
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            # 작업 성공/실패 여부와 관계없이 반드시 커넥션을 반납함 
            await session.close()