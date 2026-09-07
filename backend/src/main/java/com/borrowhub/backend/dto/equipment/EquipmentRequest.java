package com.borrowhub.backend.dto.equipment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class EquipmentRequest {

    @NotBlank(message = "Item name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    @Positive(message = "Price per day must be greater than 0")
    private Double pricePerDay;

    // Optional — service defaults to 2.5x the daily rate when null, matching the frontend
    @PositiveOrZero(message = "Deposit can't be negative")
    private Double deposit;

    @NotBlank(message = "Location is required")
    private String location;

    private String image;
    private String condition;
    private String existingDamage;
    private String description;
}