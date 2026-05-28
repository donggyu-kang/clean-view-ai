use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ChatMessageResponse {
    pub answer: String,
    pub session_id: String,
    pub trace_id: Option<String>,
    pub segments: Option<Vec<SegmentDto>>,
    pub references: Option<Vec<ReferenceDto>>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct SegmentDto {
    pub text: String,
    pub has_citation: bool,
    pub ref_id: Option<i32>,
    pub session_id: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct ReferenceDto {
    pub id: Option<i64>,
    pub session_id: Option<i64>,
    pub content: Option<String>,
    pub similarity: Option<f64>,
    pub trace_id: Option<String>,
    pub created_at: Option<String>,
}
