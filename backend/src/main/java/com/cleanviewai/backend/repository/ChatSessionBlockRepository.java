package com.cleanviewai.backend.repository;

import com.cleanviewai.backend.entity.ChatSessionBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatSessionBlockRepository extends JpaRepository<ChatSessionBlock, Long> {

    List<ChatSessionBlock> findByCurrentSessionId(Long currentSessionId);

    Optional<ChatSessionBlock> findByCurrentSessionIdAndBlockedSessionId(Long currentSessionId, Long blockedSessionId);

    void deleteByCurrentSessionIdAndBlockedSessionId(Long currentSessionId, Long blockedSessionId);

    @Query("SELECT b.blockedSessionId FROM ChatSessionBlock b WHERE b.currentSessionId = :currentSessionId")
    List<Long> findBlockedSessionIdsByCurrentSessionId(Long currentSessionId);
}
