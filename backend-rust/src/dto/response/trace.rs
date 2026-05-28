use serde::Serialize;
use utoipa::ToSchema;

#[derive(Debug, Serialize, ToSchema)]
pub struct TraceResponse {
    pub trace_id: String,
    pub retrieval_duration_ms: Option<i64>,
    pub generation_duration_ms: Option<i64>,
    pub retrieval_scores: Option<Vec<f64>>,
}
