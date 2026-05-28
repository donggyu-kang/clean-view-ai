use sqlx::PgPool;

use crate::model::ChatMessage;

pub struct ChatMessageRepository;

impl ChatMessageRepository {
    pub async fn find_by_session_id(pool: &PgPool, session_id: i64) -> Result<Vec<ChatMessage>, sqlx::Error> {
        sqlx::query_as::<_, ChatMessage>(
            "SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC"
        )
        .bind(session_id)
        .fetch_all(pool)
        .await
    }

    pub async fn create(pool: &PgPool, session_id: i64, role: &str, content: &str) -> Result<ChatMessage, sqlx::Error> {
        sqlx::query_as::<_, ChatMessage>(
            "INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3) RETURNING *"
        )
        .bind(session_id)
        .bind(role)
        .bind(content)
        .fetch_one(pool)
        .await
    }

    pub async fn delete_by_session_id(pool: &PgPool, session_id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM chat_messages WHERE session_id = $1")
            .bind(session_id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
