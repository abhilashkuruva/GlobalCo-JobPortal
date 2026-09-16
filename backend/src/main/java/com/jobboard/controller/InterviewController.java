package com.jobboard.controller;

import com.jobboard.dto.InterviewScheduleDto;
import com.jobboard.entity.Interview;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.InterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    public InterviewController(InterviewService interviewService, UserRepository userRepository) {
        this.interviewService = interviewService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @PostMapping("/schedule")
    public ResponseEntity<Interview> scheduleInterview(@RequestBody InterviewScheduleDto dto) {
        return ResponseEntity.ok(interviewService.scheduleInterview(dto, getCurrentUser()));
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Interview>> getInterviewsByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.getInterviewsByApplication(applicationId));
    }

    @PutMapping("/{id}/feedback")
    public ResponseEntity<Interview> submitFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        String feedback = (String) request.get("feedback");
        Integer score = request.get("score") != null ? Integer.valueOf(request.get("score").toString()) : 8;
        return ResponseEntity.ok(interviewService.updateFeedback(id, feedback, score));
    }
}
