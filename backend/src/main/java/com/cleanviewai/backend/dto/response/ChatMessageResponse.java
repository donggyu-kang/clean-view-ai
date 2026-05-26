package com.cleanviewai.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ChatMessageResponse(
        String answer,
        @JsonProperty("session_id") String sessionId,
        @JsonProperty("trace_id") String traceId,
        List<SegmentDto> segments,
        List<ReferenceDto> references
) {

    public record SegmentDto(
            String text,
            @JsonProperty("has_citation") boolean hasCitation,
            @JsonProperty("ref_id") Integer refId,
            @JsonProperty("session_id") Integer sessionId
    ) {}

    public record ReferenceDto(
            Long id,
            @JsonProperty("session_id") Long sessionId,
            String content,
            Double similarity,
            @JsonProperty("trace_id") String traceId,
            @JsonProperty("created_at") String createdAt
    ) {}
}
