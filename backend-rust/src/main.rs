use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod dto;
mod error;
mod handler;
mod middleware;
mod model;
mod repository;
mod router;
mod service;
mod util;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::from_default_env())
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let jwt_expiration: i64 = std::env::var("JWT_EXPIRATION")
        .unwrap_or_else(|_| "86400".into())
        .parse()?;
    let ai_engine_url = std::env::var("AI_ENGINE_URL").unwrap_or_else(|_| "http://localhost:8000".into());
    let jaeger_query_url = std::env::var("JAEGER_QUERY_URL").unwrap_or_else(|_| "http://localhost:16686".into());

    let pool = config::database::create_pool(&database_url).await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    tracing::info!("Database migrations completed");

    let state = config::app::AppState {
        pool,
        jwt_secret,
        jwt_expiration,
        ai_engine_url,
        jaeger_query_url,
    };

    let app = router::create_router(state);

    let host = std::env::var("SERVER_HOST").unwrap_or_else(|_| "0.0.0.0".into());
    let port = std::env::var("SERVER_PORT").unwrap_or_else(|_| "8080".into());
    let addr = format!("{}:{}", host, port);

    let listener = TcpListener::bind(&addr).await?;
    tracing::info!("Server running on {}", addr);

    axum::serve(listener, app).await?;

    Ok(())
}
