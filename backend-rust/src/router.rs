use axum::{
    routing::{delete, get, post, put},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::config::app::AppState;
use crate::handler::{auth, chat, health, memory, session, trace};

#[derive(OpenApi)]
#[openapi(
    paths(
        auth::signup,
        auth::login,
        auth::me,
        chat::send_message,
        session::get_sessions,
        session::delete_session,
        session::get_messages,
        session::block_session,
        session::unblock_session,
        memory::get_memories,
        memory::create_memory,
        memory::update_memory,
        memory::delete_memory,
        trace::get_trace,
        health::health
    ),
    components(schemas(
        crate::dto::request::auth::SignupRequest,
        crate::dto::request::auth::LoginRequest,
        crate::dto::request::chat::ChatMessageRequest,
        crate::dto::request::session::BlockSessionRequest,
        crate::dto::request::memory::CreateMemoryRequest,
        crate::dto::request::memory::UpdateMemoryRequest,
        crate::dto::response::auth::AuthResponse,
        crate::dto::response::auth::MeResponse,
        crate::dto::response::chat::ChatMessageResponse,
        crate::dto::response::chat::SegmentDto,
        crate::dto::response::chat::ReferenceDto,
        crate::dto::response::session::ChatSessionResponse,
        crate::dto::response::session::ChatMessageDto,
        crate::dto::response::memory::MemoryResponse,
        crate::dto::response::trace::TraceResponse
    )),
    tags(
        (name = "Auth", description = "인증 API"),
        (name = "Chat", description = "채팅 API"),
        (name = "ChatSession", description = "세션 API"),
        (name = "Memory", description = "메모리 API"),
        (name = "Trace", description = "트레이스 API"),
        (name = "Health", description = "헬스체크 API")
    )
)]
pub struct ApiDoc;

pub fn create_router(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        // Public routes
        .route("/api/v1/auth/signup", post(auth::signup))
        .route("/api/v1/auth/login", post(auth::login))
        .route("/actuator/health", get(health::health))
        // Protected routes (AuthenticatedUser extractor handles auth)
        .route("/api/v1/auth/me", get(auth::me))
        .route("/api/v1/chat/message", post(chat::send_message))
        .route("/api/v1/sessions", get(session::get_sessions))
        .route("/api/v1/sessions/{id}", delete(session::delete_session))
        .route("/api/v1/sessions/{id}/messages", get(session::get_messages))
        .route("/api/v1/sessions/{id}/blocks", post(session::block_session))
        .route(
            "/api/v1/sessions/{id}/blocks/{blocked_session_id}",
            delete(session::unblock_session),
        )
        .route("/api/v1/memories", get(memory::get_memories))
        .route("/api/v1/memories", post(memory::create_memory))
        .route("/api/v1/memories/{id}", put(memory::update_memory))
        .route("/api/v1/memories/{id}", delete(memory::delete_memory))
        .route("/api/v1/traces/{trace_id}", get(trace::get_trace))
        // Swagger UI
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(cors)
        .with_state(state)
}
