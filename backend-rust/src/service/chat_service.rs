use serde::{Deserialize, Serialize};

use crate::dto::request::chat::ChatMessageRequest;
use crate::dto::response::chat::{ChatMessageResponse, ReferenceDto, SegmentDto};
use crate::error::AppError;
use crate::repository::chat_message_repo::ChatMessageRepository;
use crate::repository::chat_session_block_repo::ChatSessionBlockRepository;
use crate::repository::chat_session_repo::ChatSessionRepository;

pub struct ChatService;

#[derive(Debug, Serialize)]
struct AiEngineRequest {
    message: String,
    user_id: String,
    session_id: i64,
    allowed_session_ids: Vec<i64>,
    excluded_session_ids: Vec<i64>,
}

#[derive(Debug, Deserialize)]
struct AiEngineResponse {
    answer: String,
    trace_id: Option<String>,
    segments: Option<Vec<SegmentDto>>,
    references: Option<Vec<ReferenceDto>>,
}

impl ChatService {
    pub async fn send_message(
        pool: &sqlx::PgPool,
        email: &str,
        req: ChatMessageRequest,
        ai_engine_url: &str,
    ) -> Result<ChatMessageResponse, AppError> {
        let session = Self::resolve_session(pool, email, &req).await?;

        let allowed_sessions = ChatSessionRepository::find_by_user_id(pool, email).await?;
        let allowed_session_ids: Vec<i64> = allowed_sessions.iter().map(|s| s.id).collect();

        let excluded_session_ids = ChatSessionBlockRepository::find_blocked_session_ids(pool, session.id).await?;

        ChatMessageRepository::create(pool, session.id, "user", &req.message).await?;

        let ai_req = AiEngineRequest {
            message: req.message,
            user_id: email.to_string(),
            session_id: session.id,
            allowed_session_ids,
            excluded_session_ids,
        };

        let client = reqwest::Client::new();
        let ai_resp: AiEngineResponse = client
            .post(format!("{}/api/v1/chat/ask", ai_engine_url))
            .json(&ai_req)
            .send()
            .await?
            .json()
            .await?;

        ChatMessageRepository::create(pool, session.id, "assistant", &ai_resp.answer).await?;
        ChatSessionRepository::touch(pool, session.id).await?;

        Ok(ChatMessageResponse {
            answer: ai_resp.answer,
            session_id: session.id.to_string(),
            trace_id: ai_resp.trace_id,
            segments: ai_resp.segments,
            references: ai_resp.references,
        })
    }

    async fn resolve_session(
        pool: &sqlx::PgPool,
        email: &str,
        req: &ChatMessageRequest,
    ) -> Result<crate::model::ChatSession, AppError> {
        if let Some(ref session_id_str) = req.session_id {
            let parsed: Result<i64, _> = session_id_str.parse();
            if let Ok(session_id) = parsed {
                if let Some(session) = ChatSessionRepository::find_by_id_and_user_id(pool, session_id, email).await? {
                    return Ok(session);
                }
            }
        }
        Self::create_session(pool, email, &req.message).await
    }

    async fn create_session(
        pool: &sqlx::PgPool,
        email: &str,
        first_message: &str,
    ) -> Result<crate::model::ChatSession, AppError> {
        let title = if first_message.len() > 20 {
            &first_message[..20]
        } else {
            first_message
        };

        Ok(ChatSessionRepository::create(pool, email, title).await?)
    }
}
