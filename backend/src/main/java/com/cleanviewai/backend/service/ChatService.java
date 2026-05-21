package com.cleanviewai.backend.service;

import com.cleanviewai.backend.dto.request.ChatMessageRequest;
import com.cleanviewai.backend.dto.response.ChatMessageResponse;
import com.cleanviewai.backend.entity.ChatMessage;
import com.cleanviewai.backend.entity.ChatSession;
import com.cleanviewai.backend.repository.ChatMessageRepository;
import com.cleanviewai.backend.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RestClient aiEngineClient;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public ChatMessageResponse sendMessage(String email, ChatMessageRequest req) {
        ChatSession session = resolveSession(email, req);

        saveMessage(session, "user", req.message());

        Map<String, Object> body = new HashMap<>();
        body.put("message", req.message());
        body.put("user_id", email);
        body.put("session_id", session.getId().toString());

        AiEngineResponse aiResponse = aiEngineClient.post()
                .uri("/api/v1/chat/ask")
                .body(body)
                .retrieve()
                .body(AiEngineResponse.class);

        saveMessage(session, "assistant", aiResponse.response());
        session.touch();

        return new ChatMessageResponse(
                aiResponse.response(),
                session.getId().toString(),
                aiResponse.trace_id()
        );
    }

    private ChatSession resolveSession(String email, ChatMessageRequest req) {
        if (req.sessionId() != null) {
            Long sessionId = Long.parseLong(req.sessionId());
            return chatSessionRepository.findByIdAndUserId(sessionId, email)
                    .orElseGet(() -> createSession(email, req.message()));
        }
        return createSession(email, req.message());
    }

    private ChatSession createSession(String email, String firstMessage) {
        String title = firstMessage.length() > 20
                ? firstMessage.substring(0, 20)
                : firstMessage;
        return chatSessionRepository.save(ChatSession.builder()
                .userId(email)
                .title(title)
                .build());
    }

    private void saveMessage(ChatSession session, String role, String content) {
        chatMessageRepository.save(ChatMessage.builder()
                .session(session)
                .role(role)
                .content(content)
                .build());
    }

    record AiEngineResponse(String response, String session_id, String trace_id) {}
}
