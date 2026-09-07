package com.borrowhub.backend.dto.booking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReturnRequest {

    @NotNull(message = "Let us know if there was any damage")
    private Boolean hasDamage;

    // Only used when hasDamage is true — amount deducted from the deposit
    private Double damageAmount;
}