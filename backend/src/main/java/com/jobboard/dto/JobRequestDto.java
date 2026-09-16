package com.jobboard.dto;

import com.fasterxml.jackson.annotation.JsonSetter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class JobRequestDto {
    private String title;
    private String description;
    private String location;
    private Integer experienceRequired;
    private Integer minExperience = 0;
    private Integer maxExperience = 10;
    private Integer openings = 1;
    private String department;
    private String industry;
    private String applicationDeadline;
    private String salaryRange;
    private String jobType = "Full Time";
    private String workMode = "Hybrid";
    private String companyName;
    private String categoryName;
    private String responsibilities;
    private String benefits;
    private String educationRequirements;
    private String status = "PENDING"; // New recruiter jobs default to PENDING for admin approval

    private List<String> skills = new ArrayList<>(); // Required skills
    private List<String> preferredSkills = new ArrayList<>();
    private List<String> additionalSkills = new ArrayList<>();

    public JobRequestDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getExperienceRequired() { return experienceRequired != null ? experienceRequired : minExperience; }
    public void setExperienceRequired(Integer experienceRequired) { this.experienceRequired = experienceRequired; }

    public Integer getMinExperience() { return minExperience; }
    public void setMinExperience(Integer minExperience) { this.minExperience = minExperience; }

    public Integer getMaxExperience() { return maxExperience; }
    public void setMaxExperience(Integer maxExperience) { this.maxExperience = maxExperience; }

    public Integer getOpenings() { return openings != null ? openings : 1; }
    public void setOpenings(Integer openings) { this.openings = openings; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(String applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public String getJobType() { return jobType; }
    public void setJobType(String jobType) { this.jobType = jobType; }

    public String getWorkMode() { return workMode; }
    public void setWorkMode(String workMode) { this.workMode = workMode; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getResponsibilities() { return responsibilities; }
    public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }

    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }

    public String getEducationRequirements() { return educationRequirements; }
    public void setEducationRequirements(String educationRequirements) { this.educationRequirements = educationRequirements; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getSkills() { return skills; }

    @JsonSetter("skills")
    public void setSkills(List<Object> rawSkills) {
        this.skills = parseSkillList(rawSkills);
    }

    @JsonSetter("requiredSkills")
    public void setRequiredSkills(List<Object> rawSkills) {
        List<String> parsed = parseSkillList(rawSkills);
        if (!parsed.isEmpty()) {
            this.skills = parsed;
        }
    }

    public List<String> getPreferredSkills() { return preferredSkills; }

    @JsonSetter("preferredSkills")
    public void setPreferredSkills(List<Object> rawSkills) {
        this.preferredSkills = parseSkillList(rawSkills);
    }

    public List<String> getAdditionalSkills() { return additionalSkills; }

    @JsonSetter("additionalSkills")
    public void setAdditionalSkills(List<Object> rawSkills) {
        this.additionalSkills = parseSkillList(rawSkills);
    }

    private List<String> parseSkillList(List<Object> raw) {
        if (raw == null) return new ArrayList<>();
        List<String> result = new ArrayList<>();
        for (Object item : raw) {
            if (item instanceof String s && !s.isBlank()) {
                result.add(s.trim());
            } else if (item instanceof Map<?, ?> m) {
                Object name = m.get("name");
                if (name != null && !name.toString().isBlank()) {
                    result.add(name.toString().trim());
                }
            }
        }
        return result;
    }
}
