package com.cleanviewai.backend.controller;

import com.cleanviewai.backend.dto.response.TraceResponse;
import com.cleanviewai.backend.service.TraceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Trace", description = "⚠️ AI 엔진(localhost:8000) + Jaeger 실행 필요")
@RestController
@RequestMapping("/api/v1/traces")
@RequiredArgsConstructor
public class TraceController {

    private final TraceService traceService;

    @Operation(summary = "AI 추론 과정 조회 [⚠️ AI 엔진 + Jaeger 실행 필요]",
               description = "Jaeger에서 트레이스를 조회하여 기억 검색 시간, LLM 추론 시간, 유사도 스코어를 반환합니다.")
    @GetMapping("/{traceId}")
    public ResponseEntity<TraceResponse> getTrace(
            @AuthenticationPrincipal String email,
            @PathVariable String traceId) {
        return ResponseEntity.ok(traceService.getTrace(traceId));
    }
}
