use sqlx::PgPool;

use crate::model::ChatSession;

pub struct ChatSessionRepository;

impl ChatSessionRepository {
    pub async fn find_by_user_id(pool: &PgPool, user_id: &str) -> Result<Vec<ChatSession>, sqlx::Error> {
        sqlx::query_as::<_, ChatSession>(
            "SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC"
        )
        .bind(user_id)
        .fetch_all(pool)
        .await
    }

    pub async fn find_by_id_and_user_id(pool: &PgPool, id: i64, user_id: &str) -> Result<Option<ChatSession>, sqlx::Error> {
        sqlx::query_as::<_, ChatSession>(
            "SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2"
        )
        .bind(id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
    }

    pub async fn create(pool: &PgPool, user_id: &str, title: &str) -> Result<ChatSession, sqlx::Error> {
        sqlx::query_as::<_, ChatSession>(
            "INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING *"
        )
        .bind(user_id)
        .bind(title)
        .fetch_one(pool)
        .await
    }

    pub async fn touch(pool: &PgPool, id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }

    pub async fn delete(pool: &PgPool, id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM chat_sessions WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
