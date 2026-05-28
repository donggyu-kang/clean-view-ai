# ── 1단계: 빌드 ──────────────────────────────────────────────────────────────
FROM rust:1.92-bookworm AS builder
WORKDIR /app

# 의존성 캐시 레이어
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

# 소스 빌드
COPY migrations migrations
COPY src src
# SQLx 오프라인 모드 (DB 없이 빌드 가능)
ENV SQLX_OFFLINE=true
RUN cargo build --release

# ── 2단계: 실행 (최소 이미지) ────────────────────────────────────────────────
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/cleanview-backend .

EXPOSE 8080

ENTRYPOINT ["./cleanview-backend"]
