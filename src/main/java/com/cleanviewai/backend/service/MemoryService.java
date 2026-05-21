package com.cleanviewai.backend.service;

import com.cleanviewai.backend.dto.request.CreateMemoryRequest;
import com.cleanviewai.backend.dto.request.UpdateMemoryRequest;
import com.cleanviewai.backend.dto.response.MemoryResponse;
import com.cleanviewai.backend.entity.Memory;
import com.cleanviewai.backend.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository memoryRepository;

    public List<MemoryResponse> getMemories(String userId) {
        return memoryRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(MemoryResponse::from).toList();
    }

    public MemoryResponse createMemory(String userId, CreateMemoryRequest req) {
        Memory memory = Memory.builder()
                .userId(userId)
                .content(req.content())
                .build();
        return MemoryResponse.from(memoryRepository.save(memory));
    }

    @Transactional
    public MemoryResponse updateMemory(String userId, Long id, UpdateMemoryRequest req) {
        Memory memory = memoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        memory.updateContent(req.content());
        return MemoryResponse.from(memory);
    }

    public void deleteMemory(String userId, Long id) {
        Memory memory = memoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        memoryRepository.delete(memory);
    }
}
