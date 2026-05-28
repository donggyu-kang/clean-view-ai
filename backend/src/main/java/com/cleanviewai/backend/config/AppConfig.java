package com.cleanviewai.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Value("${ai.engine.url}")
    private String aiEngineUrl;

    @Value("${jaeger.query.url:http://jaeger-query-service:16686}")
    private String jaegerQueryUrl;

    /** FastAPI AI 엔진 클라이언트 */
    @Bean
    public RestClient aiEngineClient() {
        return RestClient.builder()
                .baseUrl(aiEngineUrl)
                .build();
    }

    /** Jaeger Query API 클라이언트 (트레이스 조회용) */
    @Bean
    public RestClient jaegerClient() {
        return RestClient.builder()
                .baseUrl(jaegerQueryUrl)
                .build();
    }
}
