use sqlx::PgPool;

use crate::model::Memory;

pub struct MemoryRepository;

impl MemoryRepository {
    pub async fn find_by_user_id(pool: &PgPool, user_id: &str) -> Result<Vec<Memory>, sqlx::Error> {
        sqlx::query_as::<_, Memory>(
            "SELECT * FROM memories WHERE user_id = $1 ORDER BY created_at DESC"
        )
        .bind(user_id)
        .fetch_all(pool)
        .await
    }

    pub async fn find_by_id_and_user_id(pool: &PgPool, id: i64, user_id: &str) -> Result<Option<Memory>, sqlx::Error> {
        sqlx::query_as::<_, Memory>(
            "SELECT * FROM memories WHERE id = $1 AND user_id = $2"
        )
        .bind(id)
        .bind(user_id)
        .fetch_optional(pool)
        .await
    }

    pub async fn create(pool: &PgPool, user_id: &str, content: &str) -> Result<Memory, sqlx::Error> {
        sqlx::query_as::<_, Memory>(
            "INSERT INTO memories (user_id, content) VALUES ($1, $2) RETURNING *"
        )
        .bind(user_id)
        .bind(content)
        .fetch_one(pool)
        .await
    }

    pub async fn update(pool: &PgPool, id: i64, content: &str) -> Result<Memory, sqlx::Error> {
        sqlx::query_as::<_, Memory>(
            "UPDATE memories SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *"
        )
        .bind(content)
        .bind(id)
        .fetch_one(pool)
        .await
    }

    pub async fn delete(pool: &PgPool, id: i64) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM memories WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;
        Ok(())
    }
}
