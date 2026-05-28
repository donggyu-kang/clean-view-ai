use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Bad Request: {0}")]
    BadRequest(String),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Not Found: {0}")]
    NotFound(String),

    #[error("Internal Server Error: {0}")]
    Internal(#[from] anyhow::Error),

    #[error("Database Error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("JWT Error: {0}")]
    Jwt(#[from] jsonwebtoken::errors::Error),

    #[error("Bcrypt Error: {0}")]
    Bcrypt(#[from] bcrypt::BcryptError),

    #[error("Reqwest Error: {0}")]
    Reqwest(#[from] reqwest::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".into()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::Internal(e) => {
                tracing::error!("Internal error: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".into())
            }
            AppError::Database(e) => {
                tracing::error!("Database error: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Database Error".into())
            }
            AppError::Jwt(e) => {
                tracing::warn!("JWT error: {}", e);
                (StatusCode::UNAUTHORIZED, "Invalid Token".into())
            }
            AppError::Bcrypt(e) => {
                tracing::error!("Bcrypt error: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".into())
            }
            AppError::Reqwest(e) => {
                tracing::error!("HTTP client error: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, "External Service Error".into())
            }
        };

        (status, Json(json!({ "message": message }))).into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bad_request_error() {
        let err = AppError::BadRequest("Invalid input".to_string());
        assert_eq!(err.to_string(), "Bad Request: Invalid input");
    }

    #[test]
    fn test_unauthorized_error() {
        let err = AppError::Unauthorized;
        assert_eq!(err.to_string(), "Unauthorized");
    }

    #[test]
    fn test_not_found_error() {
        let err = AppError::NotFound("Resource not found".to_string());
        assert_eq!(err.to_string(), "Not Found: Resource not found");
    }

    #[test]
    fn test_internal_error() {
        let inner = anyhow::anyhow!("Something went wrong");
        let err = AppError::Internal(inner);
        assert!(err.to_string().contains("Internal Server Error"));
    }
}
