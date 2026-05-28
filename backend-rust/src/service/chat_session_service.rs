use crate::dto::response::session::{ChatMessageDto, ChatSessionResponse};
use crate::error::AppError;
use crate::repository::chat_message_repo::ChatMessageRepository;
use crate::repository::chat_session_repo::ChatSessionRepository;

pub struct ChatSessionService;

impl ChatSessionService {
    pub async fn get_sessions(pool: &sqlx::PgPool, user_id: &str) -> Result<Vec<ChatSessionResponse>, AppError> {
        let sessions = ChatSessionRepository::find_by_user_id(pool, user_id).await?;
        Ok(sessions.into_iter().map(ChatSessionResponse::from).collect())
    }

    pub async fn create_session(
        pool: &sqlx::PgPool,
        user_id: &str,
        first_message: &str,
    ) -> Result<ChatSessionResponse, AppError> {
        let title = if first_message.len() > 20 {
            &first_message[..20]
        } else {
            first_message
        };

        let session = ChatSessionRepository::create(pool, user_id, title).await?;
        Ok(ChatSessionResponse::from(session))
    }

    pub async fn delete_session(pool: &sqlx::PgPool, user_id: &str, session_id: i64) -> Result<(), AppError> {
        let session = ChatSessionRepository::find_by_id_and_user_id(pool, session_id, user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("세션을 찾을 수 없습니다.".into()))?;

        ChatMessageRepository::delete_by_session_id(pool, session.id).await?;
        ChatSessionRepository::delete(pool, session.id).await?;

        Ok(())
    }

    pub async fn get_messages(
        pool: &sqlx::PgPool,
        user_id: &str,
        session_id: i64,
    ) -> Result<Vec<ChatMessageDto>, AppError> {
        ChatSessionRepository::find_by_id_and_user_id(pool, session_id, user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("세션을 찾을 수 없습니다.".into()))?;

        let messages = ChatMessageRepository::find_by_session_id(pool, session_id).await?;
        Ok(messages.into_iter().map(ChatMessageDto::from).collect())
    }
}
