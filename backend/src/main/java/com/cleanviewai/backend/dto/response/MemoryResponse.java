package com.cleanviewai.backend.dto.response;

import com.cleanviewai.backend.entity.Memory;

import java.time.LocalDateTime;

public record MemoryResponse(Long id, String content, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static MemoryResponse from(Memory m) {
        return new MemoryResponse(m.getId(), m.getContent(), m.getCreatedAt(), m.getUpdatedAt());
    }
}
