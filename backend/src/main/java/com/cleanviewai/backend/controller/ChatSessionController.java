package com.cleanviewai.backend.controller;

import com.cleanviewai.backend.dto.request.BlockSessionRequest;
import com.cleanviewai.backend.dto.response.ChatMessageDto;
import com.cleanviewai.backend.dto.response.ChatSessionResponse;
import com.cleanviewai.backend.service.ChatSessionBlockService;
import com.cleanviewai.backend.service.ChatSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "ChatSession", description = "채팅 세션 및 기억 차단 관리")
@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class ChatSessionController {

    private final ChatSessionService chatSessionService;
    private final ChatSessionBlockService chatSessionBlockService;

    @Operation(summary = "채팅 세션 목록 조회")
    @GetMapping
    public ResponseEntity<List<ChatSessionResponse>> getSessions(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(chatSessionService.getSessions(email));
    }

    @Operation(summary = "채팅 세션 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        chatSessionService.deleteSession(email, id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "세션 메시지 목록 조회")
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatSessionService.getMessages(email, id));
    }

    // ── 기억 차단 API ────────────────────────────────────────────────────────

    @Operation(summary = "[이 대화에서 사용 안함] — 과거 세션 기억 차단",
               description = "현재 세션(id)에서 특정 과거 세션(blockedSessionId)의 기억을 차단합니다.")
    @PostMapping("/{id}/blocks")
    public ResponseEntity<Void> blockSession(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody BlockSessionRequest req) {
        chatSessionBlockService.blockSession(email, id, req.blockedSessionId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "기억 차단 해제",
               description = "현재 세션(id)에서 차단된 과거 세션(blockedSessionId)의 차단을 해제합니다.")
    @DeleteMapping("/{id}/blocks/{blockedSessionId}")
    public ResponseEntity<Void> unblockSession(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @PathVariable Long blockedSessionId) {
        chatSessionBlockService.unblockSession(email, id, blockedSessionId);
        return ResponseEntity.noContent().build();
    }
}
