package com.jobboard.controller;

import com.jobboard.entity.*;
import com.jobboard.repository.*;
import com.jobboard.service.AdminService;
import com.jobboard.service.AuditLogService;
import com.jobboard.service.JobService;
import com.jobboard.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final AdminService adminService;
    private final AuditLogService auditLogService;
    private final JobService jobService;
    private final FileStorageService fileStorageService;

    public AdminController(UserRepository userRepository,
                           JobRepository jobRepository,
                           ApplicationRepository applicationRepository,
                           CandidateProfileRepository candidateProfileRepository,
                           AdminService adminService,
                           AuditLogService auditLogService,
                           JobService jobService,
                           FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.adminService = adminService;
        this.auditLogService = auditLogService;
        this.jobService = jobService;
        this.fileStorageService = fileStorageService;
    }

    private String getAdminUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getComprehensiveStats());
    }

    // --- Recruiter Requests ---
    @GetMapping("/recruiter-requests")
    public ResponseEntity<List<RecruiterRequest>> getRecruiterRequests(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getRecruiterRequests(status));
    }

    @GetMapping("/recruiter-requests/{id}")
    public ResponseEntity<RecruiterRequest> getRecruiterRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getRecruiterRequestById(id));
    }

    @PostMapping("/recruiter-requests/{id}/approve")
    public ResponseEntity<RecruiterRequest> approveRecruiterRequest(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveRecruiterRequest(id, getAdminUsername()));
    }

    @PostMapping("/recruiter-requests/{id}/reject")
    public ResponseEntity<RecruiterRequest> rejectRecruiterRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(adminService.rejectRecruiterRequest(id, reason, getAdminUsername()));
    }

    @GetMapping("/recruiter-requests/document/{type}/{fileName}")
    public ResponseEntity<Resource> viewVerificationDocument(
            @PathVariable String type,
            @PathVariable String fileName) throws IOException {

        // Security: decode URL-encoded characters (handles spaces etc.) but prevent path traversal
        String decodedFileName = java.net.URLDecoder.decode(fileName, "UTF-8");

        // Strict path traversal prevention
        if (decodedFileName.contains("..") || decodedFileName.contains("/") || decodedFileName.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }

        Path filePath = fileStorageService.resolveVerificationDocument(decodedFileName);

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());

        // Determine MIME type
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            String lowerName = decodedFileName.toLowerCase();
            if (lowerName.endsWith(".pdf"))  contentType = "application/pdf";
            else if (lowerName.endsWith(".png"))  contentType = "image/png";
            else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) contentType = "image/jpeg";
            else contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + decodedFileName + "\"")
                .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition")
                .body(resource);
    }

    // --- Separate Recruiter & Job Seeker Listings ---
    @GetMapping("/recruiters")
    public ResponseEntity<List<Map<String, Object>>> getAllRecruiters() {
        List<User> recruiters = userRepository.findByRoles_Name("ROLE_RECRUITER");
        List<Map<String, Object>> result = new ArrayList<>();

        for (User r : recruiters) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("username", r.getUsername());
            map.put("email", r.getEmail());
            map.put("fullName", (r.getFirstName() != null ? r.getFirstName() : "") + " " + (r.getLastName() != null ? r.getLastName() : ""));
            map.put("phone", r.getMobileNumber());
            map.put("location", r.getLocation());
            map.put("enabled", r.isEnabled());
            map.put("accountStatus", r.getAccountStatus());
            map.put("createdAt", r.getCreatedAt());

            long jobsPosted = jobRepository.countByRecruiterId(r.getId());
            long applicantsReceived = applicationRepository.countByRecruiterId(r.getId());
            map.put("jobsCount", jobsPosted);
            map.put("applicantsCount", applicantsReceived);

            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/job-seekers")
    public ResponseEntity<List<Map<String, Object>>> getAllJobSeekers() {
        List<User> seekers = userRepository.findByRoles_Name("ROLE_CANDIDATE");
        List<Map<String, Object>> result = new ArrayList<>();

        for (User s : seekers) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("username", s.getUsername());
            map.put("email", s.getEmail());
            map.put("fullName", (s.getFirstName() != null ? s.getFirstName() : "") + " " + (s.getLastName() != null ? s.getLastName() : ""));
            map.put("phone", s.getMobileNumber());
            map.put("location", s.getLocation());
            map.put("enabled", s.isEnabled());
            map.put("accountStatus", s.getAccountStatus());
            map.put("createdAt", s.getCreatedAt());

            CandidateProfile profile = candidateProfileRepository.findByUserId(s.getId()).orElse(null);
            if (profile != null) {
                map.put("education", profile.getEducation());
                map.put("experienceYears", profile.getTotalExperienceYears());
                map.put("skills", profile.getSkills());
                map.put("resumeUrl", profile.getResumeUrl());
                map.put("resumeFileName", profile.getResumeFileName());
            }

            map.put("applicationsCount", applicationRepository.countByCandidate_Id(s.getId()));
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        user.setEnabled(!user.isEnabled());
        user.setAccountStatus(user.isEnabled() ? "APPROVED" : "SUSPENDED");
        User saved = userRepository.save(user);
        auditLogService.logEvent("USER_STATUS_TOGGLE", user.getId(), "Account state changed to: " + user.getAccountStatus() + " by " + getAdminUsername());
        return ResponseEntity.ok(saved);
    }

    // --- Job Moderation ---
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        List<Job> jobs = jobRepository.findAll();
        jobs.forEach(j -> j.setApplicantCount(applicationRepository.countByJob_Id(j.getId())));
        return ResponseEntity.ok(jobs);
    }

    @PatchMapping("/jobs/{id}/approve")
    public ResponseEntity<Job> approveJob(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveJob(id, getAdminUsername()));
    }

    @PatchMapping("/jobs/{id}/reject")
    public ResponseEntity<Job> rejectJob(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(adminService.rejectJob(id, reason, getAdminUsername()));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        jobService.deleteJobByAdmin(id);
        auditLogService.logEvent("JOB_MODERATED_DELETE", id, "Job listing removed by administrator: " + getAdminUsername());
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully by administrator"));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogService.getRecentLogs());
    }
}
