package com.jobboard;

import com.jobboard.entity.Application;
import com.jobboard.entity.Job;
import com.jobboard.entity.User;
import com.jobboard.repository.ApplicationRepository;
import com.jobboard.service.ApplicationService;
import com.jobboard.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ApplicationService applicationService;

    private Application application;
    private User candidate;
    private Job job;

    @BeforeEach
    void setUp() {
        candidate = new User();
        candidate.setId(2L);
        candidate.setUsername("john.doe");
        candidate.setFirstName("John");
        candidate.setLastName("Doe");
        candidate.setEmail("john@example.com");

        job = new Job();
        job.setId(10L);
        job.setTitle("Senior Cloud Engineer");

        application = new Application();
        application.setId(100L);
        application.setCandidate(candidate);
        application.setJob(job);
        application.setStatus(Application.ApplicationStatus.APPLIED);
        application.setMatchScore(BigDecimal.valueOf(88.5));
    }

    @Test
    void testUpdateApplicationStatus() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        Application updated = applicationService.updateApplicationStatus(100L, "SHORTLISTED");

        assertNotNull(updated);
        assertEquals(Application.ApplicationStatus.SHORTLISTED, updated.getApplicationStatus());
        verify(notificationService, times(1)).createNotification(eq(2L), anyString());
    }

    @Test
    void testExportApplicantsToCsv() {
        when(applicationRepository.findByJob_Id(10L)).thenReturn(List.of(application));

        byte[] csv = applicationService.exportApplicantsToCsv(10L);

        assertNotNull(csv);
        String content = new String(csv);
        assertTrue(content.contains("Candidate Name,Email,Match Score,Status,Applied At"));
        assertTrue(content.contains("John Doe"));
        assertTrue(content.contains("john@example.com"));
        assertTrue(content.contains("88.5"));
    }

    @Test
    void testWithdrawApplication() {
        when(applicationRepository.findById(100L)).thenReturn(Optional.of(application));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> i.getArgument(0));

        applicationService.withdrawApplication(100L, 2L);

        assertEquals(Application.ApplicationStatus.WITHDRAWN, application.getApplicationStatus());
        verify(applicationRepository, times(1)).save(application);
    }
}
