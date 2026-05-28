use axum::{extract::State, Json};

use crate::config::app::AppState;
use crate::dto::request::chat::ChatMessageRequest;
use crate::dto::response::chat::ChatMessageResponse;
use crate::error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::service::chat_service::ChatService;

#[utoipa::path(
    post,
    path = "/api/v1/chat/message",
    request_body = ChatMessageRequest,
    responses(
        (status = 200, description = "AI 응답", body = ChatMessageResponse),
        (status = 401, description = "인증 필요")
    ),
    security(("bearer_auth" = [])),
    tag = "Chat"
)]
pub async fn send_message(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Json(req): Json<ChatMessageRequest>,
) -> Result<Json<ChatMessageResponse>, AppError> {
    let response = ChatService::send_message(&state.pool, &email, req, &state.ai_engine_url).await?;
    Ok(Json(response))
}
