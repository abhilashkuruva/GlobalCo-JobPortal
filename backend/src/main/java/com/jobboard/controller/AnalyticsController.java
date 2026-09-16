package com.jobboard.controller;

import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService, UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @GetMapping("/candidate")
    public ResponseEntity<Map<String, Object>> getCandidateDashboard() {
        return ResponseEntity.ok(analyticsService.getCandidateStats(getCurrentUser().getId()));
    }

    @GetMapping("/recruiter")
    public ResponseEntity<Map<String, Object>> getRecruiterDashboard() {
        return ResponseEntity.ok(analyticsService.getRecruiterStats(getCurrentUser().getId()));
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(analyticsService.getAdminStats());
    }
}
