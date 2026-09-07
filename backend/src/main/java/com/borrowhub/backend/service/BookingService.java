package com.borrowhub.backend.service;

import com.borrowhub.backend.config.AppConstants;
import com.borrowhub.backend.dto.booking.BookingRequest;
import com.borrowhub.backend.dto.booking.ReturnRequest;
import com.borrowhub.backend.dto.payment.PayHereCheckoutResponse;
import com.borrowhub.backend.entity.*;
import com.borrowhub.backend.exception.ApiException;
import com.borrowhub.backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentService equipmentService;
    private final PayHereService payHereService;

    private final String sandboxCheckoutUrl;
    private final String frontendUrl;
    private final String backendUrl;

    public BookingService(
            BookingRepository bookingRepository,
            EquipmentService equipmentService,
            PayHereService payHereService,
            @Value("${payhere.checkout-url}") String sandboxCheckoutUrl,
            @Value("${app.frontend-url}") String frontendUrl,
            @Value("${app.backend-url}") String backendUrl
    ) {
        this.bookingRepository = bookingRepository;
        this.equipmentService = equipmentService;
        this.payHereService = payHereService;
        this.sandboxCheckoutUrl = sandboxCheckoutUrl;
        this.frontendUrl = frontendUrl;
        this.backendUrl = backendUrl;
    }

    /**
     * Step 1 of real payment: create the booking as PENDING_PAYMENT and hand
     * back everything the frontend needs to redirect the browser to PayHere's
     * checkout page. Nothing is CONFIRMED yet — that only happens once
     * PayHere calls /api/payments/notify with a verified signature.
     */
    public PayHereCheckoutResponse initiateCheckout(BookingRequest req, User renter) {
        Equipment equipment = equipmentService.getById(req.getEquipmentId());

        if (equipment.getStatus() != EquipmentStatus.APPROVED) {
            throw ApiException.badRequest("This listing isn't available for booking yet.");
        }
        if (!Boolean.TRUE.equals(equipment.getAvailable())) {
            throw ApiException.badRequest("This item is currently unavailable.");
        }
        if (!req.getEndDate().isAfter(req.getStartDate())) {
            throw ApiException.badRequest("Return date must be after the pickup date.");
        }

        int days = (int) ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate());
        double rentalTotal = equipment.getPricePerDay() * days;
        double platformFee = Math.round(rentalTotal * AppConstants.PLATFORM_FEE_RATE);
        double deposit = equipment.getDeposit();
        double total = rentalTotal + platformFee + deposit;

        Booking booking = Booking.builder()
                .equipment(equipment)
                .renter(renter)
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .days(days)
                .rentalTotal(rentalTotal)
                .platformFee(platformFee)
                .deposit(deposit)
                .total(total)
                .paymentMethod("PayHere")
                .status(BookingStatus.PENDING_PAYMENT)
                .build();

        booking = bookingRepository.save(booking);

        String orderId = "BH-" + booking.getId() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        booking.setOrderId(orderId);
        bookingRepository.save(booking);

        String amount = String.format(Locale.US, "%.2f", total);
        String currency = "LKR";
        String hash = payHereService.generateCheckoutHash(orderId, amount, currency);

        String[] nameParts = renter.getName().trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : ".";

        return new PayHereCheckoutResponse(
                booking.getId(),
                sandboxCheckoutUrl,
                payHereService.getMerchantId(),
                frontendUrl + "/booking/success?bookingId=" + booking.getId(),
                frontendUrl + "/booking/cancelled?bookingId=" + booking.getId(),
                backendUrl + "/api/payments/notify",
                orderId,
                "Rental: " + equipment.getName(),
                currency,
                amount,
                firstName,
                lastName,
                renter.getEmail(),
                req.getPhone(),
                req.getAddress(),
                req.getCity(),
                "Sri Lanka",
                hash
        );
    }

    /** Called by PaymentController once PayHere's notify signature is verified. */
    public void confirmPayment(String orderId, String paymentId, boolean success) {
        Booking booking = bookingRepository.findByOrderId(orderId)
                .orElseThrow(() -> ApiException.notFound("No booking matches this order."));

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            return; // already processed — PayHere can resend notifications, so this must be idempotent
        }

        if (success) {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setPaymentRef(paymentId);
        } else {
            booking.setStatus(BookingStatus.FAILED);
        }
        bookingRepository.save(booking);
    }

    public List<Booking> getForRenter(User renter) {
        return bookingRepository.findByRenterOrderByCreatedAtDesc(renter);
    }

    public List<Booking> getForOwner(User owner) {
        return bookingRepository.findByEquipmentOwnerOrderByCreatedAtDesc(owner);
    }

    public Booking getById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Booking not found."));
    }

    public Booking markReturned(Long bookingId, ReturnRequest req, User actor) {
        Booking booking = getById(bookingId);

        User owner = booking.getEquipment().getOwner();
        boolean isOwner = owner != null && owner.getId().equals(actor.getId());
        boolean isAdmin = actor.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw ApiException.forbidden("Only the equipment owner can process a return.");
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw ApiException.badRequest("This booking isn't in a state that can be returned.");
        }

        boolean hasDamage = Boolean.TRUE.equals(req.getHasDamage());
        double damageAmount = hasDamage && req.getDamageAmount() != null ? req.getDamageAmount() : 0;
        double refund = hasDamage ? Math.max(0, booking.getDeposit() - damageAmount) : booking.getDeposit();

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setHasDamage(hasDamage);
        booking.setDamageAmount(damageAmount);
        booking.setDepositRefund(refund);
        booking.setReturnedAt(java.time.Instant.now());

        return bookingRepository.save(booking);
    }
}