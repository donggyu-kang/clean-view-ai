package com.cleanviewai.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;

@Configuration
public class AppConfig {

    @Value("${ai.engine.url}")
    private String aiEngineUrl;

    @Value("${jaeger.query.url:http://jaeger-query-service:16686}")
    private String jaegerQueryUrl;

    /** FastAPI AI 엔진 클라이언트 — Uvicorn은 HTTP/1.1만 지원하므로 버전 고정 */
    @Bean
    public RestClient aiEngineClient() {
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();
        return RestClient.builder()
                .baseUrl(aiEngineUrl)
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
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
