package com.jobboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "recruiter_requests")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RecruiterRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Association to User
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"password", "savedJobs", "roles", "hibernateLazyInitializer", "handler"})
    private User user;

    // Personal Info
    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String username;
    private String designation;

    // Company Info
    @Column(nullable = false)
    private String companyName;

    private String companyEmail;
    private String companyPhone;
    private String companyWebsite;
    private String companyAddress;
    private String companyLocation;
    private String industry;
    private String companyType;
    private String registrationNumber;

    // Verification Info & Documents
    private String employeeId;
    private String linkedInUrl;
    private String identityDocPath;
    private String identityDocName;
    private String companyProofDocPath;
    private String companyProofDocName;

    // Workflow Status
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(length = 1000)
    private String rejectionReason;

    private String reviewedBy;
    private Instant reviewedAt;
    private Instant createdAt = Instant.now();

    public RecruiterRequest() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return (user != null && user.getId() != null) ? user.getId() : userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { 
        this.user = user; 
        if (user != null && user.getId() != null) {
            this.userId = user.getId();
        }
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCompanyEmail() { return companyEmail; }
    public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }

    public String getCompanyPhone() { return companyPhone; }
    public void setCompanyPhone(String companyPhone) { this.companyPhone = companyPhone; }

    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }

    public String getCompanyAddress() { return companyAddress; }
    public void setCompanyAddress(String companyAddress) { this.companyAddress = companyAddress; }

    public String getCompanyLocation() { return companyLocation; }
    public void setCompanyLocation(String companyLocation) { this.companyLocation = companyLocation; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getLinkedInUrl() { return linkedInUrl; }
    public void setLinkedInUrl(String linkedInUrl) { this.linkedInUrl = linkedInUrl; }

    public String getIdentityDocPath() { return identityDocPath; }
    public void setIdentityDocPath(String identityDocPath) { this.identityDocPath = identityDocPath; }

    public String getIdentityDocName() { return identityDocName; }
    public void setIdentityDocName(String identityDocName) { this.identityDocName = identityDocName; }

    public String getCompanyProofDocPath() { return companyProofDocPath; }
    public void setCompanyProofDocPath(String companyProofDocPath) { this.companyProofDocPath = companyProofDocPath; }

    public String getCompanyProofDocName() { return companyProofDocName; }
    public void setCompanyProofDocName(String companyProofDocName) { this.companyProofDocName = companyProofDocName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
