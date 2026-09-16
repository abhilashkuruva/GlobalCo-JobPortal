package com.jobboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 4000)
    private String description;

    private String location;
    private Integer experienceRequired;
    private Integer minExperience = 0;
    private Integer maxExperience = 10;
    private Integer openings = 1;
    private String department;
    private String industry;
    private String applicationDeadline;

    @Column(length = 3000)
    private String responsibilities;

    @Column(length = 2000)
    private String benefits;

    @Column(length = 1000)
    private String educationRequirements;

    private String status = "APPROVED"; // PENDING, APPROVED, REJECTED, CLOSED, EXPIRED
    
    @Column(name = "recruiter_id")
    private Long recruiterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"password", "savedJobs", "roles", "hibernateLazyInitializer", "handler"})
    private User recruiter;

    private Instant createdAt = Instant.now();

    private String salaryRange; // e.g., "₹12-18 LPA"
    private String jobType = "Full Time";     // e.g., "Full Time", "Contract", "Part-Time", "Internship"
    private String workMode = "Hybrid";    // e.g., "Remote", "Hybrid", "On-site"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties({"jobs", "hibernateLazyInitializer", "handler"})
    private Company company;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"jobs", "hibernateLazyInitializer", "handler"})
    private Category category;

    // Required Skills (default skills collection)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @JsonIgnoreProperties({"jobs", "hibernateLazyInitializer", "handler"})
    private Set<Skill> skills = new HashSet<>();

    // Preferred Skills
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_preferred_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @JsonIgnoreProperties({"jobs", "hibernateLazyInitializer", "handler"})
    private Set<Skill> preferredSkills = new HashSet<>();

    // Additional Skills
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "job_additional_skills",
            joinColumns = @JoinColumn(name = "job_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    @JsonIgnoreProperties({"jobs", "hibernateLazyInitializer", "handler"})
    private Set<Skill> additionalSkills = new HashSet<>();

    @Transient
    private Long applicantCount = 0L;

    public Job() {}

    // Convenience property for UI
    public String getCompanyName() {
        return company != null ? company.getName() : null;
    }

    public String getCategoryName() {
        return category != null ? category.getName() : null;
    }

    // Legacy alias expected by services
    @Transient
    public Set<Skill> getRequiredSkills() {
        return skills;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getExperienceRequired() { return experienceRequired; }
    public void setExperienceRequired(Integer experienceRequired) { this.experienceRequired = experienceRequired; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getRecruiterId() { 
        return (recruiter != null && recruiter.getId() != null) ? recruiter.getId() : recruiterId; 
    }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public User getRecruiter() { return recruiter; }
    public void setRecruiter(User recruiter) { 
        this.recruiter = recruiter; 
        if (recruiter != null && recruiter.getId() != null) {
            this.recruiterId = recruiter.getId();
        }
    }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Set<Skill> getSkills() { return skills; }
    public void setSkills(Set<Skill> skills) { this.skills = skills != null ? skills : new HashSet<>(); }

    public Integer getMinExperience() { return minExperience; }
    public void setMinExperience(Integer minExperience) { this.minExperience = minExperience; }

    public Integer getMaxExperience() { return maxExperience; }
    public void setMaxExperience(Integer maxExperience) { this.maxExperience = maxExperience; }

    public Integer getOpenings() { return openings; }
    public void setOpenings(Integer openings) { this.openings = openings; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(String applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }

    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }

    public String getEducationRequirements() { return educationRequirements; }
    public void setEducationRequirements(String educationRequirements) { this.educationRequirements = educationRequirements; }

    public Set<Skill> getPreferredSkills() { return preferredSkills; }
    public void setPreferredSkills(Set<Skill> preferredSkills) { this.preferredSkills = preferredSkills != null ? preferredSkills : new HashSet<>(); }

    public Set<Skill> getAdditionalSkills() { return additionalSkills; }
    public void setAdditionalSkills(Set<Skill> additionalSkills) { this.additionalSkills = additionalSkills != null ? additionalSkills : new HashSet<>(); }

    public Long getApplicantCount() { return applicantCount; }
    public void setApplicantCount(Long applicantCount) { this.applicantCount = applicantCount; }
}