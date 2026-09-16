package com.jobboard.controller;

import com.jobboard.dto.JobRequestDto;
import com.jobboard.entity.Application;
import com.jobboard.entity.Job;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.ApplicationService;
import com.jobboard.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.nio.file.Path;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/recruiter")
public class RecruiterController {

    private final JobService jobService;
    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    public RecruiterController(JobService jobService,
                               ApplicationService applicationService,
                               UserRepository userRepository) {
        this.jobService = jobService;
        this.applicationService = applicationService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @PostMapping("/jobs")
    public ResponseEntity<Job> createJob(@RequestBody JobRequestDto dto) {
        return ResponseEntity.ok(jobService.createJobFromDto(dto, getCurrentUser()));
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<Job> updateJob(@PathVariable Long id, @RequestBody JobRequestDto dto) {
        return ResponseEntity.ok(jobService.updateJob(id, dto, getCurrentUser().getId()));
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id, getCurrentUser().getId());
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Job> jobs = jobService.getJobsByRecruiter(
                getCurrentUser().getId(),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<List<Application>> getApplicants(@PathVariable Long jobId) {
        Job job = jobService.getJobById(jobId);
        if (!job.getRecruiterId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized: You do not manage this job posting");
        }
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    @GetMapping("/applications/{appId}/resume")
    public ResponseEntity<Resource> viewApplicantResume(@PathVariable Long appId) {
        try {
            Path resumePath = applicationService.getResumeForRecruiter(appId, getCurrentUser().getId());
            Resource resource = new UrlResource(resumePath.toUri());
            MediaType contentType = MediaTypeFactory.getMediaType(resource)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resumePath.getFileName().toString().replace("\"", "") + "\"")
                    .contentType(contentType)
                    .body(resource);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            throw new RuntimeException("Unable to open the applicant resume", e);
        }
    }

    @PutMapping("/applications/{appId}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable Long appId, @RequestBody Map<String, String> request) {
        Application app = applicationService.getApplicationById(appId);
        applicationService.verifyRecruiterAccess(app, getCurrentUser().getId());
        return ResponseEntity.ok(applicationService.updateApplicationStatus(appId, request.get("status")));
    }

    @PutMapping("/applications/{appId}/notes")
    public ResponseEntity<Application> updateNotes(@PathVariable Long appId, @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(applicationService.updateRecruiterNotes(appId, request.get("notes"), getCurrentUser().getId()));
    }

    @PutMapping("/applications/bulk-status")
    public ResponseEntity<?> bulkUpdateStatus(@RequestBody Map<String, Object> request) {
        List<?> rawIds = (List<?>) request.get("ids");
        List<Long> ids = rawIds.stream().map(o -> Long.valueOf(o.toString())).toList();
        String status = (String) request.get("status");
        applicationService.bulkUpdateStatus(ids, status);
        return ResponseEntity.ok(Map.of("message", "Bulk status updated successfully"));
    }

    @GetMapping("/jobs/{jobId}/applications/export")
    public ResponseEntity<byte[]> exportApplicationsZip(@PathVariable Long jobId) {
        Job job = jobService.getJobById(jobId);
        if (!job.getRecruiterId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized: You do not manage this job posting");
        }
        byte[] zipData = applicationService.exportApplicationsToZip(jobId);
        String safeTitle = job.getTitle() != null ? job.getTitle().replaceAll("[^a-zA-Z0-9._-]", "_") : "Job_" + jobId;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "_Applications_Export.zip\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zipData);
    }

    @GetMapping("/jobs/{jobId}/applications/export-excel")
    public ResponseEntity<byte[]> exportApplicationsExcel(@PathVariable Long jobId) {
        Job job = jobService.getJobById(jobId);
        if (!job.getRecruiterId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Unauthorized: You do not manage this job posting");
        }
        byte[] excelData = applicationService.exportApplicationsToExcel(jobId);
        String safeTitle = job.getTitle() != null ? job.getTitle().replaceAll("[^a-zA-Z0-9._-]", "_") : "Job_" + jobId;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + safeTitle + "_Applications.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }

    @GetMapping("/jobs/{jobId}/export-applicants")
    public ResponseEntity<byte[]> exportApplicantsLegacy(@PathVariable Long jobId) {
        return exportApplicationsZip(jobId);
    }
}
