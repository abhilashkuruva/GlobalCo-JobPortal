package com.jobboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Application {

    public enum ApplicationStatus {
        APPLIED,
        SCREENING,
        SHORTLISTED,
        INTERVIEW_SCHEDULED,
        INTERVIEW_COMPLETED,
        SELECTED,
        OFFER_SENT,
        OFFER_ACCEPTED,
        REJECTED,
        HIRED,
        WITHDRAWN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Job job;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnoreProperties({"password", "savedJobs", "roles", "hibernateLazyInitializer", "handler"})
    private User candidate;

    @Column(nullable = false)
    private String status = "APPLIED";

    private Instant appliedDate = Instant.now();

    private BigDecimal matchScore = BigDecimal.ZERO;

    @Column(length = 2000)
    private String recruiterNotes;

    @Column(length = 2000)
    private String coverLetter;

    private String resumeUrl;
    private String resumeFileName;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"application", "hibernateLazyInitializer", "handler"})
    private List<Interview> interviews = new ArrayList<>();

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"application", "hibernateLazyInitializer", "handler"})
    private Offer offer;

    public Application() {}

    // Convenience getters for ID references
    public Long getJobId() {
        return (job != null) ? job.getId() : null;
    }

    public Long getCandidateId() {
        return (candidate != null) ? candidate.getId() : null;
    }

    public Instant getAppliedAt() {
        return appliedDate;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedDate = appliedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }

    public User getCandidate() { return candidate; }
    public void setCandidate(User candidate) { this.candidate = candidate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public void setStatus(ApplicationStatus status) {
        this.status = status == null ? null : status.name();
    }

    public ApplicationStatus getApplicationStatus() {
        try {
            return status == null ? null : ApplicationStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public Instant getAppliedDate() { return appliedDate; }
    public void setAppliedDate(Instant appliedDate) { this.appliedDate = appliedDate; }

    public BigDecimal getMatchScore() { return matchScore; }
    public void setMatchScore(BigDecimal matchScore) { this.matchScore = matchScore; }

    public String getRecruiterNotes() { return recruiterNotes; }
    public void setRecruiterNotes(String recruiterNotes) { this.recruiterNotes = recruiterNotes; }

    public List<Interview> getInterviews() { return interviews; }
    public void setInterviews(List<Interview> interviews) { this.interviews = interviews; }

    public Offer getOffer() { return offer; }
    public void setOffer(Offer offer) { this.offer = offer; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }
}
