use axum::{
    extract::{Path, State},
    Json,
};

use crate::config::app::AppState;
use crate::dto::response::trace::TraceResponse;
use crate::error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::service::trace_service::TraceService;

#[utoipa::path(
    get,
    path = "/api/v1/traces/{trace_id}",
    params(("trace_id" = String, Path, description = "트레이스 ID")),
    responses(
        (status = 200, description = "트레이스 정보", body = TraceResponse),
        (status = 401, description = "인증 필요")
    ),
    security(("bearer_auth" = [])),
    tag = "Trace"
)]
pub async fn get_trace(
    State(state): State<AppState>,
    AuthenticatedUser(_email): AuthenticatedUser,
    Path(trace_id): Path<String>,
) -> Result<Json<TraceResponse>, AppError> {
    let trace = TraceService::get_trace(&trace_id, &state.jaeger_query_url).await?;
    Ok(Json(trace))
}
