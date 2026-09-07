package com.borrowhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "equipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // Category ids from the frontend's categories.js (construction, gardening, electronics, ...)
    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double pricePerDay;

    @Column(nullable = false)
    private Double deposit;

    @Column(nullable = false)
    private String location;

    @Column(length = 2000)
    private String description;

    // Column renamed to item_condition — "condition" is a reserved word in
    // MySQL (used in stored-procedure DECLARE ... CONDITION syntax) and
    // breaks CREATE TABLE if used unquoted as a column name.
    @Column(name = "item_condition")
    @Builder.Default
    private String condition = "Good";

    @Column(name = "existing_damage")
    private String existingDamage;

    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer reviews = 0;

    @Builder.Default
    private Boolean available = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EquipmentStatus status = EquipmentStatus.PENDING_REVIEW;

    // LONGTEXT because the frontend stores base64 photo data URLs here, which
    // can run tens of thousands of characters — a normal varchar would truncate them.
    @Column(columnDefinition = "LONGTEXT")
    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}