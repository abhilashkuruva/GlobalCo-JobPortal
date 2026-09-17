package com.jobboard.controller;

import com.jobboard.entity.Application;
import com.jobboard.entity.User;
import com.jobboard.repository.ApplicationRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.CandidateProfileService;
import com.jobboard.service.FileStorageService;
import com.jobboard.service.ResumeParserService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final CandidateProfileService profileService;
    private final UserRepository userRepository;
    private final ResumeParserService resumeParserService;
    private final FileStorageService fileStorageService;
    private final ApplicationRepository applicationRepository;

    public ResumeController(CandidateProfileService profileService, UserRepository userRepository,
                            ResumeParserService resumeParserService,
                            FileStorageService fileStorageService,
                            ApplicationRepository applicationRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
        this.resumeParserService = resumeParserService;
        this.fileStorageService = fileStorageService;
        this.applicationRepository = applicationRepository;
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
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT) : "";
        if (!List.of(".pdf", ".doc", ".docx").contains(extension) || file.getSize() > 15 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("message", "Upload a PDF, DOC, or DOCX resume no larger than 15MB."));
        }
        String fileName = fileStorageService.storeResume(file);

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
        User user = getCurrentUser();
        if (!mayViewResume(user, fileName)) {
            return ResponseEntity.status(403).build();
        }
        Path filePath = fileStorageService.resolveResume(fileName);
        if (!java.nio.file.Files.isRegularFile(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .contentType(MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM))
                .body(resource);
    }

    private boolean mayViewResume(User user, String fileName) {
        String role = user.getRole() == null ? "" : user.getRole().getName();
        if ("ROLE_ADMIN".equals(role)) return true;
        if ("ROLE_CANDIDATE".equals(role)) {
            boolean profileOwnsFile = profileService.getProfileByUserId(user.getId())
                    .map(profile -> fileName.equals(extractFileName(profile.getResumeUrl())))
                    .orElse(false);
            return profileOwnsFile || applicationRepository.findByCandidate_Id(user.getId()).stream()
                    .anyMatch(application -> fileName.equals(extractFileName(application.getResumeUrl())));
        }
        if ("ROLE_RECRUITER".equals(role)) {
            return applicationRepository.findByRecruiterId(user.getId()).stream()
                    .anyMatch(application -> fileName.equals(extractFileName(application.getResumeUrl())));
        }
        return false;
    }

    private String extractFileName(String url) {
        return url == null || url.isBlank() ? "" : url.substring(url.lastIndexOf('/') + 1);
    }

}
