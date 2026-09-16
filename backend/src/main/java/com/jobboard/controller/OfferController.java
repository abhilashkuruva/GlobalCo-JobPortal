package com.jobboard.controller;

import com.jobboard.dto.OfferRequestDto;
import com.jobboard.entity.Offer;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.OfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offerService;
    private final UserRepository userRepository;

    public OfferController(OfferService offerService, UserRepository userRepository) {
        this.offerService = offerService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @PostMapping
    public ResponseEntity<Offer> createOffer(@RequestBody OfferRequestDto dto) {
        return ResponseEntity.ok(offerService.createOffer(dto, getCurrentUser()));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<Offer> getOfferByApplication(@PathVariable Long applicationId) {
        return offerService.getOfferByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<Offer> respondToOffer(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(offerService.respondToOffer(id, status, getCurrentUser().getId()));
    }
}
