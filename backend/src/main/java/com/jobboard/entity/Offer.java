package com.jobboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "offers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Offer {

    public enum OfferStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        EXPIRED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"offer", "interviews", "hibernateLazyInitializer", "handler"})
    private Application application;

    private BigDecimal salaryOffered;
    private String joiningDate;
    
    @Column(length = 3000)
    private String details; // e.g. benefits, perks, role title, terms
    
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED
    private Instant createdAt = Instant.now();

    public Offer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return (application != null) ? application.getId() : null; }

    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }

    public BigDecimal getSalaryOffered() { return salaryOffered; }
    public void setSalaryOffered(BigDecimal salaryOffered) { this.salaryOffered = salaryOffered; }

    public String getJoiningDate() { return joiningDate; }
    public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public void setStatus(OfferStatus status) {
        this.status = status == null ? null : status.name();
    }

    public OfferStatus getOfferStatus() {
        try {
            return status == null ? null : OfferStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}