from fastapi import APIRouter
from src.api.v1 import chat

# 최상위 API 라우터 생성
api_router = APIRouter()

# 버전 1(v1) API들을 통합합니다.
# prefix를 "/api/v1"으로 설정하여 모든 하위 경로에 공통 적용합니다.
api_router.include_router(
    chat.router, 
    prefix="/v1"
)

# 나중에 문서 처리 API가 완성되면 아래와 같이 추가할 가능
# from src.api.v1 import docs
# api_router.include_router(docs.router, prefix="/v1")