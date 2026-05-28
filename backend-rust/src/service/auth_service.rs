use bcrypt::{hash, verify};

use crate::dto::request::auth::{LoginRequest, SignupRequest};
use crate::dto::response::auth::{AuthResponse, MeResponse};
use crate::error::AppError;
use crate::repository::user_repo::UserRepository;
use crate::util::JwtUtil;

pub struct AuthService;

impl AuthService {
    pub async fn signup(
        pool: &sqlx::PgPool,
        req: SignupRequest,
        jwt_secret: &str,
        jwt_expiration: i64,
    ) -> Result<AuthResponse, AppError> {
        if UserRepository::exists_by_email(pool, &req.email).await? {
            return Err(AppError::BadRequest("이미 사용 중인 이메일입니다.".into()));
        }

        let hashed_password = hash(&req.password, 10)?;
        let user = UserRepository::create(pool, &req.name, &req.email, &hashed_password).await?;
        let token = JwtUtil::generate_token(&user.email, jwt_secret, jwt_expiration)?;

        Ok(AuthResponse {
            token,
            name: user.name,
            email: user.email,
        })
    }

    pub async fn login(
        pool: &sqlx::PgPool,
        req: LoginRequest,
        jwt_secret: &str,
        jwt_expiration: i64,
    ) -> Result<AuthResponse, AppError> {
        let user = UserRepository::find_by_email(pool, &req.email)
            .await?
            .ok_or_else(|| AppError::BadRequest("이메일 또는 비밀번호가 올바르지 않습니다.".into()))?;

        if !verify(&req.password, &user.password)? {
            return Err(AppError::BadRequest("이메일 또는 비밀번호가 올바르지 않습니다.".into()));
        }

        let token = JwtUtil::generate_token(&user.email, jwt_secret, jwt_expiration)?;

        Ok(AuthResponse {
            token,
            name: user.name,
            email: user.email,
        })
    }

    pub async fn me(pool: &sqlx::PgPool, email: &str) -> Result<MeResponse, AppError> {
        let user = UserRepository::find_by_email(pool, email)
            .await?
            .ok_or_else(|| AppError::NotFound("사용자를 찾을 수 없습니다.".into()))?;

        Ok(MeResponse {
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
        })
    }
}
