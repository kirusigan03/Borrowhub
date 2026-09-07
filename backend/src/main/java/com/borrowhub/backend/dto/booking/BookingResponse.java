package com.borrowhub.backend.dto.booking;

import com.borrowhub.backend.entity.Booking;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private Long ownerId;
    private String ownerName;
    private Long renterId;
    private String renterName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer days;
    private Double rentalTotal;
    private Double platformFee;
    private Double deposit;
    private Double total;
    private String paymentMethod;
    private String paymentRef;
    private String status;
    private Boolean hasDamage;
    private Double damageAmount;
    private Double depositRefund;
    private Instant createdAt;
    private Instant returnedAt;

    public static BookingResponse from(Booking b) {
        var equipment = b.getEquipment();
        var owner = equipment.getOwner();
        return new BookingResponse(
                b.getId(),
                equipment.getId(),
                equipment.getName(),
                owner != null ? owner.getId() : null,
                owner != null ? owner.getName() : "BorrowHub",
                b.getRenter().getId(),
                b.getRenter().getName(),
                b.getStartDate(),
                b.getEndDate(),
                b.getDays(),
                b.getRentalTotal(),
                b.getPlatformFee(),
                b.getDeposit(),
                b.getTotal(),
                b.getPaymentMethod(),
                b.getPaymentRef(),
                b.getStatus().name(),
                b.getHasDamage(),
                b.getDamageAmount(),
                b.getDepositRefund(),
                b.getCreatedAt(),
                b.getReturnedAt()
        );
    }
}