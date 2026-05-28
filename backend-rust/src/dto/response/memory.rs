use chrono::NaiveDateTime;
use serde::Serialize;
use utoipa::ToSchema;

use crate::model::Memory;

#[derive(Debug, Serialize, ToSchema)]
pub struct MemoryResponse {
    pub id: i64,
    pub content: String,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

impl From<Memory> for MemoryResponse {
    fn from(m: Memory) -> Self {
        Self {
            id: m.id,
            content: m.content,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}
