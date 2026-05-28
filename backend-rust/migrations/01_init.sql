CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP   NOT NULL
);

CREATE TABLE chat_sessions (
    id         BIGSERIAL PRIMARY KEY,
    user_id    VARCHAR(255) NOT NULL,
    title      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP   NOT NULL,
    updated_at TIMESTAMP   NOT NULL
);

CREATE TABLE chat_messages (
    id         BIGSERIAL PRIMARY KEY,
    session_id BIGINT      NOT NULL REFERENCES chat_sessions (id),
    role       VARCHAR(255) NOT NULL,
    content    TEXT        NOT NULL,
    created_at TIMESTAMP   NOT NULL
);

CREATE TABLE memories (
    id         BIGSERIAL PRIMARY KEY,
    user_id    VARCHAR(255) NOT NULL,
    content    TEXT        NOT NULL,
    created_at TIMESTAMP   NOT NULL,
    updated_at TIMESTAMP   NOT NULL
);
