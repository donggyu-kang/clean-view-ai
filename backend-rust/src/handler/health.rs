use axum::Json;
use serde_json::{json, Value};

#[utoipa::path(
    get,
    path = "/actuator/health",
    responses(
        (status = 200, description = "헬스체크 성공")
    ),
    tag = "Health"
)]
pub async fn health() -> Json<Value> {
    Json(json!({ "status": "UP" }))
}
