use crate::dto::request::memory::{CreateMemoryRequest, UpdateMemoryRequest};
use crate::dto::response::memory::MemoryResponse;
use crate::error::AppError;
use crate::repository::memory_repo::MemoryRepository;

pub struct MemoryService;

impl MemoryService {
    pub async fn get_memories(pool: &sqlx::PgPool, user_id: &str) -> Result<Vec<MemoryResponse>, AppError> {
        let memories = MemoryRepository::find_by_user_id(pool, user_id).await?;
        Ok(memories.into_iter().map(MemoryResponse::from).collect())
    }

    pub async fn create_memory(
        pool: &sqlx::PgPool,
        user_id: &str,
        req: CreateMemoryRequest,
    ) -> Result<MemoryResponse, AppError> {
        let memory = MemoryRepository::create(pool, user_id, &req.content).await?;
        Ok(MemoryResponse::from(memory))
    }

    pub async fn update_memory(
        pool: &sqlx::PgPool,
        user_id: &str,
        id: i64,
        req: UpdateMemoryRequest,
    ) -> Result<MemoryResponse, AppError> {
        MemoryRepository::find_by_id_and_user_id(pool, id, user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("메모리를 찾을 수 없습니다.".into()))?;

        let memory = MemoryRepository::update(pool, id, &req.content).await?;
        Ok(MemoryResponse::from(memory))
    }

    pub async fn delete_memory(pool: &sqlx::PgPool, user_id: &str, id: i64) -> Result<(), AppError> {
        MemoryRepository::find_by_id_and_user_id(pool, id, user_id)
            .await?
            .ok_or_else(|| AppError::NotFound("메모리를 찾을 수 없습니다.".into()))?;

        MemoryRepository::delete(pool, id).await?;
        Ok(())
    }
}
