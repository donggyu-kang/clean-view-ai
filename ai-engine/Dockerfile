# =================================================================
# Stage 1: Dependency 컴파일 빌드 창고 스테이지 (Builder)
# =================================================================
FROM python:3.12-slim AS builder

WORKDIR /app

# 1. pgvector 및 머신러닝/비동기 라이브러리 컴파일용 시스템 패키지 설치
# gcc, g++ 등 빌드 후 프로덕션에는 필요 없는 무거운 도구들을 여기서만 쓰고 버립니다.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 2. 독립 가상환경(Virtual Env) 생성 및 패스 바인딩
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 3. pip 최신화 및 의존성 라이브러리 설치 (레이어 캐싱 활용)
# requirements.txt가 바뀌지 않았다면 이 무거운 다운로드 단계를 캐시로 초고속 패스합니다.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# =================================================================
# Stage 2: 실구동 전용 마이크로 러너 스테이지 (Runner)
# =================================================================
FROM python:3.12-slim AS runner

WORKDIR /app

# 1. 빌드 창고 스테이지에서 정제 컴파일 완료된 가상환경(venv)만 통째로 카피
# 이 한 줄 덕분에 gcc 등 무거운 컴파일러가 제외되어 이미지 용량이 70% 이상 다이어트됩니다.
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 2. 순수 파이썬 애플리케이션 소스코드 이식
COPY . .

# 3. K3s Pod 인바운드 개방 포트 명시 (FastAPI 기본 포트)
EXPOSE 8000

# 4. K3s HPA 자동 확장 및 환경 변수 연동형 실행 진입점 가동 명령 설계
# .env.production이나 K8s ConfigMap에서 주입된 UVICORN_WORKERS 값을 유연하게 흡수합니다.
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers ${UVICORN_WORKERS:-2}"]