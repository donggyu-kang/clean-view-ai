package com.cleanviewai.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MeResponse {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}
