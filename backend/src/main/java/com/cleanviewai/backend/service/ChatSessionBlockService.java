package com.cleanviewai.backend.service;

import com.cleanviewai.backend.entity.ChatSessionBlock;
import com.cleanviewai.backend.repository.ChatSessionBlockRepository;
import com.cleanviewai.backend.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatSessionBlockService {

    private final ChatSessionBlockRepository chatSessionBlockRepository;
    private final ChatSessionRepository chatSessionRepository;

    /** 현재 세션에서 차단된 과거 세션 ID 목록 조회 */
    @Transactional(readOnly = true)
    public List<Long> getBlockedSessionIds(Long currentSessionId) {
        return chatSessionBlockRepository.findBlockedSessionIdsByCurrentSessionId(currentSessionId);
    }

    /** [이 대화에서 사용 안함] 버튼 → 과거 세션 차단 등록 */
    @Transactional
    public void blockSession(String email, Long currentSessionId, Long blockedSessionId) {
        // 본인 세션인지 검증
        chatSessionRepository.findByIdAndUserId(currentSessionId, email)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        // 중복 차단 방지
        chatSessionBlockRepository.findByCurrentSessionIdAndBlockedSessionId(currentSessionId, blockedSessionId)
                .ifPresentOrElse(
                        b -> { /* 이미 차단됨 — 무시 */ },
                        () -> chatSessionBlockRepository.save(ChatSessionBlock.builder()
                                .currentSessionId(currentSessionId)
                                .blockedSessionId(blockedSessionId)
                                .build())
                );
    }

    /** 차단 해제 */
    @Transactional
    public void unblockSession(String email, Long currentSessionId, Long blockedSessionId) {
        chatSessionRepository.findByIdAndUserId(currentSessionId, email)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));
        chatSessionBlockRepository.deleteByCurrentSessionIdAndBlockedSessionId(currentSessionId, blockedSessionId);
    }
}
