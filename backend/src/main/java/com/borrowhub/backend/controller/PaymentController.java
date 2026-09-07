package com.borrowhub.backend.controller;

import com.borrowhub.backend.service.BookingService;
import com.borrowhub.backend.service.PayHereService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// PayHere's servers POST here directly (server-to-server) once a payment
// finishes — this is NOT called by your frontend/browser. It must be
// reachable from the public internet for PayHere to reach it (see README —
// localhost needs a tunnel like ngrok for this to work in development).
@RestController
public class PaymentController {

    private final PayHereService payHereService;
    private final BookingService bookingService;

    public PaymentController(PayHereService payHereService, BookingService bookingService) {
        this.payHereService = payHereService;
        this.bookingService = bookingService;
    }

    @PostMapping(value = "/api/payments/notify", consumes = "application/x-www-form-urlencoded")
    public ResponseEntity<String> notify(
            @RequestParam("merchant_id") String merchantId,
            @RequestParam("order_id") String orderId,
            @RequestParam("payment_id") String paymentId,
            @RequestParam("payhere_amount") String payhereAmount,
            @RequestParam("payhere_currency") String payhereCurrency,
            @RequestParam("status_code") String statusCode,
            @RequestParam("md5sig") String md5sig
    ) {
        boolean verified = payHereService.verifyNotification(orderId, payhereAmount, payhereCurrency, statusCode, md5sig);

        if (!verified) {
            // Someone forged this request, or the amounts don't match — do NOT confirm the booking.
            return ResponseEntity.status(400).body("Invalid signature");
        }

        // PayHere status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
        boolean success = "2".equals(statusCode);
        bookingService.confirmPayment(orderId, paymentId, success);

        return ResponseEntity.ok("OK");
    }
}