package com.jobboard.controller;

import com.jobboard.entity.CandidateProfile;
import com.jobboard.entity.User;
import com.jobboard.repository.UserRepository;
import com.jobboard.service.CandidateProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/profiles")
public class CandidateProfileController {

    private final CandidateProfileService profileService;
    private final UserRepository userRepository;

    public CandidateProfileController(CandidateProfileService profileService,
                                      UserRepository userRepository) {
        this.profileService = profileService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findFirstByUsername(identifier))
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier));
    }

    @GetMapping("/me")
    public ResponseEntity<CandidateProfile> getMyProfile() {
        User user = getCurrentUser();
        CandidateProfile profile = profileService.getOrCreateProfile(user);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<CandidateProfile> updateMyProfile(@RequestBody Map<String, Object> incoming) {
        User user = getCurrentUser();
        CandidateProfile profile = profileService.getOrCreateProfile(user);

        // Update User full name if provided
        if (incoming.containsKey("fullName") && incoming.get("fullName") != null) {
            String fullName = incoming.get("fullName").toString().trim();
            if (!fullName.isEmpty()) {
                String firstName = fullName.contains(" ") ? fullName.substring(0, fullName.indexOf(" ")) : fullName;
                String lastName = fullName.contains(" ") ? fullName.substring(fullName.indexOf(" ") + 1) : "";
                user.setFirstName(firstName);
                user.setLastName(lastName);
                userRepository.save(user);
            }
        }

        if (incoming.containsKey("summary")) profile.setSummary(incoming.get("summary") != null ? incoming.get("summary").toString() : profile.getSummary());
        if (incoming.containsKey("location") && incoming.get("location") != null) profile.setLocation(incoming.get("location").toString());
        if (incoming.containsKey("totalExperienceYears")) {
            Object exp = incoming.get("totalExperienceYears");
            profile.setTotalExperienceYears(exp != null ? ((Number) exp).intValue() : null);
        }
        if (incoming.containsKey("currentJobTitle") && incoming.get("currentJobTitle") != null) profile.setCurrentJobTitle(incoming.get("currentJobTitle").toString());
        if (incoming.containsKey("expectedSalary")) {
            Object sal = incoming.get("expectedSalary");
            profile.setExpectedSalary(sal != null ? BigDecimal.valueOf(((Number) sal).doubleValue()) : null);
        }
        if (incoming.containsKey("education") && incoming.get("education") != null) profile.setEducation(incoming.get("education").toString());
        if (incoming.containsKey("phone") && incoming.get("phone") != null) profile.setPhone(incoming.get("phone").toString());
        if (incoming.containsKey("portfolioUrl") && incoming.get("portfolioUrl") != null) profile.setPortfolioUrl(incoming.get("portfolioUrl").toString());
        if (incoming.containsKey("linkedInUrl") && incoming.get("linkedInUrl") != null) profile.setLinkedInUrl(incoming.get("linkedInUrl").toString());
        if (incoming.containsKey("gitHubUrl") && incoming.get("gitHubUrl") != null) profile.setGitHubUrl(incoming.get("gitHubUrl").toString());

        // Update skills if provided as a list
        if (incoming.containsKey("skills") && incoming.get("skills") instanceof List) {
            List<?> rawSkills = (List<?>) incoming.get("skills");
            Set<com.jobboard.entity.Skill> skillSet = new HashSet<>();
            for (Object sk : rawSkills) {
                String name = null;
                if (sk instanceof Map) name = ((Map<?,?>) sk).get("name") != null ? ((Map<?,?>) sk).get("name").toString() : null;
                else if (sk != null) name = sk.toString();
                if (name != null && !name.isBlank()) skillSet.add(profileService.resolveSkill(name.trim()));
            }
            profile.setSkills(skillSet);
        }

        return ResponseEntity.ok(profileService.updateProfile(profile));
    }

    @PostMapping("/me/skills")
    public ResponseEntity<CandidateProfile> addSkill(@RequestBody Map<String, String> request) {
        String skillName = request.get("name");
        if (skillName == null || skillName.isBlank()) {
            throw new RuntimeException("Skill name is required");
        }
        User user = getCurrentUser();
        return ResponseEntity.ok(profileService.addSkill(user.getId(), skillName));
    }

    @DeleteMapping("/me/skills/{skillName}")
    public ResponseEntity<CandidateProfile> removeSkill(@PathVariable String skillName) {
        User user = getCurrentUser();
        return ResponseEntity.ok(profileService.removeSkill(user.getId(), skillName));
    }

    @GetMapping("/skill-suggestions")
    public ResponseEntity<List<String>> getSkillSuggestions(@RequestParam(required = false, defaultValue = "") String title) {
        return ResponseEntity.ok(profileService.getSkillSuggestions(title));
    }
}
