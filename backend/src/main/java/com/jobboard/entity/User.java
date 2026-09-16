package com.jobboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    private String firstName;
    private String lastName;

    private String mobileNumber;
    private String location;

    private boolean enabled = true;
    private String accountStatus = "APPROVED"; // PENDING, APPROVED, REJECTED, SUSPENDED
    private Instant createdAt = Instant.now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "saved_jobs",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "job_id")
    )
    @JsonIgnoreProperties({"company", "skills", "category", "recruiter", "hibernateLazyInitializer", "handler"})
    private Set<Job> savedJobs = new HashSet<>();

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Transient
    public Role getRole() {
        return roles == null || roles.isEmpty() ? null : roles.iterator().next();
    }

    public void setRole(Role role) {
        this.roles.clear();
        if (role != null) {
            this.roles.add(role);
        }
    }

    public User() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getAccountStatus() { return accountStatus != null ? accountStatus : (enabled ? "APPROVED" : "SUSPENDED"); }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }
    public boolean isApproved() { return "APPROVED".equalsIgnoreCase(accountStatus) && enabled; }
    public boolean isPending() { return "PENDING".equalsIgnoreCase(accountStatus); }
    public boolean isRejected() { return "REJECTED".equalsIgnoreCase(accountStatus); }
    public boolean isSuspended() { return "SUSPENDED".equalsIgnoreCase(accountStatus) || (!enabled && !"PENDING".equalsIgnoreCase(accountStatus)); }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Set<Job> getSavedJobs() { return savedJobs; }
    public void setSavedJobs(Set<Job> savedJobs) { this.savedJobs = savedJobs; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}