pub mod request;
pub mod response;

#[cfg(test)]
mod tests {
    use crate::dto::request::auth::{LoginRequest, SignupRequest};
    use crate::dto::request::chat::ChatMessageRequest;
    use crate::dto::request::memory::{CreateMemoryRequest, UpdateMemoryRequest};
    use crate::dto::request::session::BlockSessionRequest;
    use crate::dto::response::auth::{AuthResponse, MeResponse};
    use crate::dto::response::chat::{ChatMessageResponse, ReferenceDto, SegmentDto};
    use crate::dto::response::memory::MemoryResponse;
    use crate::dto::response::session::{ChatMessageDto, ChatSessionResponse};
    use crate::dto::response::trace::TraceResponse;

    #[test]
    fn test_signup_request_deserialization() {
        let json = r#"{"name": "Test User", "email": "test@example.com", "password": "password123"}"#;
        let req: SignupRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.name, "Test User");
        assert_eq!(req.email, "test@example.com");
        assert_eq!(req.password, "password123");
    }

    #[test]
    fn test_login_request_deserialization() {
        let json = r#"{"email": "test@example.com", "password": "password123"}"#;
        let req: LoginRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.email, "test@example.com");
        assert_eq!(req.password, "password123");
    }

    #[test]
    fn test_chat_message_request_deserialization() {
        let json = r#"{"message": "Hello", "session_id": "123"}"#;
        let req: ChatMessageRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.message, "Hello");
        assert_eq!(req.session_id, Some("123".to_string()));
    }

    #[test]
    fn test_chat_message_request_without_session() {
        let json = r#"{"message": "Hello"}"#;
        let req: ChatMessageRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.message, "Hello");
        assert_eq!(req.session_id, None);
    }

    #[test]
    fn test_block_session_request_deserialization() {
        let json = r#"{"blocked_session_id": 456}"#;
        let req: BlockSessionRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.blocked_session_id, 456);
    }

    #[test]
    fn test_create_memory_request_deserialization() {
        let json = r#"{"content": "Test memory content"}"#;
        let req: CreateMemoryRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.content, "Test memory content");
    }

    #[test]
    fn test_update_memory_request_deserialization() {
        let json = r#"{"content": "Updated memory content"}"#;
        let req: UpdateMemoryRequest = serde_json::from_str(json).unwrap();
        assert_eq!(req.content, "Updated memory content");
    }

    #[test]
    fn test_auth_response_serialization() {
        let resp = AuthResponse {
            token: "test-token".to_string(),
            name: "Test User".to_string(),
            email: "test@example.com".to_string(),
        };
        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("test-token"));
        assert!(json.contains("Test User"));
        assert!(json.contains("test@example.com"));
    }

    #[test]
    fn test_chat_message_response_serialization() {
        let resp = ChatMessageResponse {
            answer: "Hello!".to_string(),
            session_id: "123".to_string(),
            trace_id: Some("trace-abc".to_string()),
            segments: Some(vec![SegmentDto {
                text: "segment text".to_string(),
                has_citation: true,
                ref_id: Some(1),
                session_id: Some(1),
            }]),
            references: Some(vec![ReferenceDto {
                id: Some(1),
                session_id: Some(1),
                content: Some("reference content".to_string()),
                similarity: Some(0.95),
                trace_id: Some("trace-abc".to_string()),
                created_at: Some("2026-05-28T10:00:00".to_string()),
            }]),
        };
        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("Hello!"));
        assert!(json.contains("trace-abc"));
    }

    #[test]
    fn test_trace_response_serialization() {
        let resp = TraceResponse {
            trace_id: "trace-123".to_string(),
            retrieval_duration_ms: Some(150),
            generation_duration_ms: Some(2300),
            retrieval_scores: Some(vec![0.85, 0.72, 0.68]),
        };
        let json = serde_json::to_string(&resp).unwrap();
        assert!(json.contains("trace-123"));
        assert!(json.contains("150"));
        assert!(json.contains("2300"));
    }
}
