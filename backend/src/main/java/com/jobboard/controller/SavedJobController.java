package com.jobboard.controller;

import com.jobboard.entity.Job;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/saved-jobs")
public class SavedJobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    public SavedJobController(JobService jobService, UserRepository userRepository) {
        this.jobService = jobService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<?> saveJob(@PathVariable Long jobId) {
        User user = getCurrentUser();
        Job job = jobService.getJobById(jobId);
        user.getSavedJobs().add(job);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Job saved successfully", "saved", true));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<?> unsaveJob(@PathVariable Long jobId) {
        User user = getCurrentUser();
        Job job = jobService.getJobById(jobId);
        user.getSavedJobs().remove(job);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Job unsaved successfully", "saved", false));
    }

    @GetMapping
    public ResponseEntity<Set<Job>> getSavedJobs() {
        return ResponseEntity.ok(getCurrentUser().getSavedJobs());
    }

    @GetMapping("/ids")
    public ResponseEntity<Set<Long>> getSavedJobIds() {
        Set<Long> ids = getCurrentUser().getSavedJobs().stream().map(Job::getId).collect(Collectors.toSet());
        return ResponseEntity.ok(ids);
    }
}
