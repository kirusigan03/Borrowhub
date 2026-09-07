package com.borrowhub.backend.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {

    @NotNull(message = "Equipment is required")
    private Long equipmentId;

    @NotNull(message = "Pickup date is required")
    private LocalDate startDate;

    @NotNull(message = "Return date is required")
    private LocalDate endDate;

    // PayHere's checkout form requires these for the customer paying
    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;
}