package com.cleanviewai.backend.controller;

import com.cleanviewai.backend.dto.response.ChatMessageDto;
import com.cleanviewai.backend.dto.response.ChatSessionResponse;
import com.cleanviewai.backend.service.ChatSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class ChatSessionController {

    private final ChatSessionService chatSessionService;

    @GetMapping
    public ResponseEntity<List<ChatSessionResponse>> getSessions(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(chatSessionService.getSessions(email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        chatSessionService.deleteSession(email, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatSessionService.getMessages(email, id));
    }
}
