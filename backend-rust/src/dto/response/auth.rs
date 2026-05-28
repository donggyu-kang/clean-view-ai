use chrono::NaiveDateTime;
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Debug, Serialize, ToSchema)]
pub struct AuthResponse {
    pub token: String,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Serialize, ToSchema)]
pub struct MeResponse {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub created_at: Option<NaiveDateTime>,
}
