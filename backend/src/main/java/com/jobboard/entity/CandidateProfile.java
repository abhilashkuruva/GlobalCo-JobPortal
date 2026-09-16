package com.jobboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "candidate_profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CandidateProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"savedJobs", "roles", "password", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String location;
    private Integer totalExperienceYears;
    private String currentJobTitle;
    private BigDecimal expectedSalary;
    private String resumePath;
    private String resumeUrl;
    private String resumeFileName;
    private Integer profileCompletionPercentage = 0;
    private String education;
    private String phone;
    private String portfolioUrl;
    private String linkedInUrl;
    private String gitHubUrl;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "candidate_skills",
            joinColumns = @JoinColumn(name = "candidate_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<Skill> skills = new HashSet<>();

    public CandidateProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { 
        return (user != null && user.getId() != null) ? user.getId() : userId; 
    }
    public void setUserId(Long userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { 
        this.user = user; 
        if (user != null && user.getId() != null) {
            this.userId = user.getId();
        }
    }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getTotalExperienceYears() { return totalExperienceYears; }
    public void setTotalExperienceYears(Integer totalExperienceYears) { this.totalExperienceYears = totalExperienceYears; }

    public String getCurrentJobTitle() { return currentJobTitle; }
    public void setCurrentJobTitle(String currentJobTitle) { this.currentJobTitle = currentJobTitle; }

    public BigDecimal getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(BigDecimal expectedSalary) { this.expectedSalary = expectedSalary; }

    public String getResumePath() { return normalizeResumeUrl(resumePath != null ? resumePath : resumeUrl); }
    public void setResumePath(String resumePath) { 
        this.resumePath = resumePath; 
        this.resumeUrl = resumePath;
    }

    public String getResumeUrl() { return normalizeResumeUrl(resumeUrl != null ? resumeUrl : resumePath); }
    public void setResumeUrl(String resumeUrl) { 
        this.resumeUrl = resumeUrl; 
        this.resumePath = resumeUrl;
    }

    public String getResumeFileName() { return resumeFileName; }
    public void setResumeFileName(String resumeFileName) { this.resumeFileName = resumeFileName; }

    public Integer getProfileCompletionPercentage() { return profileCompletionPercentage; }
    public void setProfileCompletionPercentage(Integer profileCompletionPercentage) { this.profileCompletionPercentage = profileCompletionPercentage; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getLinkedInUrl() { return linkedInUrl; }
    public void setLinkedInUrl(String linkedInUrl) { this.linkedInUrl = linkedInUrl; }

    public String getGitHubUrl() { return gitHubUrl; }
    public void setGitHubUrl(String gitHubUrl) { this.gitHubUrl = gitHubUrl; }

    private String normalizeResumeUrl(String value) {
        if (value == null || value.isBlank() || value.startsWith("/api/resumes/view/")) return value;
        String fileName = value.substring(value.lastIndexOf('/') + 1);
        return "/api/resumes/view/" + fileName;
    }

    public Set<Skill> getSkills() { return skills; }
    public void setSkills(Set<Skill> skills) { this.skills = skills != null ? skills : new HashSet<>(); }
}