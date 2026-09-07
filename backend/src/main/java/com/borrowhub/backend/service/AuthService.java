package com.borrowhub.backend.service;

import com.borrowhub.backend.config.AppConstants;
import com.borrowhub.backend.dto.auth.AuthResponse;
import com.borrowhub.backend.dto.auth.LoginRequest;
import com.borrowhub.backend.dto.auth.SignupRequest;
import com.borrowhub.backend.dto.auth.UserSummary;
import com.borrowhub.backend.entity.Role;
import com.borrowhub.backend.entity.User;
import com.borrowhub.backend.exception.ApiException;
import com.borrowhub.backend.repository.UserRepository;
import com.borrowhub.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("An account with that email already exists.");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(email.equals(AppConstants.ADMIN_EMAIL) ? Role.ADMIN : Role.CUSTOMER)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserSummary.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Incorrect email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw ApiException.unauthorized("Incorrect email or password.");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, UserSummary.from(user));
    }
}