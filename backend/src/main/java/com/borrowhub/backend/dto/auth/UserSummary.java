package com.borrowhub.backend.dto.auth;

import com.borrowhub.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummary {
    private Long id;
    private String name;
    private String email;
    private String role;

    public static UserSummary from(User user) {
        return new UserSummary(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}