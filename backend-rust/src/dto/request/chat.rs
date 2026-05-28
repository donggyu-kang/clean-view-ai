use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Debug, Deserialize, ToSchema)]
pub struct ChatMessageRequest {
    pub message: String,
    pub session_id: Option<String>,
}
