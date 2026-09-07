package com.borrowhub.backend.security;

import com.borrowhub.backend.entity.User;
import com.borrowhub.backend.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    /** Throws 401 if nobody is authenticated — use in controllers that require login. */
    public User require() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "You need to be logged in for this.");
        }
        return user;
    }
}