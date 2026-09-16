package com.jobboard.dto;

import jakarta.validation.constraints.*;

public class SignupRequest {
    @NotBlank @Size(min = 1, max = 50)
    private String username;

    @NotBlank @Email
    private String email;
    
    private String confirmEmail;

    @NotBlank @Size(min = 6, max = 40)
    private String password;
    
    private String confirmPassword;

    @NotBlank
    private String fullName;

    @NotBlank @Pattern(regexp = "^(ROLE_)?(CANDIDATE|RECRUITER|ADMIN)$", message = "Role must be CANDIDATE, RECRUITER, or ADMIN")
    private String role;

    private String mobileNumber;

    private String location;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getConfirmEmail() { return confirmEmail; }
    public void setConfirmEmail(String confirmEmail) { this.confirmEmail = confirmEmail; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
