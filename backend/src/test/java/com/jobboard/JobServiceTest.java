package com.jobboard;

import com.jobboard.dto.MatchScoreBreakdownDto;
import com.jobboard.entity.*;
import com.jobboard.repository.*;
import com.jobboard.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SkillRepository skillRepository;

    @InjectMocks
    private JobService jobService;

    private Job sampleJob;
    private CandidateProfile sampleProfile;
    private User candidateUser;

    @BeforeEach
    void setUp() {
        candidateUser = new User();
        candidateUser.setId(10L);
        candidateUser.setUsername("candidate.test");
        candidateUser.setEmail("cand@test.com");

        sampleJob = new Job();
        sampleJob.setId(1L);
        sampleJob.setTitle("Java Backend Engineer");
        sampleJob.setLocation("Bengaluru");
        sampleJob.setExperienceRequired(3);
        sampleJob.setWorkMode("Hybrid");

        Skill java = new Skill(); java.setName("Java");
        Skill spring = new Skill(); spring.setName("Spring Boot");
        Skill sql = new Skill(); sql.setName("SQL");
        sampleJob.setSkills(Set.of(java, spring, sql));

        sampleProfile = new CandidateProfile();
        sampleProfile.setId(5L);
        sampleProfile.setUserId(10L);
        sampleProfile.setLocation("Bengaluru");
        sampleProfile.setTotalExperienceYears(4);
        sampleProfile.setSkills(new HashSet<>(Set.of(java, spring)));
        sampleProfile.setResumeUrl("/resumes/sample_resume.pdf");
    }

    @Test
    void testCalculateMatchScoreBreakdown() {
        MatchScoreBreakdownDto breakdown = jobService.calculateMatchScoreBreakdown(sampleJob, sampleProfile);

        assertNotNull(breakdown);
        assertTrue(breakdown.getSkillScore() > 0);
        assertEquals(100, breakdown.getExperienceScore()); // 4 yrs > 3 required
        assertEquals(100, breakdown.getLocationScore()); // Both Bengaluru
        assertTrue(breakdown.getOverallScore().compareTo(BigDecimal.valueOf(50)) > 0);
        assertTrue(breakdown.getMatchingSkills().contains("java") || breakdown.getMatchingSkills().contains("Java") || breakdown.getMatchingSkills().stream().anyMatch(s -> s.equalsIgnoreCase("java")));
        assertNotNull(breakdown.getExplanation());
    }

    @Test
    void testApplyToJobSuccess() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(sampleJob));
        when(applicationRepository.existsByJob_IdAndCandidate_Id(1L, 10L)).thenReturn(false);
        when(candidateProfileRepository.findByUserId(10L)).thenReturn(Optional.of(sampleProfile));
        when(applicationRepository.save(any(Application.class))).thenAnswer(i -> {
            Application a = i.getArgument(0);
            a.setId(99L);
            return a;
        });

        Application app = jobService.applyToJob(1L, candidateUser);

        assertNotNull(app);
        assertEquals(Application.ApplicationStatus.APPLIED, app.getApplicationStatus());
        verify(applicationRepository, times(1)).save(any(Application.class));
    }

    @Test
    void testApplyToJobAlreadyAppliedThrows() {
        when(jobRepository.findById(1L)).thenReturn(Optional.of(sampleJob));
        when(applicationRepository.existsByJob_IdAndCandidate_Id(1L, 10L)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> jobService.applyToJob(1L, candidateUser));
        assertTrue(ex.getMessage().contains("already applied"));
    }
}
