package com.jobboard.service;

import com.jobboard.entity.Job;
import com.jobboard.entity.RecruiterRequest;
import com.jobboard.entity.User;
import com.jobboard.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final RecruiterRequestRepository recruiterRequestRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final OfferRepository offerRepository;
    private final AuditLogService auditLogService;

    public AdminService(RecruiterRequestRepository recruiterRequestRepository,
                        UserRepository userRepository,
                        JobRepository jobRepository,
                        ApplicationRepository applicationRepository,
                        OfferRepository offerRepository,
                        AuditLogService auditLogService) {
        this.recruiterRequestRepository = recruiterRequestRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.offerRepository = offerRepository;
        this.auditLogService = auditLogService;
    }

    public List<RecruiterRequest> getRecruiterRequests(String status) {
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            return recruiterRequestRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase().trim());
        }
        return recruiterRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public RecruiterRequest getRecruiterRequestById(Long id) {
        return recruiterRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recruiter request not found: " + id));
    }

    @Transactional
    public RecruiterRequest approveRecruiterRequest(Long id, String adminUsername) {
        RecruiterRequest request = getRecruiterRequestById(id);
        request.setStatus("APPROVED");
        request.setReviewedBy(adminUsername);
        request.setReviewedAt(Instant.now());
        RecruiterRequest savedReq = recruiterRequestRepository.save(request);

        // Activate the recruiter user account with fallbacks (ID -> Email -> Username)
        User recruiterUser = null;
        if (request.getUserId() != null) {
            recruiterUser = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (recruiterUser == null && request.getEmail() != null) {
            recruiterUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        }
        if (recruiterUser == null && request.getUsername() != null) {
            recruiterUser = userRepository.findFirstByUsername(request.getUsername()).orElse(null);
        }

        if (recruiterUser != null) {
            recruiterUser.setEnabled(true);
            recruiterUser.setAccountStatus("APPROVED");
            userRepository.save(recruiterUser);

            if (request.getUserId() == null) {
                request.setUserId(recruiterUser.getId());
                savedReq = recruiterRequestRepository.save(request);
            }
        }

        auditLogService.logEvent(
                "RECRUITER_APPROVED",
                recruiterUser != null ? recruiterUser.getId() : (request.getUserId() != null ? request.getUserId() : id),
                "Recruiter registration request for '" + request.getFullName() + "' (" + request.getCompanyName() + ") approved by admin: " + adminUsername
        );

        return savedReq;
    }

    @Transactional
    public RecruiterRequest rejectRecruiterRequest(Long id, String reason, String adminUsername) {
        RecruiterRequest request = getRecruiterRequestById(id);
        request.setStatus("REJECTED");
        request.setRejectionReason(reason != null && !reason.isBlank() ? reason.trim() : "Verification criteria not satisfied.");
        request.setReviewedBy(adminUsername);
        request.setReviewedAt(Instant.now());
        RecruiterRequest savedReq = recruiterRequestRepository.save(request);

        // Lock the recruiter user account with fallbacks
        User recruiterUser = null;
        if (request.getUserId() != null) {
            recruiterUser = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (recruiterUser == null && request.getEmail() != null) {
            recruiterUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        }
        if (recruiterUser == null && request.getUsername() != null) {
            recruiterUser = userRepository.findFirstByUsername(request.getUsername()).orElse(null);
        }

        if (recruiterUser != null) {
            recruiterUser.setEnabled(false);
            recruiterUser.setAccountStatus("REJECTED");
            userRepository.save(recruiterUser);
        }

        auditLogService.logEvent(
                "RECRUITER_REJECTED",
                recruiterUser != null ? recruiterUser.getId() : (request.getUserId() != null ? request.getUserId() : id),
                "Recruiter registration request for '" + request.getFullName() + "' rejected by admin: " + adminUsername + ". Reason: " + request.getRejectionReason()
        );

        return savedReq;
    }

    @Transactional
    public Job approveJob(Long jobId, String adminUsername) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        job.setStatus("APPROVED");
        Job saved = jobRepository.save(job);

        auditLogService.logEvent(
                "JOB_APPROVED",
                jobId,
                "Job opening '" + job.getTitle() + "' approved by admin: " + adminUsername
        );
        return saved;
    }

    @Transactional
    public Job rejectJob(Long jobId, String reason, String adminUsername) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        job.setStatus("REJECTED");
        Job saved = jobRepository.save(job);

        auditLogService.logEvent(
                "JOB_REJECTED",
                jobId,
                "Job opening '" + job.getTitle() + "' rejected by admin: " + adminUsername + (reason != null ? " Reason: " + reason : "")
        );
        return saved;
    }

    public Map<String, Object> getComprehensiveStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalJobSeekers = userRepository.countByRoles_Name("ROLE_CANDIDATE");
        long totalRecruiters = userRepository.countByRoles_Name("ROLE_RECRUITER");
        long pendingRecruiterRequests = recruiterRequestRepository.countByStatus("PENDING");
        long approvedRecruiterRequests = recruiterRequestRepository.countByStatus("APPROVED");
        long rejectedRecruiterRequests = recruiterRequestRepository.countByStatus("REJECTED");

        long pendingJobs = jobRepository.countByStatus("PENDING");
        long approvedJobs = jobRepository.countByStatus("APPROVED") + jobRepository.countByStatus("PUBLISHED");
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalOffers = offerRepository.count();

        stats.put("totalJobSeekers", totalJobSeekers);
        stats.put("totalRecruiters", totalRecruiters);
        stats.put("pendingRecruiterRequests", pendingRecruiterRequests);
        stats.put("approvedRecruiters", approvedRecruiterRequests);
        stats.put("rejectedRecruiters", rejectedRecruiterRequests);
        stats.put("pendingJobs", pendingJobs);
        stats.put("approvedJobs", approvedJobs);
        stats.put("activeJobs", approvedJobs);
        stats.put("totalJobs", totalJobs);
        stats.put("totalApplications", totalApplications);
        stats.put("totalOffers", totalOffers);
        stats.put("totalUsers", userRepository.count());

        return stats;
    }
}
