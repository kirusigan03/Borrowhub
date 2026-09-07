package com.borrowhub.backend.dto.equipment;

import com.borrowhub.backend.entity.Equipment;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class EquipmentResponse {
    private Long id;
    private String name;
    private String category;
    private Double pricePerDay;
    private Double deposit;
    private String location;
    private String description;
    private String condition;
    private String existingDamage;
    private Double rating;
    private Integer reviews;
    private Boolean available;
    private String status;
    private String image;
    private Long ownerId;
    private String ownerName;
    private Instant createdAt;

    public static EquipmentResponse from(Equipment e) {
        return new EquipmentResponse(
                e.getId(),
                e.getName(),
                e.getCategory(),
                e.getPricePerDay(),
                e.getDeposit(),
                e.getLocation(),
                e.getDescription(),
                e.getCondition(),
                e.getExistingDamage(),
                e.getRating(),
                e.getReviews(),
                e.getAvailable(),
                e.getStatus().name(),
                e.getImage(),
                e.getOwner() != null ? e.getOwner().getId() : null,
                e.getOwner() != null ? e.getOwner().getName() : "BorrowHub",
                e.getCreatedAt()
        );
    }
}