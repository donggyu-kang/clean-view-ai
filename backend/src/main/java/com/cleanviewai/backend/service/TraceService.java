package com.cleanviewai.backend.service;

import com.cleanviewai.backend.dto.response.TraceResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TraceService {

    private final RestClient jaegerClient;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Jaeger에서 트레이스 원본을 가져와 핵심 3가지 데이터만 슬라이싱하여 반환
     * - 기억 검색 소요 시간 (vector_db_retrieval duration)
     * - LLM 추론 소요 시간 (generate_node duration)
     * - 유사도 스코어 배열 (db.retrieval.scores)
     */
    public TraceResponse getTrace(String traceId) {
        Map<String, Object> jaegerResponse = jaegerClient.get()
                .uri("/api/traces/{traceId}", traceId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return parseJaegerResponse(jaegerResponse, traceId);
    }

    // ── private ──────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private TraceResponse parseJaegerResponse(Map<String, Object> jaegerResponse, String traceId) {
        List<Map<String, Object>> data =
                (List<Map<String, Object>>) jaegerResponse.get("data");

        if (data == null || data.isEmpty()) {
            return new TraceResponse(traceId, null, null, null);
        }

        List<Map<String, Object>> spans =
                (List<Map<String, Object>>) data.get(0).get("spans");

        if (spans == null) {
            return new TraceResponse(traceId, null, null, null);
        }

        Long retrievalDurationMs = null;
        Long generationDurationMs = null;
        List<Double> retrievalScores = null;

        for (Map<String, Object> span : spans) {
            String operationName = (String) span.get("operationName");

            if ("vector_db_retrieval".equals(operationName)) {
                // Jaeger duration 단위: 마이크로초 → 밀리초 변환
                retrievalDurationMs = extractDurationMs(span);
                retrievalScores = extractRetrievalScores(span);

            } else if ("generate_node".equals(operationName)) {
                generationDurationMs = extractDurationMs(span);
            }
        }

        return new TraceResponse(traceId, retrievalDurationMs, generationDurationMs, retrievalScores);
    }

    /** Jaeger span의 duration(μs)을 ms로 변환 */
    private Long extractDurationMs(Map<String, Object> span) {
        Object duration = span.get("duration");
        if (duration instanceof Number n) {
            return n.longValue() / 1000L;
        }
        return null;
    }

    /**
     * vector_db_retrieval 스판의 tags 배열에서 db.retrieval.scores 추출
     * AI 엔진이 심어놓은 형식: {"key": "db.retrieval.scores", "value": "[0.91, 0.85]"}
     */
    @SuppressWarnings("unchecked")
    private List<Double> extractRetrievalScores(Map<String, Object> span) {
        List<Map<String, Object>> tags = (List<Map<String, Object>>) span.get("tags");
        if (tags == null) return null;

        for (Map<String, Object> tag : tags) {
            if ("db.retrieval.scores".equals(tag.get("key"))) {
                Object value = tag.get("value");
                if (value == null) return null;

                // value가 JSON 배열 문자열인 경우 파싱
                if (value instanceof String s) {
                    try {
                        return objectMapper.readValue(s, new TypeReference<List<Double>>() {});
                    } catch (Exception e) {
                        log.warn("db.retrieval.scores 파싱 실패: {}", s);
                        return null;
                    }
                }

                // value가 이미 리스트인 경우
                if (value instanceof List<?> list) {
                    return list.stream()
                            .filter(v -> v instanceof Number)
                            .map(v -> ((Number) v).doubleValue())
                            .toList();
                }
            }
        }
        return null;
    }
}
