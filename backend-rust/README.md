# CleanView AI Backend (Rust)

CleanView AI 백엔드 API 서버 — Rust + Axum 기반

## 기술 스택

| 컴포넌트 | 라이브러리 | 버전 |
|---------|-----------|------|
| 웹 프레임워크 | Axum | 0.8 |
| 비동기 런타임 | Tokio | 1.x |
| 데이터베이스 | SQLx (PostgreSQL) | 0.8 |
| 인증 | jsonwebtoken | 9.x |
| API 문서 | utoipa + Swagger UI | 5.x / 9.x |
| HTTP 클라이언트 | reqwest | 0.12 |
| 로깅 | tracing | 0.1 |
| 비밀번호 해싱 | bcrypt | 0.15 |

## 프로젝트 구조

```
src/
├── main.rs              # 엔트리포인트
├── router.rs            # 라우터 설정
├── config/
│   ├── app.rs           # AppState 정의
│   └── database.rs      # DB 커넥션 풀
├── dto/
│   ├── request/         # 요청 DTO
│   └── response/        # 응답 DTO
├── error/
│   └── app_error.rs     # 커스텀 에러 타입
├── handler/             # HTTP 핸들러 (Controller)
│   ├── auth.rs
│   ├── chat.rs
│   ├── session.rs
│   ├── memory.rs
│   ├── trace.rs
│   └── health.rs
├── middleware/
│   └── auth.rs          # JWT 인증 추출기
├── model/               # 데이터 모델
│   ├── user.rs
│   ├── chat_session.rs
│   ├── chat_message.rs
│   ├── chat_session_block.rs
│   └── memory.rs
├── repository/          # 데이터 액세스 레이어
│   ├── user_repo.rs
│   ├── chat_session_repo.rs
│   ├── chat_message_repo.rs
│   ├── chat_session_block_repo.rs
│   └── memory_repo.rs
├── service/             # 비즈니스 로직
│   ├── auth_service.rs
│   ├── chat_service.rs
│   ├── chat_session_service.rs
│   ├── chat_session_block_service.rs
│   ├── memory_service.rs
│   └── trace_service.rs
└── util/
    └── jwt.rs           # JWT 유틸리티
```

## 시작하기

### 사전 요구사항

- Rust 1.92+
- PostgreSQL 17 (pgvector 권장)

### 로컬 개발

```bash
# 1. 환경변수 설정
cp .env.example .env
# .env 파일 수정 (DATABASE_URL, JWT_SECRET 등)

# 2. 데이터베이스 마이그레이션
cargo install sqlx-cli --no-default-features --features postgres
sqlx migrate run

# 3. 서버 실행
cargo run
```

서버가 `http://localhost:8080`에서 시작됩니다.

### Docker 실행

```bash
# 전체 스택 (DB + Backend + AI Engine + Frontend)
docker-compose up -d

# 백엔드만 실행
docker build -t cleanview-backend .
docker run -p 8080:8080 --env-file .env cleanview-backend
```

## API 엔드포인트

### 인증 (Auth)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/v1/auth/signup` | 회원가입 | 불필요 |
| POST | `/api/v1/auth/login` | 로그인 | 불필요 |
| GET | `/api/v1/auth/me` | 내 정보 조회 | JWT |

### 채팅 (Chat)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/v1/chat/message` | AI 채팅 메시지 전송 | JWT |

### 세션 (ChatSession)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/v1/sessions` | 세션 목록 조회 | JWT |
| DELETE | `/api/v1/sessions/{id}` | 세션 삭제 | JWT |
| GET | `/api/v1/sessions/{id}/messages` | 세션 메시지 조회 | JWT |
| POST | `/api/v1/sessions/{id}/blocks` | 세션 차단 | JWT |
| DELETE | `/api/v1/sessions/{id}/blocks/{blockedSessionId}` | 세션 차단 해제 | JWT |

### 메모리 (Memory)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/v1/memories` | 메모리 목록 조회 | JWT |
| POST | `/api/v1/memories` | 메모리 생성 | JWT |
| PUT | `/api/v1/memories/{id}` | 메모리 수정 | JWT |
| DELETE | `/api/v1/memories/{id}` | 메모리 삭제 | JWT |

### 트레이스 (Trace)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/v1/traces/{traceId}` | 트레이스 조회 | JWT |

### 헬스체크

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/actuator/health` | 헬스체크 | 불필요 |

## API 문서

서버 실행 후 Swagger UI 접속:

```
http://localhost:8080/swagger-ui
```

OpenAPI JSON 스키마:

```
http://localhost:8080/api-docs/openapi.json
```

## 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `DATABASE_URL` | - | PostgreSQL 연결 문자열 |
| `JWT_SECRET` | - | JWT 서명 키 (32자 이상) |
| `JWT_EXPIRATION` | `86400` | JWT 만료 시간 (초) |
| `AI_ENGINE_URL` | `http://localhost:8000` | AI Engine URL |
| `JAEGER_QUERY_URL` | `http://localhost:16686` | Jaeger Query URL |
| `SERVER_HOST` | `0.0.0.0` | 서버 호스트 |
| `SERVER_PORT` | `8080` | 서버 포트 |
| `RUST_LOG` | `info` | 로그 레벨 |

## 테스트

```bash
# 단위 테스트 실행
cargo test

# clippy 린트 검사
cargo clippy

# 포맷 확인
cargo fmt --check
```

## 빌드

```bash
# 디버그 빌드
cargo build

# 릴리스 빌드
cargo build --release

# Docker 이미지 빌드
docker build -t cleanview-backend .
```

## 데이터베이스 마이그레이션

```bash
# 새 마이그레이션 생성
sqlx migrate add <migration_name>

# 마이그레이션 실행
sqlx migrate run

# 마지막 마이그레이션 롤백
sqlx migrate revert
```

## 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Handler   │ ──▶ │   Service   │ ──▶ │ Repository  │
│  (Controller)│     │  (Business) │     │  (Data)     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Middleware  │     │ AI Engine   │     │ PostgreSQL  │
│  (JWT Auth)  │     │  (FastAPI)  │     │  (pgvector) │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 라이선스

MIT
