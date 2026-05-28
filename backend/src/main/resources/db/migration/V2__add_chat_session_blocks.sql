CREATE TABLE chat_session_blocks (
    id                 BIGSERIAL PRIMARY KEY,
    current_session_id BIGINT    NOT NULL REFERENCES chat_sessions (id) ON DELETE CASCADE,
    blocked_session_id BIGINT    NOT NULL REFERENCES chat_sessions (id) ON DELETE CASCADE,
    created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (current_session_id, blocked_session_id)
);

CREATE INDEX idx_csb_current ON chat_session_blocks (current_session_id);
