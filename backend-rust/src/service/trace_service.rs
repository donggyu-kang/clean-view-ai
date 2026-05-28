use serde::Deserialize;

use crate::dto::response::trace::TraceResponse;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
struct JaegerResponse {
    data: Option<Vec<JaegerTrace>>,
}

#[derive(Debug, Deserialize)]
struct JaegerTrace {
    spans: Option<Vec<JaegerSpan>>,
}

#[derive(Debug, Deserialize)]
struct JaegerSpan {
    #[serde(rename = "operationName")]
    operation_name: Option<String>,
    duration: Option<i64>,
    tags: Option<Vec<JaegerTag>>,
}

#[derive(Debug, Deserialize)]
struct JaegerTag {
    key: Option<String>,
    value: Option<serde_json::Value>,
}

pub struct TraceService;

impl TraceService {
    pub async fn get_trace(trace_id: &str, jaeger_url: &str) -> Result<TraceResponse, AppError> {
        let client = reqwest::Client::new();
        let url = format!("{}/api/traces/{}", jaeger_url, trace_id);

        let resp: JaegerResponse = client
            .get(&url)
            .send()
            .await?
            .json()
            .await?;

        Self::parse_jaeger_response(resp, trace_id)
    }

    fn parse_jaeger_response(resp: JaegerResponse, trace_id: &str) -> Result<TraceResponse, AppError> {
        let default_trace = TraceResponse {
            trace_id: trace_id.to_string(),
            retrieval_duration_ms: None,
            generation_duration_ms: None,
            retrieval_scores: None,
        };

        let data = match resp.data {
            Some(d) if !d.is_empty() => d,
            _ => return Ok(default_trace),
        };

        let spans = match &data[0].spans {
            Some(s) => s,
            None => return Ok(default_trace),
        };

        let mut retrieval_duration_ms = None;
        let mut generation_duration_ms = None;
        let mut retrieval_scores = None;

        for span in spans {
            let op_name = span.operation_name.as_deref().unwrap_or("");

            if op_name == "vector_db_retrieval" {
                retrieval_duration_ms = span.duration.map(|d| d / 1000);
                retrieval_scores = Self::extract_retrieval_scores(span);
            } else if op_name == "generate_node" {
                generation_duration_ms = span.duration.map(|d| d / 1000);
            }
        }

        Ok(TraceResponse {
            trace_id: trace_id.to_string(),
            retrieval_duration_ms,
            generation_duration_ms,
            retrieval_scores,
        })
    }

    fn extract_retrieval_scores(span: &JaegerSpan) -> Option<Vec<f64>> {
        let tags = span.tags.as_ref()?;

        for tag in tags {
            if tag.key.as_deref() == Some("db.retrieval.scores") {
                if let Some(value) = &tag.value {
                    if let Some(s) = value.as_str() {
                        if let Ok(scores) = serde_json::from_str::<Vec<f64>>(s) {
                            return Some(scores);
                        }
                    }
                    if let Some(arr) = value.as_array() {
                        let scores: Vec<f64> = arr
                            .iter()
                            .filter_map(|v| v.as_f64())
                            .collect();
                        if !scores.is_empty() {
                            return Some(scores);
                        }
                    }
                }
            }
        }

        None
    }
}
