package com.jobboard.controller;

import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.CandidateProfileService;
import com.jobboard.service.ResumeParserService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final CandidateProfileService profileService;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;
    private final String UPLOAD_DIR = "uploads/resumes/";

    public ResumeController(CandidateProfileService profileService, UserRepository userRepository,
                            ResumeParserService resumeParserService) {
        this.profileService = profileService;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            System.err.println("Warning: Could not create upload directory " + e.getMessage());
        }
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Uploaded file is empty"));
        }

        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
        Path targetPath = Paths.get(UPLOAD_DIR).resolve(fileName);
        Files.copy(file.getInputStream(), targetPath);

        User user = getCurrentUser();
        String resumeUrl = "/api/resumes/view/" + fileName;
        profileService.updateResumeUrl(user.getUsername(), resumeUrl, originalName);

        ResumeParserService.ParsedResume parsed = resumeParserService.parse(file);
        profileService.applyParsedResume(user.getId(), parsed);
        Map<String, Object> parseResults = Map.of(
            "detectedSkills", parsed.skills(),
            "extractedEmail", parsed.email() != null ? parsed.email() : user.getEmail(),
            "extractedPhone", parsed.phone() != null ? parsed.phone() : user.getMobileNumber(),
            "currentJobTitle", parsed.currentJobTitle() != null ? parsed.currentJobTitle() : "",
            "education", parsed.education() != null ? parsed.education() : "",
            "experienceYears", parsed.experienceYears() != null ? parsed.experienceYears() : "",
            "status", "SUCCESS"
        );

        Map<String, Object> response = new HashMap<>();
        response.put("fileName", fileName);
        response.put("resumeUrl", resumeUrl);
        response.put("message", "Resume uploaded successfully");
        response.put("parsedData", parseResults);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/parse")
    public ResponseEntity<Map<String, Object>> parseResumeDirect(@RequestParam(value = "text", required = false) String text) {
        User user = getCurrentUser();
        ResumeParserService.ParsedResume parsed = resumeParserService.parseText(text != null ? text : "");
        profileService.applyParsedResume(user.getId(), parsed);
        Map<String, Object> result = new HashMap<>();
        result.put("detectedSkills", parsed.skills());
        result.put("extractedEmail", parsed.email());
        result.put("extractedPhone", parsed.phone());
        result.put("currentJobTitle", parsed.currentJobTitle());
        result.put("education", parsed.education());
        result.put("experienceYears", parsed.experienceYears());
        result.put("status", "SUCCESS");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/view/{fileName}")
    public ResponseEntity<Resource> viewResume(@PathVariable String fileName) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName).normalize();
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

}
