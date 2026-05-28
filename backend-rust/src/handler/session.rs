use axum::{
    extract::{Path, State},
    Json,
};

use crate::config::app::AppState;
use crate::dto::request::session::BlockSessionRequest;
use crate::dto::response::session::{ChatMessageDto, ChatSessionResponse};
use crate::error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::service::chat_session_block_service::ChatSessionBlockService;
use crate::service::chat_session_service::ChatSessionService;

#[utoipa::path(
    get,
    path = "/api/v1/sessions",
    responses(
        (status = 200, description = "세션 목록", body = Vec<ChatSessionResponse>),
        (status = 401, description = "인증 필요")
    ),
    security(("bearer_auth" = [])),
    tag = "ChatSession"
)]
pub async fn get_sessions(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
) -> Result<Json<Vec<ChatSessionResponse>>, AppError> {
    let sessions = ChatSessionService::get_sessions(&state.pool, &email).await?;
    Ok(Json(sessions))
}

#[utoipa::path(
    delete,
    path = "/api/v1/sessions/{id}",
    params(("id" = i64, Path, description = "세션 ID")),
    responses(
        (status = 204, description = "삭제 성공"),
        (status = 404, description = "세션 없음")
    ),
    security(("bearer_auth" = [])),
    tag = "ChatSession"
)]
pub async fn delete_session(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Path(id): Path<i64>,
) -> Result<(), AppError> {
    ChatSessionService::delete_session(&state.pool, &email, id).await?;
    Ok(())
}

#[utoipa::path(
    get,
    path = "/api/v1/sessions/{id}/messages",
    params(("id" = i64, Path, description = "세션 ID")),
    responses(
        (status = 200, description = "메시지 목록", body = Vec<ChatMessageDto>),
        (status = 404, description = "세션 없음")
    ),
    security(("bearer_auth" = [])),
    tag = "ChatSession"
)]
pub async fn get_messages(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Path(id): Path<i64>,
) -> Result<Json<Vec<ChatMessageDto>>, AppError> {
    let messages = ChatSessionService::get_messages(&state.pool, &email, id).await?;
    Ok(Json(messages))
}

#[utoipa::path(
    post,
    path = "/api/v1/sessions/{id}/blocks",
    params(("id" = i64, Path, description = "현재 세션 ID")),
    request_body = BlockSessionRequest,
    responses(
        (status = 200, description = "차단 성공"),
        (status = 400, description = "잘못된 요청")
    ),
    security(("bearer_auth" = [])),
    tag = "ChatSession"
)]
pub async fn block_session(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Path(id): Path<i64>,
    Json(req): Json<BlockSessionRequest>,
) -> Result<(), AppError> {
    ChatSessionBlockService::block_session(&state.pool, &email, id, req.blocked_session_id).await?;
    Ok(())
}

#[utoipa::path(
    delete,
    path = "/api/v1/sessions/{id}/blocks/{blocked_session_id}",
    params(
        ("id" = i64, Path, description = "현재 세션 ID"),
        ("blocked_session_id" = i64, Path, description = "차단 해제할 세션 ID")
    ),
    responses(
        (status = 204, description = "차단 해제 성공"),
        (status = 400, description = "잘못된 요청")
    ),
    security(("bearer_auth" = [])),
    tag = "ChatSession"
)]
pub async fn unblock_session(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Path((id, blocked_session_id)): Path<(i64, i64)>,
) -> Result<(), AppError> {
    ChatSessionBlockService::unblock_session(&state.pool, &email, id, blocked_session_id).await?;
    Ok(())
}
