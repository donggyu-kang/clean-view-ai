use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ChatSessionBlock {
    pub id: i64,
    pub current_session_id: i64,
    pub blocked_session_id: i64,
    pub created_at: Option<NaiveDateTime>,
}
