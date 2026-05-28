package com.cleanviewai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_session_blocks",
        uniqueConstraints = @UniqueConstraint(columnNames = {"current_session_id", "blocked_session_id"}))
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionBlock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "current_session_id", nullable = false)
    private Long currentSessionId;

    @Column(name = "blocked_session_id", nullable = false)
    private Long blockedSessionId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
