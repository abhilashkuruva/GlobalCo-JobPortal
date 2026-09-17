package com.jobboard.controller;

import com.jobboard.entity.Application;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.ApplicationService;
import com.jobboard.service.FileStorageService;
import com.jobboard.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final JobService jobService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ApplicationController(ApplicationService applicationService,
                                 JobService jobService,
                                 UserRepository userRepository,
                                 FileStorageService fileStorageService) {
        this.applicationService = applicationService;
        this.jobService = jobService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<Page<Application>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getCurrentUser();
        return ResponseEntity.ok(applicationService.getApplicationsByCandidate(
                user.getId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedDate"))
        ));
    }

    @GetMapping("/candidate")
    public ResponseEntity<List<Application>> getCandidateApplications() {
        User user = getCurrentUser();
        return ResponseEntity.ok(applicationService.getApplicationsByCandidate(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    @PostMapping
    public ResponseEntity<Application> applyWithBody(@RequestBody Map<String, Object> body) {
        Long jobId = Long.valueOf(body.get("jobId").toString());
        String coverLetter = body.get("coverLetter") != null ? body.get("coverLetter").toString() : null;
        String resumeUrl = body.get("resumeUrl") != null ? body.get("resumeUrl").toString() : null;
        String resumeFileName = body.get("resumeFileName") != null ? body.get("resumeFileName").toString() : null;
        return ResponseEntity.ok(jobService.applyToJob(jobId, getCurrentUser(), resumeUrl, resumeFileName, coverLetter));
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<Application> applyWithPath(
            @PathVariable Long jobId,
            @RequestBody(required = false) Map<String, Object> body) {
        String coverLetter = body != null && body.get("coverLetter") != null ? body.get("coverLetter").toString() : null;
        String resumeUrl = body != null && body.get("resumeUrl") != null ? body.get("resumeUrl").toString() : null;
        String resumeFileName = body != null && body.get("resumeFileName") != null ? body.get("resumeFileName").toString() : null;
        return ResponseEntity.ok(jobService.applyToJob(jobId, getCurrentUser(), resumeUrl, resumeFileName, coverLetter));
    }

    @PostMapping(value = "/apply", consumes = {"multipart/form-data"})
    public ResponseEntity<?> applyWithCustomResume(
            @RequestParam("jobId") Long jobId,
            @RequestParam(value = "coverLetter", required = false) String coverLetter,
            @RequestParam(value = "resume", required = false) org.springframework.web.multipart.MultipartFile resume
    ) {
        String customResumeUrl = null;
        String customResumeFileName = null;

        if (resume != null && !resume.isEmpty()) {
            String originalName = resume.getOriginalFilename() != null ? resume.getOriginalFilename() : "resume.pdf";
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : "";
            if (!java.util.List.of(".pdf", ".doc", ".docx").contains(ext)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported resume format. Supported formats: PDF, DOC, DOCX."));
            }
            if (resume.getSize() > 15 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "Resume file size exceeds 15MB limit."));
            }

            try {
                String savedFileName = fileStorageService.storeResume(resume);
                customResumeUrl = "/api/resumes/view/" + savedFileName;
                customResumeFileName = originalName;
            } catch (java.io.IOException e) {
                return ResponseEntity.status(500).body(Map.of("message", "Failed to save uploaded resume: " + e.getMessage()));
            }
        }

        try {
            Application app = jobService.applyToJob(jobId, getCurrentUser(), customResumeUrl, customResumeFileName, coverLetter);
            return ResponseEntity.ok(app);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> withdrawApplicationDelete(@PathVariable Long id) {
        applicationService.withdrawApplication(id, getCurrentUser().getId());
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<?> withdrawApplicationPost(@PathVariable Long id) {
        applicationService.withdrawApplication(id, getCurrentUser().getId());
        return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
    }
}
