package com.cleanviewai.backend.service;

import com.cleanviewai.backend.dto.request.ChatMessageRequest;
import com.cleanviewai.backend.dto.response.ChatMessageResponse;
import com.cleanviewai.backend.entity.ChatMessage;
import com.cleanviewai.backend.entity.ChatSession;
import com.cleanviewai.backend.repository.ChatMessageRepository;
import com.cleanviewai.backend.repository.ChatSessionBlockRepository;
import com.cleanviewai.backend.repository.ChatSessionRepository;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final RestClient aiEngineClient;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatSessionBlockRepository chatSessionBlockRepository;

    @Transactional
    public ChatMessageResponse sendMessage(String email, ChatMessageRequest req) {
        ChatSession session = resolveSession(email, req);

        // 2차 맥락 필터: 유저의 모든 세션 ID
        List<Long> allowedSessionIds = chatSessionRepository
                .findByUserIdOrderByUpdatedAtDesc(email)
                .stream()
                .map(ChatSession::getId)
                .toList();

        // 차단 필터: 현재 세션에서 차단된 과거 세션 ID
        List<Long> excludedSessionIds = chatSessionBlockRepository
                .findBlockedSessionIdsByCurrentSessionId(session.getId());

        saveMessage(session, "user", req.message());

        // FastAPI 요청 바디
        Map<String, Object> body = new HashMap<>();
        body.put("message", req.message());
        body.put("user_id", email);
        body.put("session_id", session.getId());
        body.put("allowed_session_ids", allowedSessionIds);
        body.put("excluded_session_ids", excludedSessionIds);

        // OTel W3C Trace Context 헤더 주입 (분산 추적 계보 연결)
        String traceparent = buildTraceparent();

        AiEngineResponse aiResponse = aiEngineClient.post()
                .uri("/api/v1/chat/ask")
                .header("traceparent", traceparent)
                .body(body)
                .retrieve()
                .body(AiEngineResponse.class);

        saveMessage(session, "assistant", aiResponse.answer());
        session.touch();

        // AI 응답을 가공 없이 그대로 프론트로 전달 (session_id만 추가)
        return new ChatMessageResponse(
                aiResponse.answer(),
                session.getId().toString(),
                aiResponse.traceId(),
                aiResponse.segments(),
                aiResponse.references()
        );
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private ChatSession resolveSession(String email, ChatMessageRequest req) {
        if (req.sessionId() != null) {
            try {
                Long sessionId = Long.parseLong(req.sessionId());
                return chatSessionRepository.findByIdAndUserId(sessionId, email)
                        .orElseGet(() -> createSession(email, req.message()));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("유효하지 않은 세션 ID입니다: " + req.sessionId());
            }
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

    /**
     * W3C Trace Context 표준 traceparent 헤더 값 생성
     * 포맷: 00-{traceId}-{spanId}-01
     */
    private String buildTraceparent() {
        SpanContext ctx = Span.current().getSpanContext();
        if (ctx.isValid()) {
            return String.format("00-%s-%s-01", ctx.getTraceId(), ctx.getSpanId());
        }
        // OTel이 비활성화된 로컬 환경에서는 NOOP 스판이 반환되므로 기본값 사용
        return "00-00000000000000000000000000000000-0000000000000000-00";
    }

    // ── AI 엔진 응답 DTO ─────────────────────────────────────────────────────

    private record AiEngineResponse(
            String answer,
            @JsonProperty("trace_id") String traceId,
            List<ChatMessageResponse.SegmentDto> segments,
            List<ChatMessageResponse.ReferenceDto> references
    ) {}
}
