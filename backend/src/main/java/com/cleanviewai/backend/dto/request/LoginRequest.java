package com.cleanviewai.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class LoginRequest {

    @NotBlank
    @Email
    @Schema(example = "user@example.com")
    private String email;

    @NotBlank
    @Schema(example = "password123")
    private String password;
}
