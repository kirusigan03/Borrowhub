package com.borrowhub.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "renter_id")
    private User renter;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer days;

    @Column(nullable = false)
    private Double rentalTotal;

    @Column(nullable = false)
    private Double platformFee;

    @Column(nullable = false)
    private Double deposit;

    @Column(nullable = false)
    private Double total;

    @Builder.Default
    private String paymentMethod = "PayHere Sandbox";

    @Column(unique = true)
    private String orderId; // sent to PayHere as order_id, matched back in the notify callback

    private String paymentRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    private Boolean hasDamage;

    private Double damageAmount;

    private Double depositRefund;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant returnedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}