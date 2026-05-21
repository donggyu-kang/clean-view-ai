package com.cleanviewai.backend.repository;

import com.cleanviewai.backend.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(String userId);
    Optional<ChatSession> findByIdAndUserId(Long id, String userId);
}
