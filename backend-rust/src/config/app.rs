use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub jwt_secret: String,
    pub jwt_expiration: i64,
    pub ai_engine_url: String,
    pub jaeger_query_url: String,
}
