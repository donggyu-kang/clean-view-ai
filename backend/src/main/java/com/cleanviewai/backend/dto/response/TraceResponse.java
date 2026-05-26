package com.cleanviewai.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TraceResponse(
        @JsonProperty("trace_id") String traceId,
        @JsonProperty("retrieval_duration_ms") Long retrievalDurationMs,
        @JsonProperty("generation_duration_ms") Long generationDurationMs,
        @JsonProperty("retrieval_scores") List<Double> retrievalScores
) {}
