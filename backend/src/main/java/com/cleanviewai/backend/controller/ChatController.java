package com.cleanviewai.backend.controller;

import com.cleanviewai.backend.dto.request.ChatMessageRequest;
import com.cleanviewai.backend.dto.response.ChatMessageResponse;
import com.cleanviewai.backend.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Chat", description = "⚠️ AI 엔진(localhost:8000) 실행 필요")
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @Operation(summary = "채팅 메시지 전송 [⚠️ AI 엔진 실행 필요]")
    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody ChatMessageRequest req) {
        return ResponseEntity.ok(chatService.sendMessage(email, req));
    }
}
