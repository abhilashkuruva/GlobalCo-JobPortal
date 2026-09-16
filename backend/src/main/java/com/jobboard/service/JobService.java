package com.jobboard.service;

import com.jobboard.dto.JobRequestDto;
import com.jobboard.dto.MatchScoreBreakdownDto;
import com.jobboard.entity.*;
import com.jobboard.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;

    public JobService(JobRepository jobRepository,
                      ApplicationRepository applicationRepository,
                      CandidateProfileRepository candidateProfileRepository,
                      CompanyRepository companyRepository,
                      CategoryRepository categoryRepository,
                      SkillRepository skillRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.companyRepository = companyRepository;
        this.categoryRepository = categoryRepository;
        this.skillRepository = skillRepository;
    }

    public Page<Job> getAllPublishedJobs(String keyword, String location, Integer minExp, Pageable pageable) {
        return jobRepository.searchJobs("PUBLISHED", keyword, location, minExp, pageable);
    }

    public Page<Job> searchJobsAdvanced(String keyword, String location, Integer minExp, String workMode, String category, Pageable pageable) {
        return jobRepository.searchJobsAdvanced("PUBLISHED", keyword, location, minExp, workMode, category, pageable);
    }

    public Job getJobById(Long id) {
        Job job = jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found: " + id));
        job.setApplicantCount(applicationRepository.countByJob_Id(id));
        return job;
    }

    public Page<Job> getJobsByRecruiter(Long recruiterId, Pageable pageable) {
        Page<Job> jobs = jobRepository.findByRecruiterId(recruiterId, pageable);
        jobs.forEach(j -> j.setApplicantCount(applicationRepository.countByJob_Id(j.getId())));
        return jobs;
    }

    public List<Job> getJobsByRecruiter(Long recruiterId) {
        List<Job> jobs = jobRepository.findByRecruiterId(recruiterId);
        jobs.forEach(j -> j.setApplicantCount(applicationRepository.countByJob_Id(j.getId())));
        return jobs;
    }

    @Transactional
    public Job saveJob(Job job) {
        return jobRepository.save(job);
    }

    @Transactional
    public Job createJobFromDto(JobRequestDto dto, User recruiter) {
        if (recruiter != null && !recruiter.isApproved()) {
            throw new RuntimeException("Only approved recruiters can create and post jobs. Your account status is currently: " + recruiter.getAccountStatus());
        }

        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setExperienceRequired(dto.getExperienceRequired() != null ? dto.getExperienceRequired() : dto.getMinExperience());
        job.setMinExperience(dto.getMinExperience() != null ? dto.getMinExperience() : 0);
        job.setMaxExperience(dto.getMaxExperience() != null ? dto.getMaxExperience() : 10);
        job.setOpenings(dto.getOpenings() != null ? dto.getOpenings() : 1);
        job.setDepartment(dto.getDepartment());
        job.setIndustry(dto.getIndustry());
        job.setApplicationDeadline(dto.getApplicationDeadline());
        job.setResponsibilities(dto.getResponsibilities());
        job.setBenefits(dto.getBenefits());
        job.setEducationRequirements(dto.getEducationRequirements());
        job.setSalaryRange(dto.getSalaryRange());
        job.setJobType(dto.getJobType() != null ? dto.getJobType() : "Full Time");
        job.setWorkMode(dto.getWorkMode() != null ? dto.getWorkMode() : "Hybrid");
        
        // Jobs are directly published - no admin verification needed
        String initialStatus = (dto.getStatus() != null && !dto.getStatus().isBlank() && !dto.getStatus().equals("PENDING")) ? dto.getStatus() : "PUBLISHED";
        job.setStatus(initialStatus);

        job.setRecruiter(recruiter);
        job.setRecruiterId(recruiter != null ? recruiter.getId() : null);
        job.setCreatedAt(Instant.now());

        // Resolve Company
        if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
            Company company = companyRepository.findByNameIgnoreCase(dto.getCompanyName().trim())
                    .orElseGet(() -> {
                        Company c = new Company();
                        c.setName(dto.getCompanyName().trim());
                        return companyRepository.save(c);
                    });
            job.setCompany(company);
        }

        // Resolve Category
        if (dto.getCategoryName() != null && !dto.getCategoryName().isBlank()) {
            Category cat = categoryRepository.findByName(dto.getCategoryName().trim())
                    .orElseGet(() -> {
                        Category c = new Category();
                        c.setName(dto.getCategoryName().trim());
                        return categoryRepository.save(c);
                    });
            job.setCategory(cat);
        }

        // Resolve Required Skills
        if (dto.getSkills() != null && !dto.getSkills().isEmpty()) {
            Set<Skill> skills = resolveSkillEntities(dto.getSkills());
            job.setSkills(skills);
        }

        // Resolve Preferred Skills
        if (dto.getPreferredSkills() != null && !dto.getPreferredSkills().isEmpty()) {
            Set<Skill> prefSkills = resolveSkillEntities(dto.getPreferredSkills());
            job.setPreferredSkills(prefSkills);
        }

        // Resolve Additional Skills
        if (dto.getAdditionalSkills() != null && !dto.getAdditionalSkills().isEmpty()) {
            Set<Skill> addSkills = resolveSkillEntities(dto.getAdditionalSkills());
            job.setAdditionalSkills(addSkills);
        }

        return jobRepository.save(job);
    }

    private Set<Skill> resolveSkillEntities(List<String> skillNames) {
        Set<Skill> skills = new HashSet<>();
        for (String sName : skillNames) {
            if (sName == null || sName.isBlank()) continue;
            Skill sk = skillRepository.findByName(sName.trim())
                    .orElseGet(() -> {
                        Skill s = new Skill();
                        s.setName(sName.trim());
                        return skillRepository.save(s);
                    });
            skills.add(sk);
        }
        return skills;
    }

    @Transactional
    public Job updateJob(Long id, JobRequestDto dto, Long recruiterId) {
        Job job = getJobById(id);
        if (!job.getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized: You do not manage this job posting");
        }
        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getExperienceRequired() != null) job.setExperienceRequired(dto.getExperienceRequired());
        if (dto.getMinExperience() != null) job.setMinExperience(dto.getMinExperience());
        if (dto.getMaxExperience() != null) job.setMaxExperience(dto.getMaxExperience());
        if (dto.getOpenings() != null) job.setOpenings(dto.getOpenings());
        if (dto.getDepartment() != null) job.setDepartment(dto.getDepartment());
        if (dto.getIndustry() != null) job.setIndustry(dto.getIndustry());
        if (dto.getApplicationDeadline() != null) job.setApplicationDeadline(dto.getApplicationDeadline());
        if (dto.getResponsibilities() != null) job.setResponsibilities(dto.getResponsibilities());
        if (dto.getBenefits() != null) job.setBenefits(dto.getBenefits());
        if (dto.getEducationRequirements() != null) job.setEducationRequirements(dto.getEducationRequirements());
        if (dto.getSalaryRange() != null) job.setSalaryRange(dto.getSalaryRange());
        if (dto.getJobType() != null) job.setJobType(dto.getJobType());
        if (dto.getWorkMode() != null) job.setWorkMode(dto.getWorkMode());
        if (dto.getStatus() != null) job.setStatus(dto.getStatus());

        if (dto.getCompanyName() != null && !dto.getCompanyName().isBlank()) {
            Company company = companyRepository.findByNameIgnoreCase(dto.getCompanyName().trim())
                    .orElseGet(() -> {
                        Company c = new Company();
                        c.setName(dto.getCompanyName().trim());
                        return companyRepository.save(c);
                    });
            job.setCompany(company);
        }

        if (dto.getCategoryName() != null && !dto.getCategoryName().isBlank()) {
            Category cat = categoryRepository.findByName(dto.getCategoryName().trim())
                    .orElseGet(() -> {
                        Category c = new Category();
                        c.setName(dto.getCategoryName().trim());
                        return categoryRepository.save(c);
                    });
            job.setCategory(cat);
        }

        if (dto.getSkills() != null && !dto.getSkills().isEmpty()) {
            job.setSkills(resolveSkillEntities(dto.getSkills()));
        }
        if (dto.getPreferredSkills() != null && !dto.getPreferredSkills().isEmpty()) {
            job.setPreferredSkills(resolveSkillEntities(dto.getPreferredSkills()));
        }
        if (dto.getAdditionalSkills() != null && !dto.getAdditionalSkills().isEmpty()) {
            job.setAdditionalSkills(resolveSkillEntities(dto.getAdditionalSkills()));
        }

        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(Long id, Long recruiterId) {
        Job job = getJobById(id);
        if (recruiterId != null && !job.getRecruiterId().equals(recruiterId)) {
            throw new RuntimeException("Unauthorized: You do not manage this job posting");
        }
        deleteJobInternal(job);
    }

    @Transactional
    public void deleteJobByAdmin(Long id) {
        Job job = getJobById(id);
        deleteJobInternal(job);
    }

    private void deleteJobInternal(Job job) {
        Long jobId = job.getId();
        // 1. Delete associated applications (and cascaded interviews/offers)
        List<Application> apps = applicationRepository.findByJob_Id(jobId);
        if (apps != null && !apps.isEmpty()) {
            applicationRepository.deleteAll(apps);
        }

        // 2. Remove saved job references from user_saved_jobs table
        jobRepository.deleteSavedJobLinks(jobId);

        // 3. Clear skill associations
        if (job.getSkills() != null) job.getSkills().clear();
        if (job.getPreferredSkills() != null) job.getPreferredSkills().clear();
        if (job.getAdditionalSkills() != null) job.getAdditionalSkills().clear();
        jobRepository.saveAndFlush(job);

        // 4. Delete the job
        jobRepository.delete(job);
    }

    @Transactional
    public Application applyToJob(Long jobId, User candidate, String customResumeUrl, String customResumeFileName, String coverLetter) {
        Job job = getJobById(jobId);
        if (applicationRepository.existsByJob_IdAndCandidate_Id(jobId, candidate.getId())) {
            throw new RuntimeException("You have already applied for this job.");
        }

        CandidateProfile profile = candidateProfileRepository.findByUserId(candidate.getId())
                .orElseGet(() -> {
                    CandidateProfile cp = new CandidateProfile();
                    cp.setUserId(candidate.getId());
                    cp.setUser(candidate);
                    return candidateProfileRepository.save(cp);
                });

        // Determine application-specific resume
        String effectiveResumeUrl = (customResumeUrl != null && !customResumeUrl.isBlank())
                ? customResumeUrl
                : profile.getResumeUrl();

        String effectiveResumeFileName = (customResumeFileName != null && !customResumeFileName.isBlank())
                ? customResumeFileName
                : (profile.getResumeFileName() != null ? profile.getResumeFileName() : "Resume.pdf");

        if (effectiveResumeUrl == null || effectiveResumeUrl.isBlank()) {
            throw new RuntimeException("A resume is required to apply. Please upload a resume before applying.");
        }

        Application app = new Application();
        app.setJob(job);
        app.setCandidate(candidate);
        app.setStatus(Application.ApplicationStatus.APPLIED);
        app.setAppliedDate(Instant.now());
        app.setMatchScore(calculateMatchScore(job, profile));
        app.setResumeUrl(effectiveResumeUrl);
        app.setResumeFileName(effectiveResumeFileName);
        app.setCoverLetter(coverLetter);

        return applicationRepository.save(app);
    }

    @Transactional
    public Application applyToJob(Long jobId, User candidate) {
        return applyToJob(jobId, candidate, null, null, null);
    }

    public BigDecimal calculateMatchScore(Job job, CandidateProfile profile) {
        return calculateMatchScoreBreakdown(job, profile).getOverallScore();
    }

    public MatchScoreBreakdownDto calculateMatchScoreBreakdown(Job job, CandidateProfile profile) {
        MatchScoreBreakdownDto dto = new MatchScoreBreakdownDto();
        if (profile == null) {
            dto.setOverallScore(BigDecimal.valueOf(50.00));
            dto.setSkillScore(50);
            dto.setExperienceScore(50);
            dto.setLocationScore(50);
            dto.setExplanation("Basic profile matching based on general qualifications.");
            return dto;
        }

        // 1. Skill Score (50% weight)
        Set<String> reqSkills = job.getSkills() != null
                ? job.getSkills().stream().map(s -> s.getName().toLowerCase().trim()).collect(Collectors.toSet())
                : Collections.emptySet();

        Set<String> candSkills = profile.getSkills() != null
                ? profile.getSkills().stream().map(s -> s.getName().toLowerCase().trim()).collect(Collectors.toSet())
                : Collections.emptySet();

        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        int skillPercentage = 100;
        if (!reqSkills.isEmpty()) {
            for (String r : reqSkills) {
                if (candSkills.contains(r)) {
                    matching.add(r);
                } else {
                    missing.add(r);
                }
            }
            skillPercentage = (int) Math.round(((double) matching.size() / reqSkills.size()) * 100.0);
        } else {
            matching.addAll(candSkills);
        }

        // 2. Experience Score (25% weight)
        int expRequired = job.getExperienceRequired() != null ? job.getExperienceRequired() : 0;
        int candExp = profile.getTotalExperienceYears() != null ? profile.getTotalExperienceYears() : 0;
        int expPercentage;
        if (expRequired == 0) {
            expPercentage = 100;
        } else if (candExp >= expRequired) {
            expPercentage = 100;
        } else {
            expPercentage = Math.max(20, (int) Math.round(((double) candExp / expRequired) * 100.0));
        }

        // 3. Location / WorkMode Score (25% weight)
        int locPercentage = 100;
        if ("Remote".equalsIgnoreCase(job.getWorkMode())) {
            locPercentage = 100;
        } else if (job.getLocation() != null && profile.getLocation() != null) {
            if (job.getLocation().trim().equalsIgnoreCase(profile.getLocation().trim())
                    || profile.getLocation().toLowerCase().contains(job.getLocation().toLowerCase())) {
                locPercentage = 100;
            } else {
                locPercentage = 70; // Willing to relocate / hybrid
            }
        }

        // Composite Weighted Score
        double overall = (skillPercentage * 0.50) + (expPercentage * 0.25) + (locPercentage * 0.25);
        BigDecimal finalScore = BigDecimal.valueOf(overall).setScale(2, RoundingMode.HALF_UP);

        dto.setOverallScore(finalScore);
        dto.setSkillScore(skillPercentage);
        dto.setExperienceScore(expPercentage);
        dto.setLocationScore(locPercentage);
        dto.setMatchingSkills(matching);
        dto.setMissingSkills(missing);
        dto.setExplanation(String.format("%d%% skill match (%d of %d required), %d%% experience fit, %d%% location compatibility.",
                skillPercentage, matching.size(), Math.max(1, reqSkills.size()), expPercentage, locPercentage));

        return dto;
    }
}