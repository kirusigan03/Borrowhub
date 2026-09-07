package com.borrowhub.backend.controller;

import com.borrowhub.backend.dto.auth.AuthResponse;
import com.borrowhub.backend.dto.auth.LoginRequest;
import com.borrowhub.backend.dto.auth.SignupRequest;
import com.borrowhub.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}