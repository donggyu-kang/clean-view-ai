package com.cleanviewai.backend.service;

import com.cleanviewai.backend.dto.response.ChatMessageDto;
import com.cleanviewai.backend.dto.response.ChatSessionResponse;
import com.cleanviewai.backend.entity.ChatSession;
import com.cleanviewai.backend.repository.ChatMessageRepository;
import com.cleanviewai.backend.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatSessionService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    public List<ChatSessionResponse> getSessions(String userId) {
        return chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(ChatSessionResponse::from).toList();
    }

    @Transactional
    public ChatSessionResponse createSession(String userId, String firstMessage) {
        String title = firstMessage.length() > 20
                ? firstMessage.substring(0, 20)
                : firstMessage;
        ChatSession session = ChatSession.builder()
                .userId(userId)
                .title(title)
                .build();
        return ChatSessionResponse.from(chatSessionRepository.save(session));
    }

    @Transactional
    public void deleteSession(String userId, Long sessionId) {
        ChatSession session = chatSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        chatMessageRepository.deleteAll(chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()));
        chatSessionRepository.delete(session);
    }

    public List<ChatMessageDto> getMessages(String userId, Long sessionId) {
        chatSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream().map(ChatMessageDto::from).toList();
    }
}
