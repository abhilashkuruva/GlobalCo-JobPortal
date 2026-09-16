package com.jobboard.controller;

import com.jobboard.dto.MatchScoreBreakdownDto;
import com.jobboard.entity.Application;
import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.Job;
import com.jobboard.entity.User;
import com.jobboard.repository.CandidateProfileRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;

    public JobController(JobService jobService,
                         UserRepository userRepository,
                         CandidateProfileRepository candidateProfileRepository) {
        this.jobService = jobService;
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Job>> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String title, // alias for keyword
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minExp,
            @RequestParam(required = false) String workMode,
            @RequestParam(required = false) String modes, // alias for comma-separated workMode
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        String effectiveKeyword = keyword != null ? keyword : title;
        String effectiveMode = workMode != null ? workMode : (modes != null && !modes.isBlank() ? modes.split(",")[0] : null);

        Sort.Direction direction = Sort.Direction.DESC;
        String property = "createdAt";

        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            property = parts[0].trim();
            if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
                direction = Sort.Direction.ASC;
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, property));
        Page<Job> jobs = jobService.searchJobsAdvanced(effectiveKeyword, location, minExp, effectiveMode, category, pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/{id}/match")
    public ResponseEntity<MatchScoreBreakdownDto> getJobMatchScore(@PathVariable Long id) {
        Job job = jobService.getJobById(id);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            MatchScoreBreakdownDto guestDto = new MatchScoreBreakdownDto();
            guestDto.setExplanation("Log in as a candidate to see your personalized match breakdown.");
            return ResponseEntity.ok(guestDto);
        }

        User user = userRepository.findByEmail(auth.getName())
                .or(() -> userRepository.findFirstByUsername(auth.getName()))
                .orElse(null);
        CandidateProfile profile = user != null ? candidateProfileRepository.findByUserId(user.getId()).orElse(null) : null;
        return ResponseEntity.ok(jobService.calculateMatchScoreBreakdown(job, profile));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Application> applyToJob(@PathVariable Long id) {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        User candidate = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));

        return ResponseEntity.ok(jobService.applyToJob(id, candidate));
    }
}
