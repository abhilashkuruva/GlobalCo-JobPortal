package com.jobboard;

import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.Skill;
import com.jobboard.repository.CandidateProfileRepository;
import com.jobboard.repository.SkillRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.CandidateProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CandidateProfileServiceTest {

    @Mock
    private CandidateProfileRepository candidateProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SkillRepository skillRepository;

    @InjectMocks
    private CandidateProfileService profileService;

    private CandidateProfile profile;

    @BeforeEach
    void setUp() {
        profile = new CandidateProfile();
        profile.setId(1L);
        profile.setUserId(10L);
    }

    @Test
    void testCalculateCompletionFull() {
        profile.setSummary("Seasoned software architect with 10 years experience.");
        profile.setLocation("Bengaluru");
        profile.setTotalExperienceYears(5);
        profile.setCurrentJobTitle("Senior Engineer");
        profile.setExpectedSalary(BigDecimal.valueOf(2500000));
        profile.setResumeUrl("/resumes/resume.pdf");

        Skill skill = new Skill(); skill.setName("Java");
        profile.setSkills(Set.of(skill));

        int completion = profileService.calculateCompletion(profile);

        assertEquals(100, completion);
    }

    @Test
    void testCalculateCompletionPartial() {
        profile.setSummary("Short bio");
        profile.setLocation("Hyderabad");

        int completion = profileService.calculateCompletion(profile);

        assertTrue(completion >= 35);
        assertTrue(completion < 100);
    }

    @Test
    void testGetSkillSuggestions() {
        List<String> suggestions = profileService.getSkillSuggestions("Java Developer");

        assertNotNull(suggestions);
        assertTrue(suggestions.contains("Spring Boot"));
    }
}
