use crate::error::AppError;
use crate::repository::chat_session_block_repo::ChatSessionBlockRepository;
use crate::repository::chat_session_repo::ChatSessionRepository;

pub struct ChatSessionBlockService;

impl ChatSessionBlockService {
    pub async fn get_blocked_session_ids(
        pool: &sqlx::PgPool,
        current_session_id: i64,
    ) -> Result<Vec<i64>, AppError> {
        Ok(ChatSessionBlockRepository::find_blocked_session_ids(pool, current_session_id).await?)
    }

    pub async fn block_session(
        pool: &sqlx::PgPool,
        email: &str,
        current_session_id: i64,
        blocked_session_id: i64,
    ) -> Result<(), AppError> {
        ChatSessionRepository::find_by_id_and_user_id(pool, current_session_id, email)
            .await?
            .ok_or_else(|| AppError::BadRequest("세션을 찾을 수 없습니다.".into()))?;

        let existing = ChatSessionBlockRepository::find_by_ids(pool, current_session_id, blocked_session_id).await?;

        if existing.is_none() {
            ChatSessionBlockRepository::create(pool, current_session_id, blocked_session_id).await?;
        }

        Ok(())
    }

    pub async fn unblock_session(
        pool: &sqlx::PgPool,
        email: &str,
        current_session_id: i64,
        blocked_session_id: i64,
    ) -> Result<(), AppError> {
        ChatSessionRepository::find_by_id_and_user_id(pool, current_session_id, email)
            .await?
            .ok_or_else(|| AppError::BadRequest("세션을 찾을 수 없습니다.".into()))?;

        ChatSessionBlockRepository::delete_by_ids(pool, current_session_id, blocked_session_id).await?;

        Ok(())
    }
}
