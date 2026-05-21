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

    @Operation(
        summary = "AI 추론 과정 조회",
        description = "⚠️ AI 엔진이 실행 중이어야 합니다.\n\n" +
                      "채팅 응답에서 받은 traceId로 AI의 내부 추론 과정을 조회합니다."
    )
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
