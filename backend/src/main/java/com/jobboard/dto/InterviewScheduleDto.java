package com.jobboard.dto;

import java.time.Instant;

public class InterviewScheduleDto {
    private Long applicationId;
    private Instant interviewDate;
    private String interviewType;
    private String meetingLink;
    private String notes;

    public InterviewScheduleDto() {}

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Instant getInterviewDate() { return interviewDate; }
    
    public void setInterviewDate(Instant interviewDate) { 
        this.interviewDate = interviewDate; 
    }

    public void setInterviewDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            this.interviewDate = Instant.now().plusSeconds(86400);
            return;
        }
        try {
            this.interviewDate = Instant.parse(dateStr.trim());
        } catch (Exception e1) {
            try {
                this.interviewDate = java.time.LocalDateTime.parse(dateStr.trim())
                        .atZone(java.time.ZoneId.systemDefault())
                        .toInstant();
            } catch (Exception e2) {
                try {
                    this.interviewDate = java.time.OffsetDateTime.parse(dateStr.trim()).toInstant();
                } catch (Exception e3) {
                    this.interviewDate = Instant.now().plusSeconds(86400);
                }
            }
        }
    }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
