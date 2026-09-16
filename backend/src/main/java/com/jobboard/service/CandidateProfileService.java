package com.jobboard.service;

import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.Skill;
import com.jobboard.entity.User;
import com.jobboard.repository.CandidateProfileRepository;
import com.jobboard.repository.SkillRepository;
import com.jobboard.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public CandidateProfileService(CandidateProfileRepository candidateProfileRepository,
                                   UserRepository userRepository,
                                   SkillRepository skillRepository) {
        this.candidateProfileRepository = candidateProfileRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    public Optional<CandidateProfile> getProfileByUserId(Long userId) {
        return candidateProfileRepository.findByUserId(userId);
    }

    public CandidateProfile getOrCreateProfile(User user) {
        return candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    CandidateProfile profile = new CandidateProfile();
                    profile.setUser(user);
                    profile.setUserId(user.getId());
                    profile.setLocation(user.getLocation());
                    profile.setPhone(user.getMobileNumber());
                    profile.setProfileCompletionPercentage(calculateCompletion(profile));
                    return candidateProfileRepository.save(profile);
                });
    }

    @Transactional
    public CandidateProfile updateProfile(CandidateProfile profile) {
        profile.setProfileCompletionPercentage(calculateCompletion(profile));
        return candidateProfileRepository.save(profile);
    }

    @Transactional
    public void updateResumeUrl(String username, String resumeUrl) {
        updateResumeUrl(username, resumeUrl, null);
    }

    @Transactional
    public void updateResumeUrl(String username, String resumeUrl, String originalFileName) {
        userRepository.findFirstByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .ifPresent(user -> {
                    CandidateProfile profile = getOrCreateProfile(user);
                    profile.setResumeUrl(resumeUrl);
                    profile.setResumePath(resumeUrl);
                    if (originalFileName != null && !originalFileName.isBlank()) {
                        profile.setResumeFileName(originalFileName);
                    }
                    profile.setProfileCompletionPercentage(calculateCompletion(profile));
                    candidateProfileRepository.save(profile);
                });
    }

            @Transactional
            public CandidateProfile applyParsedResume(Long userId, ResumeParserService.ParsedResume parsed) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                CandidateProfile profile = getOrCreateProfile(user);

                if (parsed.currentJobTitle() != null && !parsed.currentJobTitle().isBlank()) {
                    profile.setCurrentJobTitle(parsed.currentJobTitle());
                }
                if (parsed.summary() != null && !parsed.summary().isBlank()) profile.setSummary(parsed.summary());
                if (parsed.location() != null && !parsed.location().isBlank()) profile.setLocation(parsed.location());
                if (parsed.phone() != null && !parsed.phone().isBlank()) profile.setPhone(parsed.phone());
                if (parsed.experienceYears() != null) profile.setTotalExperienceYears(parsed.experienceYears());
                if (parsed.education() != null && !parsed.education().isBlank()) profile.setEducation(parsed.education());

                for (String link : parsed.links()) {
                    String lower = link.toLowerCase(Locale.ROOT);
                    if (lower.contains("linkedin")) profile.setLinkedInUrl(link);
                    else if (lower.contains("github")) profile.setGitHubUrl(link);
                    else if (profile.getPortfolioUrl() == null) profile.setPortfolioUrl(link);
                }

                Set<Skill> skills = new LinkedHashSet<>();
                for (String skillName : parsed.skills()) skills.add(resolveSkill(skillName));
                profile.setSkills(skills);
                profile.setProfileCompletionPercentage(calculateCompletion(profile));
                return candidateProfileRepository.save(profile);
            }

    @Transactional
    public CandidateProfile addSkill(Long userId, String skillName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CandidateProfile profile = getOrCreateProfile(user);

        Skill skill = skillRepository.findByName(skillName.trim())
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(skillName.trim());
                    return skillRepository.save(s);
                });

        profile.getSkills().add(skill);
        profile.setProfileCompletionPercentage(calculateCompletion(profile));
        return candidateProfileRepository.save(profile);
    }

    @Transactional
    public CandidateProfile removeSkill(Long userId, String skillName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CandidateProfile profile = getOrCreateProfile(user);

        profile.getSkills().removeIf(s -> s.getName().equalsIgnoreCase(skillName.trim()));
        profile.setProfileCompletionPercentage(calculateCompletion(profile));
        return candidateProfileRepository.save(profile);
    }

    public int calculateCompletion(CandidateProfile profile) {
        if (profile == null) return 0;
        int score = 0;
        if (profile.getSummary() != null && !profile.getSummary().isBlank()) score += 20;
        if (profile.getLocation() != null && !profile.getLocation().isBlank()) score += 15;
        if (profile.getTotalExperienceYears() != null && profile.getTotalExperienceYears() > 0) score += 15;
        if (profile.getCurrentJobTitle() != null && !profile.getCurrentJobTitle().isBlank()) score += 15;
        if (profile.getExpectedSalary() != null && profile.getExpectedSalary().compareTo(BigDecimal.ZERO) > 0) score += 10;
        if (profile.getResumeUrl() != null && !profile.getResumeUrl().isBlank()) score += 15;
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) score += 10;
        return Math.min(100, score);
    }

    public List<String> getSkillSuggestions(String title) {
        if (title == null || title.isBlank()) {
            return List.of("Problem Solving", "System Design", "Agile", "Git", "REST APIs");
        }
        String lower = title.toLowerCase();
        if (lower.contains("java") || lower.contains("backend") || lower.contains("spring")) {
            return List.of("Spring Boot", "Hibernate", "SQL", "Microservices", "Docker", "AWS", "Kafka");
        } else if (lower.contains("react") || lower.contains("frontend") || lower.contains("web") || lower.contains("ui")) {
            return List.of("TypeScript", "React", "Next.js", "Tailwind CSS", "Redux", "Jest", "UI/UX");
        } else if (lower.contains("data") || lower.contains("python") || lower.contains("analytics")) {
            return List.of("Python", "SQL", "Pandas", "Machine Learning", "Tableau", "AWS", "Data Modeling");
        } else if (lower.contains("cloud") || lower.contains("devops") || lower.contains("infra")) {
            return List.of("AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Monitoring");
        }
        return List.of("System Design", "Java", "React", "Python", "SQL", "AWS", "Agile");
    }

    public Skill resolveSkill(String skillName) {
        return skillRepository.findByName(skillName)
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(skillName);
                    return skillRepository.save(s);
                });
    }
}
