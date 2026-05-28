use chrono::NaiveDateTime;
use serde::Serialize;
use utoipa::ToSchema;

use crate::model::{ChatSession, ChatMessage};

#[derive(Debug, Serialize, ToSchema)]
pub struct ChatSessionResponse {
    pub id: i64,
    pub title: String,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

impl From<ChatSession> for ChatSessionResponse {
    fn from(s: ChatSession) -> Self {
        Self {
            id: s.id,
            title: s.title,
            created_at: s.created_at,
            updated_at: s.updated_at,
        }
    }
}

#[derive(Debug, Serialize, ToSchema)]
pub struct ChatMessageDto {
    pub id: i64,
    pub role: String,
    pub content: String,
    pub created_at: Option<NaiveDateTime>,
}

impl From<ChatMessage> for ChatMessageDto {
    fn from(m: ChatMessage) -> Self {
        Self {
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
        }
    }
}
