package com.jobboard.controller;

import com.jobboard.dto.SignupRequest;
import com.jobboard.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody SignupRequest request, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping(value = "/candidate/register", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerCandidateWithResume(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "mobileNumber", required = false) String mobileNumber,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam("resume") MultipartFile resume
    ) {
        try {
            Map<String, Object> response = authService.registerCandidateWithResume(
                    username, email, password, fullName, mobileNumber, location, resume
            );
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error storing resume: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping(value = "/recruiter/register", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerRecruiterDetailed(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("fullName") String fullName,
            @RequestParam("phone") String phone,
            @RequestParam(value = "designation", required = false) String designation,
            @RequestParam("companyName") String companyName,
            @RequestParam(value = "companyEmail", required = false) String companyEmail,
            @RequestParam(value = "companyPhone", required = false) String companyPhone,
            @RequestParam(value = "companyWebsite", required = false) String companyWebsite,
            @RequestParam(value = "companyAddress", required = false) String companyAddress,
            @RequestParam(value = "companyLocation", required = false) String companyLocation,
            @RequestParam(value = "industry", required = false) String industry,
            @RequestParam(value = "companyType", required = false) String companyType,
            @RequestParam(value = "registrationNumber", required = false) String registrationNumber,
            @RequestParam(value = "employeeId", required = false) String employeeId,
            @RequestParam(value = "linkedInUrl", required = false) String linkedInUrl,
            @RequestParam(value = "identityProof", required = false) MultipartFile identityProof,
            @RequestParam(value = "companyProof", required = false) MultipartFile companyProof
    ) {
        try {
            Map<String, Object> response = authService.registerRecruiterDetailed(
                    username, email, password, fullName, phone, designation,
                    companyName, companyEmail, companyPhone, companyWebsite,
                    companyAddress, companyLocation, industry, companyType,
                    registrationNumber, employeeId, linkedInUrl, identityProof, companyProof
            );
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading verification documents: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        if (username == null || username.isBlank()) {
            username = request.get("email");
        }
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username or email is required"));
        }
        String password = request.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password is required"));
        }
        try {
            return ResponseEntity.ok(authService.login(username, password));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }
}
