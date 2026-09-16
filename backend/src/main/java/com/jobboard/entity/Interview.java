package com.jobboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "interviews")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Interview {

    public enum InterviewStatus {
        SCHEDULED,
        RESCHEDULED,
        COMPLETED,
        CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"interviews", "offer", "hibernateLazyInitializer", "handler"})
    private Application application;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "interviewer_id")
    @JsonIgnoreProperties({"password", "savedJobs", "roles", "hibernateLazyInitializer", "handler"})
    private User interviewer;

    private Instant interviewDate = Instant.now();
    private String interviewType = "Technical Interview";
    private String meetingLink;
    private String status = "SCHEDULED";
    
    @Column(length = 2000)
    private String feedback;
    private Integer score; // 1-10

    public Interview() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return (application != null) ? application.getId() : null; }
    public Long getInterviewerId() { return (interviewer != null) ? interviewer.getId() : null; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public User getInterviewer() { return interviewer; }
    public void setInterviewer(User interviewer) { this.interviewer = interviewer; }

    public Instant getInterviewDate() { return interviewDate; }
    public void setInterviewDate(Instant interviewDate) { this.interviewDate = interviewDate; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public void setStatus(InterviewStatus status) {
        this.status = status == null ? null : status.name();
    }

    public InterviewStatus getInterviewStatus() {
        try {
            return status == null ? null : InterviewStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}