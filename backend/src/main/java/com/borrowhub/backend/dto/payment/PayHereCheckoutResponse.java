package com.borrowhub.backend.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;

// Everything the frontend needs to build the auto-submit form that redirects
// the browser to PayHere's checkout page. See PayHere's "Checkout API" docs —
// these field names must match exactly what PayHere expects as POST fields.
@Data
@AllArgsConstructor
public class PayHereCheckoutResponse {
    private Long bookingId;
    private String checkoutUrl;      // where the frontend's <form> should POST to
    private String merchantId;
    private String returnUrl;
    private String cancelUrl;
    private String notifyUrl;
    private String orderId;
    private String itemsDescription;
    private String currency;
    private String amount;           // formatted "1000.00" — PayHere is picky about this
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String hash;
}