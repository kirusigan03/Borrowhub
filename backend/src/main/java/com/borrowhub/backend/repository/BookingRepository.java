package com.borrowhub.backend.repository;

import com.borrowhub.backend.entity.Booking;
import com.borrowhub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRenterOrderByCreatedAtDesc(User renter);
    List<Booking> findByEquipmentOwnerOrderByCreatedAtDesc(User owner);
    Optional<Booking> findByOrderId(String orderId);
}