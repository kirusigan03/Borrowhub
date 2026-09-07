package com.borrowhub.backend.repository;

import com.borrowhub.backend.entity.Equipment;
import com.borrowhub.backend.entity.EquipmentStatus;
import com.borrowhub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByStatusOrderByCreatedAtDesc(EquipmentStatus status);
    List<Equipment> findByOwnerOrderByCreatedAtDesc(User owner);
}