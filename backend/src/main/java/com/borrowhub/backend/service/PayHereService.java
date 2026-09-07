package com.borrowhub.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
public class PayHereService {

    private final String merchantId;
    private final String merchantSecret;

    public PayHereService(
            @Value("${payhere.merchant-id}") String merchantId,
            @Value("${payhere.merchant-secret}") String merchantSecret
    ) {
        this.merchantId = merchantId;
        this.merchantSecret = merchantSecret;
    }

    public String getMerchantId() {
        return merchantId;
    }

    /**
     * PayHere's required hash for the checkout form:
     * MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
     * amount must already be formatted like "1000.00" (2 decimals, no commas).
     */
    public String generateCheckoutHash(String orderId, String amount, String currency) {
        String secretHash = md5(merchantSecret).toUpperCase();
        String raw = merchantId + orderId + amount + currency + secretHash;
        return md5(raw).toUpperCase();
    }

    /**
     * Verifies the signature PayHere sends to your notify_url. Never trust a
     * payment notification without checking this — it's the only proof the
     * request actually came from PayHere and wasn't forged.
     * Formula: MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret).toUpperCase()).toUpperCase()
     */
    public boolean verifyNotification(
            String orderId, String payhereAmount, String payhereCurrency,
            String statusCode, String receivedMd5sig
    ) {
        String secretHash = md5(merchantSecret).toUpperCase();
        String raw = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + secretHash;
        String expected = md5(raw).toUpperCase();
        return expected.equalsIgnoreCase(receivedMd5sig);
    }

    private String md5(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("MD5 hashing failed", e);
        }
    }
}