package com.jobboard.dto;

import java.math.BigDecimal;
import java.util.List;

public class MatchScoreBreakdownDto {
    private BigDecimal overallScore;
    private int skillScore;
    private int experienceScore;
    private int locationScore;
    private List<String> matchingSkills;
    private List<String> missingSkills;
    private String explanation;

    public MatchScoreBreakdownDto() {}

    public BigDecimal getOverallScore() { return overallScore; }
    public void setOverallScore(BigDecimal overallScore) { this.overallScore = overallScore; }

    public int getSkillScore() { return skillScore; }
    public void setSkillScore(int skillScore) { this.skillScore = skillScore; }

    public int getExperienceScore() { return experienceScore; }
    public void setExperienceScore(int experienceScore) { this.experienceScore = experienceScore; }

    public int getLocationScore() { return locationScore; }
    public void setLocationScore(int locationScore) { this.locationScore = locationScore; }

    public List<String> getMatchingSkills() { return matchingSkills; }
    public void setMatchingSkills(List<String> matchingSkills) { this.matchingSkills = matchingSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
