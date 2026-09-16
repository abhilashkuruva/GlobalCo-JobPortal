package com.jobboard.service;

import com.jobboard.dto.InterviewScheduleDto;
import com.jobboard.entity.Application;
import com.jobboard.entity.Interview;
import com.jobboard.entity.User;
import com.jobboard.repository.ApplicationRepository;
import com.jobboard.repository.InterviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    public InterviewService(InterviewRepository interviewRepository,
                            ApplicationRepository applicationRepository,
                            NotificationService notificationService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Interview scheduleInterview(InterviewScheduleDto dto, User interviewer) {
        Application app = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> new RuntimeException("Application not found: " + dto.getApplicationId()));

        if (interviewer != null) {
            boolean isAuthorized = interviewer.getRoles() != null && interviewer.getRoles().stream().anyMatch(
                    r -> "ROLE_ADMIN".equals(r.getName()) || "ROLE_RECRUITER".equals(r.getName())
            );
            if (!isAuthorized && app.getJob() != null && app.getJob().getRecruiter() != null
                    && !app.getJob().getRecruiter().getId().equals(interviewer.getId())) {
                throw new RuntimeException("Unauthorized: Only recruiters or admins can schedule interviews");
            }
        }

        Interview interview = new Interview();
        interview.setApplication(app);
        interview.setInterviewer(interviewer);
        interview.setInterviewDate(dto.getInterviewDate() != null ? dto.getInterviewDate() : Instant.now().plusSeconds(86400));
        interview.setInterviewType(dto.getInterviewType() != null ? dto.getInterviewType() : "Technical Round");
        interview.setMeetingLink(dto.getMeetingLink() != null ? dto.getMeetingLink() : "https://meet.google.com/xyz-work-job");
        interview.setFeedback(dto.getNotes());
        interview.setStatus("SCHEDULED");

        Interview saved = interviewRepository.save(interview);

        app.setStatus(Application.ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(app);

        if (app.getCandidate() != null) {
            notificationService.createNotification(
                    app.getCandidate().getId(),
                    "An interview has been scheduled for " + app.getJob().getTitle() + " on " + interview.getInterviewDate()
            );
        }

        return saved;
    }

    public List<Interview> getInterviewsByApplication(Long applicationId) {
        return interviewRepository.findByApplication_Id(applicationId);
    }

    @Transactional
    public Interview updateFeedback(Long id, String feedback, Integer score) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found: " + id));
        interview.setFeedback(feedback);
        interview.setScore(score);
        interview.setStatus("COMPLETED");

        Application application = interview.getApplication();
        if (application != null) {
            application.setStatus(Application.ApplicationStatus.INTERVIEW_COMPLETED);
            applicationRepository.save(application);

            if (application.getCandidate() != null) {
                notificationService.createNotification(
                        application.getCandidate().getId(),
                        "Interview feedback submitted for your application to " + application.getJob().getTitle()
                );
            }
        }

        return interviewRepository.save(interview);
    }
}
