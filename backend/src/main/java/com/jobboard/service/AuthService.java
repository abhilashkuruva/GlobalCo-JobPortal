package com.jobboard.service;

import com.jobboard.dto.SignupRequest;
import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.RecruiterRequest;
import com.jobboard.entity.Role;
import com.jobboard.entity.Skill;
import com.jobboard.entity.User;
import com.jobboard.repository.CandidateProfileRepository;
import com.jobboard.repository.RecruiterRequestRepository;
import com.jobboard.repository.RoleRepository;
import com.jobboard.repository.SkillRepository;
import com.jobboard.repository.UserRepository;
import com.jobboard.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CandidateProfileService candidateProfileService;
    private final RecruiterRequestRepository recruiterRequestRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final ResumeParserService resumeParserService;
    private final FileStorageService fileStorageService;

    private final String RESUME_DIR = "uploads/resumes/";
    private final String VERIFICATION_DOCS_DIR = "uploads/verification_docs/";

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       CandidateProfileRepository candidateProfileRepository,
                       CandidateProfileService candidateProfileService,
                       RecruiterRequestRepository recruiterRequestRepository,
                       SkillRepository skillRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       ResumeParserService resumeParserService,
                       FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.candidateProfileService = candidateProfileService;
        this.recruiterRequestRepository = recruiterRequestRepository;
        this.skillRepository = skillRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.resumeParserService = resumeParserService;
        this.fileStorageService = fileStorageService;

        try {
            Files.createDirectories(Paths.get(RESUME_DIR));
            Files.createDirectories(Paths.get(VERIFICATION_DOCS_DIR));
        } catch (IOException e) {
            System.err.println("Warning: Could not create upload directories: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> register(SignupRequest request) {
        String rawRole = request.getRole() != null ? request.getRole() : "CANDIDATE";
        if (!"RECRUITER".equalsIgnoreCase(rawRole) && !"ROLE_RECRUITER".equalsIgnoreCase(rawRole)) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username is already taken");
            }
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = new User();

        // Split fullName into first and last name
        String fullName = request.getFullName() != null ? request.getFullName().trim() : "";
        String firstName = "";
        String lastName = "";
        if (fullName.contains(" ")) {
            firstName = fullName.substring(0, fullName.indexOf(" "));
            lastName = fullName.substring(fullName.indexOf(" ") + 1);
        } else {
            firstName = fullName;
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setMobileNumber(request.getMobileNumber());
        user.setLocation(request.getLocation());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Convert CANDIDATE -> ROLE_CANDIDATE
        String rawRoleName = request.getRole() != null ? request.getRole() : "CANDIDATE";
        final String roleName = rawRoleName.startsWith("ROLE_") ? rawRoleName : "ROLE_" + rawRoleName;

        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });

        user.setRole(role);

        // If registering as a Recruiter, account starts in PENDING status requiring admin approval!
        if ("ROLE_RECRUITER".equals(role.getName())) {
            user.setAccountStatus("PENDING");
            user.setEnabled(false);
            userRepository.save(user);

            // Create initial pending recruiter request
            RecruiterRequest req = new RecruiterRequest();
            req.setUserId(user.getId());
            req.setUser(user);
            req.setFullName(fullName);
            req.setEmail(user.getEmail());
            req.setPhone(user.getMobileNumber());
            req.setUsername(user.getUsername());
            req.setCompanyName(fullName + " Organization");
            req.setStatus("PENDING");
            recruiterRequestRepository.save(req);

            Map<String, Object> pendingResponse = new HashMap<>();
            pendingResponse.put("message", "Your recruiter registration has been submitted and is waiting for administrator approval.");
            pendingResponse.put("status", "PENDING");
            pendingResponse.put("role", role.getName());
            pendingResponse.put("username", user.getUsername());
            return pendingResponse;
        }

        // Candidates start as APPROVED
        user.setAccountStatus("APPROVED");
        user.setEnabled(true);
        userRepository.save(user);

        if ("ROLE_CANDIDATE".equals(role.getName())) {
            CandidateProfile profile = new CandidateProfile();
            profile.setUserId(user.getId());
            profile.setSummary("");
            profile.setPhone(user.getMobileNumber());
            profile.setLocation(user.getLocation());
            profile.setTotalExperienceYears(null);
            profile.setExpectedSalary(null);
            candidateProfileRepository.save(profile);
        }

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> userObj = new HashMap<>();
        userObj.put("id", user.getId());
        userObj.put("username", user.getUsername());
        userObj.put("email", user.getEmail());
        userObj.put("fullName", user.getFirstName() + (user.getLastName() != null && !user.getLastName().isBlank() ? " " + user.getLastName() : ""));
        userObj.put("role", role.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", role.getName());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("user", userObj);

        return response;
    }

    @Transactional
    public Map<String, Object> registerCandidateWithResume(
            String username,
            String email,
            String password,
            String fullName,
            String phone,
            String location,
            MultipartFile resumeFile
    ) throws IOException {
        if (userRepository.existsByEmail(email)) { throw new RuntimeException("A recruiter account with this email already exists."); }
        if (resumeFile == null || resumeFile.isEmpty()) {
            throw new RuntimeException("A valid resume file (.pdf, .doc, .docx) is mandatory for job seeker registration.");
        }

        String originalName = resumeFile.getOriginalFilename() != null ? resumeFile.getOriginalFilename() : "resume.pdf";
        String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : "";
        if (!List.of(".pdf", ".doc", ".docx").contains(ext)) {
            throw new RuntimeException("Unsupported resume file format. Supported formats: PDF, DOC, DOCX.");
        }
        if (resumeFile.getSize() > 15 * 1024 * 1024) {
            throw new RuntimeException("Resume file size exceeds maximum limit of 15MB.");
        }

        String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String savedFileName = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
        fileStorageService.saveDocument(RESUME_DIR, savedFileName, originalName, "RESUME", resumeFile.getContentType(), resumeFile.getBytes());

        User user = new User();
        String fName = fullName != null ? fullName.trim() : "";
        String firstName = "";
        String lastName = "";
        if (fName.contains(" ")) {
            firstName = fName.substring(0, fName.indexOf(" "));
            lastName = fName.substring(fName.indexOf(" ") + 1);
        } else {
            firstName = fName;
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setMobileNumber(phone);
        user.setLocation(location);
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(true);
        user.setAccountStatus("APPROVED");

        Role candidateRole = roleRepository.findByName("ROLE_CANDIDATE")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_CANDIDATE");
                    return roleRepository.save(r);
                });
        user.setRole(candidateRole);
        userRepository.save(user);

        // Create Profile with resume reference
        CandidateProfile profile = new CandidateProfile();
        profile.setUserId(user.getId());
        profile.setUser(user);
        profile.setPhone(phone);
        profile.setLocation(location);
        profile.setResumeUrl("/api/resumes/view/" + savedFileName);
        profile.setResumeFileName(originalName);
        profile.setSummary("");
        profile.setTotalExperienceYears(null);
        profile.setExpectedSalary(null);

        candidateProfileRepository.save(profile);
        try {
            candidateProfileService.applyParsedResume(user.getId(), resumeParserService.parse(resumeFile));
        } catch (Exception ignored) {
            // The uploaded resume remains attached even when text extraction is unavailable.
        }

        String token = jwtUtil.generateToken(user.getEmail());
        Map<String, Object> userObj = new HashMap<>();
        userObj.put("id", user.getId());
        userObj.put("username", user.getUsername());
        userObj.put("email", user.getEmail());
        userObj.put("fullName", fullName);
        userObj.put("role", "ROLE_CANDIDATE");
        userObj.put("resumeUrl", profile.getResumeUrl());
        userObj.put("resumeFileName", profile.getResumeFileName());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "ROLE_CANDIDATE");
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("user", userObj);

        return response;
    }

    @Transactional
    public Map<String, Object> registerRecruiterDetailed(
            String username,
            String email,
            String password,
            String fullName,
            String phone,
            String designation,
            String companyName,
            String companyEmail,
            String companyPhone,
            String companyWebsite,
            String companyAddress,
            String companyLocation,
            String industry,
            String companyType,
            String registrationNumber,
            String employeeId,
            String linkedInUrl,
            MultipartFile identityProof,
            MultipartFile companyProof
    ) throws IOException {
        if (userRepository.existsByEmail(email)) { throw new RuntimeException("A recruiter account with this email already exists."); }
        if (userRepository.existsByUsername(username)) { throw new RuntimeException("Username already taken. Please choose a different username."); }

        // Ensure uploads directory exists
        Files.createDirectories(Paths.get(VERIFICATION_DOCS_DIR));

        // Save identity document if provided
        String identityPath = null;
        String identityName = null;
        if (identityProof != null && !identityProof.isEmpty()) {
            validateDocumentFile(identityProof);
            identityName = identityProof.getOriginalFilename();
            String clean = identityName != null ? identityName.replaceAll("[^a-zA-Z0-9._-]", "_") : "identity.pdf";
            String savedIdName = UUID.randomUUID().toString().substring(0, 8) + "_" + clean;
            fileStorageService.saveDocument(VERIFICATION_DOCS_DIR, savedIdName, identityName, "IDENTITY_PROOF", identityProof.getContentType(), identityProof.getBytes());
            identityPath = "/api/admin/recruiter-requests/document/identity/" + savedIdName;
        }

        // Save company proof document if provided
        String companyProofPath = null;
        String companyProofName = null;
        if (companyProof != null && !companyProof.isEmpty()) {
            validateDocumentFile(companyProof);
            companyProofName = companyProof.getOriginalFilename();
            String clean = companyProofName != null ? companyProofName.replaceAll("[^a-zA-Z0-9._-]", "_") : "company_proof.pdf";
            String savedProofName = UUID.randomUUID().toString().substring(0, 8) + "_" + clean;
            fileStorageService.saveDocument(VERIFICATION_DOCS_DIR, savedProofName, companyProofName, "COMPANY_PROOF", companyProof.getContentType(), companyProof.getBytes());
            companyProofPath = "/api/admin/recruiter-requests/document/company/" + savedProofName;
        }

        // Create User in PENDING state
        User user = new User();
        String fName = fullName != null ? fullName.trim() : "";
        String firstName = "";
        String lastName = "";
        if (fName.contains(" ")) {
            firstName = fName.substring(0, fName.indexOf(" "));
            lastName = fName.substring(fName.indexOf(" ") + 1);
        } else {
            firstName = fName;
        }

        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setMobileNumber(phone);
        user.setLocation(companyLocation != null && !companyLocation.isBlank() ? companyLocation : "Global");
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(false); // Locked until approved
        user.setAccountStatus("PENDING");

        Role recruiterRole = roleRepository.findByName("ROLE_RECRUITER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_RECRUITER");
                    return roleRepository.save(r);
                });
        user.setRole(recruiterRole);
        user = userRepository.saveAndFlush(user);

        // Create Recruiter Request for Admin review
        RecruiterRequest req = new RecruiterRequest();
        req.setUserId(user.getId());
        req.setUser(user);
        req.setFullName(fullName);
        req.setEmail(email);
        req.setPhone(phone);
        req.setUsername(username);
        req.setDesignation(designation);
        req.setCompanyName(companyName);
        req.setCompanyEmail(companyEmail);
        req.setCompanyPhone(companyPhone);
        req.setCompanyWebsite(companyWebsite);
        req.setCompanyAddress(companyAddress);
        req.setCompanyLocation(companyLocation);
        req.setIndustry(industry);
        req.setCompanyType(companyType);
        req.setRegistrationNumber(registrationNumber);
        req.setEmployeeId(employeeId);
        req.setLinkedInUrl(linkedInUrl);
        req.setIdentityDocPath(identityPath);
        req.setIdentityDocName(identityName);
        req.setCompanyProofDocPath(companyProofPath);
        req.setCompanyProofDocName(companyProofName);
        req.setStatus("PENDING");

        recruiterRequestRepository.save(req);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Your recruiter registration has been submitted and is currently waiting for administrator approval.");
        response.put("status", "PENDING");
        response.put("username", username);
        response.put("companyName", companyName);

        return response;
    }

    private void validateDocumentFile(MultipartFile file) {
        String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() : "";
        if (!List.of(".pdf", ".jpg", ".jpeg", ".png").contains(ext)) {
            throw new RuntimeException("Unsupported verification document format: " + ext + ". Allowed formats: PDF, JPG, JPEG, PNG.");
        }
        if (file.getSize() > 15 * 1024 * 1024) {
            throw new RuntimeException("Verification document size exceeds 15MB limit.");
        }
    }

    public Map<String, Object> login(String usernameOrEmail, String password) {
        // Try email lookup first (always unique), or match across duplicate usernames by password
        List<User> matchedUsers = userRepository.findByEmail(usernameOrEmail)
                .map(List::of)
                .orElseGet(() -> userRepository.findAllByUsername(usernameOrEmail));

        User user = matchedUsers.stream()
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            throw new RuntimeException("Invalid username/email or password.");
        }

        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_CANDIDATE";

        // Enforce Recruiter Status Governance
        if ("ROLE_RECRUITER".equals(roleName)) {
            if (user.isPending()) {
                throw new RuntimeException("Your recruiter registration is currently pending administrator approval. Please check back once our team verifies your company documentation.");
            }
            if (user.isRejected()) {
                Optional<RecruiterRequest> req = recruiterRequestRepository.findByUserId(user.getId());
                String reason = req.map(RecruiterRequest::getRejectionReason).orElse("Verification criteria not satisfied.");
                throw new RuntimeException("Your recruiter account request has been rejected. Reason: " + reason);
            }
            if (user.isSuspended() || !user.isEnabled()) {
                throw new RuntimeException("Your recruiter account has been suspended. Please contact the administrator.");
            }
        } else {
            if (!user.isEnabled()) {
                throw new RuntimeException("Your account has been deactivated. Please contact the administrator.");
            }
        }

        String token = jwtUtil.generateToken(user.getEmail());

        Map<String, Object> userObj = new HashMap<>();
        userObj.put("id", user.getId());
        userObj.put("username", user.getUsername());
        userObj.put("email", user.getEmail());
        userObj.put("fullName", (user.getFirstName() != null ? user.getFirstName() : "") + 
                                (user.getLastName() != null && !user.getLastName().isBlank() ? " " + user.getLastName() : ""));
        userObj.put("role", roleName);
        userObj.put("accountStatus", user.getAccountStatus());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", roleName);
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("user", userObj);

        return response;
    }
}