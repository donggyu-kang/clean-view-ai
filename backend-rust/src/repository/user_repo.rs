use sqlx::PgPool;

use crate::model::User;

pub struct UserRepository;

impl UserRepository {
    pub async fn find_by_email(pool: &PgPool, email: &str) -> Result<Option<User>, sqlx::Error> {
        sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
            .bind(email)
            .fetch_optional(pool)
            .await
    }

    pub async fn create(pool: &PgPool, name: &str, email: &str, password: &str) -> Result<User, sqlx::Error> {
        sqlx::query_as::<_, User>(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *"
        )
        .bind(name)
        .bind(email)
        .bind(password)
        .fetch_one(pool)
        .await
    }

    pub async fn exists_by_email(pool: &PgPool, email: &str) -> Result<bool, sqlx::Error> {
        let exists: (bool,) = sqlx::query_as("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
            .bind(email)
            .fetch_one(pool)
            .await?;
        Ok(exists.0)
    }
}
