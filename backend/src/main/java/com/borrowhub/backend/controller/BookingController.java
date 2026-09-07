package com.borrowhub.backend.controller;

import com.borrowhub.backend.dto.booking.BookingRequest;
import com.borrowhub.backend.dto.booking.BookingResponse;
import com.borrowhub.backend.dto.booking.ReturnRequest;
import com.borrowhub.backend.dto.payment.PayHereCheckoutResponse;
import com.borrowhub.backend.entity.User;
import com.borrowhub.backend.security.CurrentUser;
import com.borrowhub.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUser currentUser;

    public BookingController(BookingService bookingService, CurrentUser currentUser) {
        this.bookingService = bookingService;
        this.currentUser = currentUser;
    }

    /**
     * Creates a PENDING_PAYMENT booking and returns the fields the frontend
     * needs to auto-submit a form redirecting the browser to PayHere's
     * checkout page. The booking only becomes CONFIRMED once PayHere calls
     * back /api/payments/notify with a verified signature.
     */
    @PostMapping("/checkout")
    public PayHereCheckoutResponse checkout(@Valid @RequestBody BookingRequest request) {
        User renter = currentUser.require();
        return bookingService.initiateCheckout(request, renter);
    }

    @GetMapping("/{id}")
    public BookingResponse getOne(@PathVariable Long id) {
        return BookingResponse.from(bookingService.getById(id));
    }

    /** Bookings I've made as a renter. */
    @GetMapping("/mine")
    public List<BookingResponse> myBookings() {
        User renter = currentUser.require();
        return bookingService.getForRenter(renter).stream().map(BookingResponse::from).toList();
    }

    /** Bookings on equipment I own, as the owner. */
    @GetMapping("/owner")
    public List<BookingResponse> ownerBookings() {
        User owner = currentUser.require();
        return bookingService.getForOwner(owner).stream().map(BookingResponse::from).toList();
    }

    @PatchMapping("/{id}/return")
    public BookingResponse markReturned(@PathVariable Long id, @Valid @RequestBody ReturnRequest request) {
        User actor = currentUser.require();
        return BookingResponse.from(bookingService.markReturned(id, request, actor));
    }
}