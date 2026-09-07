package com.borrowhub.backend.service;

import com.borrowhub.backend.dto.equipment.EquipmentRequest;
import com.borrowhub.backend.entity.Equipment;
import com.borrowhub.backend.entity.EquipmentStatus;
import com.borrowhub.backend.entity.User;
import com.borrowhub.backend.exception.ApiException;
import com.borrowhub.backend.repository.EquipmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public EquipmentService(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    /** Public browse/search — only approved listings. */
    public List<Equipment> getLive() {
        return equipmentRepository.findByStatusOrderByCreatedAtDesc(EquipmentStatus.APPROVED);
    }

    public Equipment getById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("We couldn't find that listing."));
    }

    public List<Equipment> getMyListings(User owner) {
        return equipmentRepository.findByOwnerOrderByCreatedAtDesc(owner);
    }

    public List<Equipment> getPendingReview() {
        return equipmentRepository.findByStatusOrderByCreatedAtDesc(EquipmentStatus.PENDING_REVIEW);
    }

    public Equipment submit(EquipmentRequest req, User owner) {
        double pricePerDay = req.getPricePerDay();
        double deposit = req.getDeposit() != null ? req.getDeposit() : Math.round(pricePerDay * 2.5);

        Equipment equipment = Equipment.builder()
                .name(req.getName().trim())
                .category(req.getCategory())
                .pricePerDay(pricePerDay)
                .deposit(deposit)
                .location(req.getLocation().trim())
                .description(req.getDescription() != null ? req.getDescription().trim() : "")
                .condition(req.getCondition() != null ? req.getCondition() : "Good")
                .existingDamage(req.getExistingDamage() != null ? req.getExistingDamage().trim() : "")
                .available(true)
                .status(EquipmentStatus.PENDING_REVIEW)
                .image(req.getImage() != null && !req.getImage().isBlank()
                        ? req.getImage().trim()
                        : "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop")
                .owner(owner)
                .build();

        return equipmentRepository.save(equipment);
    }

    public Equipment approve(Long id) {
        Equipment equipment = getById(id);
        equipment.setStatus(EquipmentStatus.APPROVED);
        return equipmentRepository.save(equipment);
    }

    public Equipment reject(Long id) {
        Equipment equipment = getById(id);
        equipment.setStatus(EquipmentStatus.REJECTED);
        return equipmentRepository.save(equipment);
    }
}