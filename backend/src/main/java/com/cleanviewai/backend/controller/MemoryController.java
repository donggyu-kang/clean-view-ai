package com.cleanviewai.backend.controller;

import com.cleanviewai.backend.dto.request.CreateMemoryRequest;
import com.cleanviewai.backend.dto.request.UpdateMemoryRequest;
import com.cleanviewai.backend.dto.response.MemoryResponse;
import com.cleanviewai.backend.service.MemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/memories")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService memoryService;

    @GetMapping
    public ResponseEntity<List<MemoryResponse>> getMemories(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(memoryService.getMemories(email));
    }

    @PostMapping
    public ResponseEntity<MemoryResponse> createMemory(
            @AuthenticationPrincipal String email,
            @RequestBody CreateMemoryRequest req) {
        return ResponseEntity.ok(memoryService.createMemory(email, req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemoryResponse> updateMemory(
            @AuthenticationPrincipal String email,
            @PathVariable Long id,
            @RequestBody UpdateMemoryRequest req) {
        return ResponseEntity.ok(memoryService.updateMemory(email, id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemory(
            @AuthenticationPrincipal String email,
            @PathVariable Long id) {
        memoryService.deleteMemory(email, id);
        return ResponseEntity.noContent().build();
    }
}
