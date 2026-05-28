use sqlx::PgPool;

use crate::model::ChatSessionBlock;

pub struct ChatSessionBlockRepository;

impl ChatSessionBlockRepository {
    pub async fn find_blocked_session_ids(pool: &PgPool, current_session_id: i64) -> Result<Vec<i64>, sqlx::Error> {
        let rows: Vec<(i64,)> = sqlx::query_as(
            "SELECT blocked_session_id FROM chat_session_blocks WHERE current_session_id = $1"
        )
        .bind(current_session_id)
        .fetch_all(pool)
        .await?;

        Ok(rows.into_iter().map(|r| r.0).collect())
    }

    pub async fn find_by_ids(
        pool: &PgPool,
        current_session_id: i64,
        blocked_session_id: i64,
    ) -> Result<Option<ChatSessionBlock>, sqlx::Error> {
        sqlx::query_as::<_, ChatSessionBlock>(
            "SELECT * FROM chat_session_blocks WHERE current_session_id = $1 AND blocked_session_id = $2"
        )
        .bind(current_session_id)
        .bind(blocked_session_id)
        .fetch_optional(pool)
        .await
    }

    pub async fn create(
        pool: &PgPool,
        current_session_id: i64,
        blocked_session_id: i64,
    ) -> Result<ChatSessionBlock, sqlx::Error> {
        sqlx::query_as::<_, ChatSessionBlock>(
            "INSERT INTO chat_session_blocks (current_session_id, blocked_session_id) VALUES ($1, $2) RETURNING *"
        )
        .bind(current_session_id)
        .bind(blocked_session_id)
        .fetch_one(pool)
        .await
    }

    pub async fn delete_by_ids(
        pool: &PgPool,
        current_session_id: i64,
        blocked_session_id: i64,
    ) -> Result<(), sqlx::Error> {
        sqlx::query(
            "DELETE FROM chat_session_blocks WHERE current_session_id = $1 AND blocked_session_id = $2"
        )
        .bind(current_session_id)
        .bind(blocked_session_id)
        .execute(pool)
        .await?;
        Ok(())
    }
}
