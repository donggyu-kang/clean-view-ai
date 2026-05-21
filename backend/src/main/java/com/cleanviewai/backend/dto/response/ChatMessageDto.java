package com.cleanviewai.backend.dto.response;

import com.cleanviewai.backend.entity.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageDto(Long id, String role, String content, LocalDateTime createdAt) {
    public static ChatMessageDto from(ChatMessage m) {
        return new ChatMessageDto(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt());
    }
}
