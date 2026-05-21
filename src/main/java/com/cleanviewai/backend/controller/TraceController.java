package com.cleanviewai.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

@Tag(name = "Trace", description = "⚠️ AI 엔진(localhost:8000) 실행 필요")
@RestController
@RequestMapping("/api/v1/traces")
@RequiredArgsConstructor
public class TraceController {

    private final RestClient aiEngineClient;

    @Operation(summary = "AI 추론 과정 조회 [⚠️ AI 엔진 실행 필요]")
    @GetMapping("/{traceId}")
    public ResponseEntity<Object> getTrace(
            @AuthenticationPrincipal String email,
            @PathVariable String traceId) {
        Object response = aiEngineClient.get()
                .uri("/api/v1/traces/{traceId}", traceId)
                .retrieve()
                .body(Object.class);
        return ResponseEntity.ok(response);
    }
}
