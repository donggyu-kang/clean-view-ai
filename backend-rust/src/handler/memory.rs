use axum::{
    extract::{Path, State},
    Json,
};

use crate::config::app::AppState;
use crate::dto::request::memory::{CreateMemoryRequest, UpdateMemoryRequest};
use crate::dto::response::memory::MemoryResponse;
use crate::error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::service::memory_service::MemoryService;

#[utoipa::path(
    get,
    path = "/api/v1/memories",
    responses(
        (status = 200, description = "메모리 목록", body = Vec<MemoryResponse>),
        (status = 401, description = "인증 필요")
    ),
    security(("bearer_auth" = [])),
    tag = "Memory"
)]
pub async fn get_memories(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
) -> Result<Json<Vec<MemoryResponse>>, AppError> {
    let memories = MemoryService::get_memories(&state.pool, &email).await?;
    Ok(Json(memories))
}

#[utoipa::path(
    post,
    path = "/api/v1/memories",
    request_body = CreateMemoryRequest,
    responses(
        (status = 200, description = "생성 성공", body = MemoryResponse),
        (status = 401, description = "인증 필요")
    ),
    security(("bearer_auth" = [])),
    tag = "Memory"
)]
pub async fn create_memory(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Json(req): Json<CreateMemoryRequest>,
) -> Result<Json<MemoryResponse>, AppError> {
    let memory = MemoryService::create_memory(&state.pool, &email, req).await?;
    Ok(Json(memory))
}

#[utoipa::path(
    put,
    path = "/api/v1/memories/{id}",
    params(("id" = i64, Path, description = "메모리 ID")),
    request_body = UpdateMemoryRequest,
    responses(
        (status = 200, description = "수정 성공", body = MemoryResponse),
        (status = 404, description = "메모리 없음")
    ),
    security(("bearer_auth" = [])),
    tag = "Memory"
)]
pub async fn update_memory(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Path(id): Path<i64>,
    Json(req): Json<UpdateMemoryRequest>,
) -> Result<Json<MemoryResponse>, AppError> {
    let memory = MemoryService::update_memory(&state.pool, &email, id, req).await?;
    Ok(Json(memory))
}

#[utoipa::path(
    delete,
    path = "/api/v1/memories/{id}",
    params(("id" = i64, Path, description = "메모리 ID")),
    responses(
        (status = 204, description = "삭제 성공"),
        (status = 404, description = "메모리 없음")
    ),
    security(("bearer_auth" = [])),
    tag = "Memory"
)]
pub async fn delete_memory(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
    Path(id): Path<i64>,
) -> Result<(), AppError> {
    MemoryService::delete_memory(&state.pool, &email, id).await?;
    Ok(())
}
