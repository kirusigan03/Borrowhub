package com.borrowhub.backend.controller;

import com.borrowhub.backend.dto.equipment.EquipmentRequest;
import com.borrowhub.backend.dto.equipment.EquipmentResponse;
import com.borrowhub.backend.entity.User;
import com.borrowhub.backend.security.CurrentUser;
import com.borrowhub.backend.service.EquipmentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final CurrentUser currentUser;

    public EquipmentController(EquipmentService equipmentService, CurrentUser currentUser) {
        this.equipmentService = equipmentService;
        this.currentUser = currentUser;
    }

    /** Public browse/search — only approved listings. */
    @GetMapping
    public List<EquipmentResponse> browse() {
        return equipmentService.getLive().stream().map(EquipmentResponse::from).toList();
    }

    @GetMapping("/{id}")
    public EquipmentResponse getOne(@PathVariable Long id) {
        return EquipmentResponse.from(equipmentService.getById(id));
    }

    /** Submit a new listing — goes in as PENDING_REVIEW. */
    @PostMapping
    public EquipmentResponse submit(@Valid @RequestBody EquipmentRequest request) {
        User owner = currentUser.require();
        return EquipmentResponse.from(equipmentService.submit(request, owner));
    }

    @GetMapping("/mine")
    public List<EquipmentResponse> myListings() {
        User owner = currentUser.require();
        return equipmentService.getMyListings(owner).stream().map(EquipmentResponse::from).toList();
    }

    /** Admin review queue. */
    @GetMapping("/pending")
    public List<EquipmentResponse> pending() {
        return equipmentService.getPendingReview().stream().map(EquipmentResponse::from).toList();
    }

    @PatchMapping("/{id}/approve")
    public EquipmentResponse approve(@PathVariable Long id) {
        return EquipmentResponse.from(equipmentService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public EquipmentResponse reject(@PathVariable Long id) {
        return EquipmentResponse.from(equipmentService.reject(id));
    }
}