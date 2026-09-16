package com.jobboard.dto;

import java.math.BigDecimal;

public class OfferRequestDto {
    private Long applicationId;
    private BigDecimal salaryOffered;
    private String joiningDate;
    private String details;

    public OfferRequestDto() {}

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public BigDecimal getSalaryOffered() { return salaryOffered; }
    public void setSalaryOffered(BigDecimal salaryOffered) { this.salaryOffered = salaryOffered; }

    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
