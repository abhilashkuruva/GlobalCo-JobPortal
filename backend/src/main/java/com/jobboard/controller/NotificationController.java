package com.jobboard.controller;

import com.jobboard.entity.Notification;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(getCurrentUser().getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(getCurrentUser().getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id, getCurrentUser().getId());
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentUser().getId());
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
