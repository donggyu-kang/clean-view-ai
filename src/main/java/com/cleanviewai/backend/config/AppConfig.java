package com.cleanviewai.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AppConfig {

    @Value("${ai.engine.url}")
    private String aiEngineUrl;

    @Bean
    public RestClient aiEngineClient() {
        return RestClient.builder()
                .baseUrl(aiEngineUrl)
                .build();
    }
}
