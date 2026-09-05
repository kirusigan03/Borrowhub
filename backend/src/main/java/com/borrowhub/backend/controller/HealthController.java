package com.borrowhub.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

// Temporary — delete once real endpoints (equipment, bookings, auth) exist.
// Hit this first to confirm the server is up and reachable from the frontend.
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "ok",
                "service", "borrowhub-backend",
                "time", Instant.now().toString()
        );
    }
}
