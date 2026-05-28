use axum::{extract::State, Json};

use crate::config::app::AppState;
use crate::dto::request::auth::{LoginRequest, SignupRequest};
use crate::dto::response::auth::{AuthResponse, MeResponse};
use crate::error::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::service::auth_service::AuthService;

#[utoipa::path(
    post,
    path = "/api/v1/auth/signup",
    request_body = SignupRequest,
    responses(
        (status = 200, description = "회원가입 성공", body = AuthResponse),
        (status = 400, description = "이메일 중복")
    ),
    tag = "Auth"
)]
pub async fn signup(
    State(state): State<AppState>,
    Json(req): Json<SignupRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let response = AuthService::signup(&state.pool, req, &state.jwt_secret, state.jwt_expiration).await?;
    Ok(Json(response))
}

#[utoipa::path(
    post,
    path = "/api/v1/auth/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "로그인 성공", body = AuthResponse),
        (status = 400, description = "인증 실패")
    ),
    tag = "Auth"
)]
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let response = AuthService::login(&state.pool, req, &state.jwt_secret, state.jwt_expiration).await?;
    Ok(Json(response))
}

#[utoipa::path(
    get,
    path = "/api/v1/auth/me",
    responses(
        (status = 200, description = "사용자 정보", body = MeResponse),
        (status = 401, description = "인증 필요")
    ),
    security(("bearer_auth" = [])),
    tag = "Auth"
)]
pub async fn me(
    State(state): State<AppState>,
    AuthenticatedUser(email): AuthenticatedUser,
) -> Result<Json<MeResponse>, AppError> {
    let response = AuthService::me(&state.pool, &email).await?;
    Ok(Json(response))
}
