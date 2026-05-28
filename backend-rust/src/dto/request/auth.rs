use serde::Deserialize;
use utoipa::ToSchema;
use validator::Validate;

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct SignupRequest {
    #[validate(length(min = 1, message = "이름은 필수입니다"))]
    pub name: String,

    #[validate(email(message = "이메일 형식이 올바르지 않습니다"))]
    pub email: String,

    #[validate(length(min = 8, message = "비밀번호는 8자 이상이어야 합니다"))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate, ToSchema)]
pub struct LoginRequest {
    #[validate(email(message = "이메일 형식이 올바르지 않습니다"))]
    pub email: String,

    #[validate(length(min = 1, message = "비밀번호는 필수입니다"))]
    pub password: String,
}
