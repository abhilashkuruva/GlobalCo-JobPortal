package com.jobboard.config;

import com.jobboard.entity.*;
import com.jobboard.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Configuration
@ConditionalOnProperty(prefix = "app.seed-data", name = "enabled", havingValue = "true")
public class DataInitializer {

    @Bean
    CommandLineRunner seedData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            CompanyRepository companyRepository,
            SkillRepository skillRepository,
            CategoryRepository categoryRepository,
            CandidateProfileRepository candidateProfileRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            OfferRepository offerRepository,
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository,
            RecruiterRequestRepository recruiterRequestRepository,
            PasswordEncoder passwordEncoder,
            com.jobboard.service.FileStorageService fileStorageService,
            PlatformTransactionManager transactionManager
    ) {
        return args -> new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            Instant now = Instant.now();

            // --- Roles ---
            Map<String, Role> rolesByName = new HashMap<>();
            for (String roleName : List.of("ROLE_CANDIDATE", "ROLE_RECRUITER", "ROLE_ADMIN")) {
                Role role = roleRepository.findByName(roleName)
                        .orElseGet(() -> {
                            Role r = new Role();
                            r.setName(roleName);
                            return roleRepository.save(r);
                        });
                rolesByName.put(roleName, role);
            }

            // --- Skills ---
            List<String> skills = List.of(
                    "Java", "Spring Boot", "React", "TypeScript", "Node.js", "Python", "SQL", "AWS",
                    "Docker", "Kubernetes", "Machine Learning", "UI/UX", "Testing", "System Design",
                    "Kafka", "REST API", "GraphQL", "Go", "PostgreSQL", "MongoDB", "Redis",
                    "Azure", "GCP", "Angular", "Swift", "Kotlin", "Flutter", "TensorFlow",
                    "PyTorch", "Spark", "Tableau", "Figma", "Scrum", "Agile", "JIRA",
                    "CI/CD", "Terraform", "Ansible", "Jenkins"
            );
            Map<String, Skill> skillsByName = new HashMap<>();
            for (String s : skills) {
                Skill skill = skillRepository.findByName(s).orElseGet(() -> {
                    Skill sk = new Skill();
                    sk.setName(s);
                    return skillRepository.save(sk);
                });
                skillsByName.put(s, skill);
            }

            // --- Categories ---
            List<String> categories = List.of(
                    "Software Engineering", "Data & Analytics", "Cloud & DevOps",
                    "Design & UX", "QA & Testing", "Product Management",
                    "Mobile Development", "AI & Machine Learning"
            );
            Map<String, Category> categoriesByName = new HashMap<>();
            for (String c : categories) {
                Category cat = categoryRepository.findByName(c).orElseGet(() -> {
                    Category created = new Category();
                    created.setName(c);
                    return categoryRepository.save(created);
                });
                categoriesByName.put(c, cat);
            }

            // --- Companies ---
            List<String> companyNames = List.of(
                    "Microsoft", "Google", "Amazon", "Meta", "Apple",
                    "Salesforce", "Oracle", "Netflix", "IBM", "Infosys",
                    "Wipro", "TCS", "Adobe", "Spotify", "Uber",
                    "LinkedIn", "Airbnb", "Stripe"
            );
            Map<String, Company> companiesByName = new HashMap<>();
            for (String name : companyNames) {
                Company company = companyRepository.findByNameIgnoreCase(name).orElseGet(() -> {
                    Company created = new Company();
                    created.setName(name);
                    return companyRepository.save(created);
                });
                companiesByName.put(name, company);
            }

            // --- Users ---
            record SeedUser(String username, String email, String password, String firstName, String lastName,
                            String mobile, String location, String roleName) {}

            List<SeedUser> seedUsers = List.of(
                    new SeedUser("admin", "admin@globalco.jobs", "Password@123", "abhi-admin", "", "+91-98765-00001", "Bengaluru", "ROLE_ADMIN"),
                    new SeedUser("mira.recruiter", "mira@globalsearch.com", "Password@123", "Mira", "Khan", "+91-98765-10001", "Bengaluru", "ROLE_RECRUITER"),
                    new SeedUser("devon.tech", "devon@hirehq.com", "Password@123", "Devon", "Singh", "+91-98765-10002", "Hyderabad", "ROLE_RECRUITER"),
                    new SeedUser("priya.recruiter", "priya@talentbridge.com", "Password@123", "Priya", "Nair", "+91-98765-10003", "Mumbai", "ROLE_RECRUITER"),
                    new SeedUser("riya.backend", "riya.backend@jobmail.com", "Password@123", "Riya", "Sharma", "+91-90000-20001", "Bengaluru", "ROLE_CANDIDATE"),
                    new SeedUser("samir.react", "samir.react@jobmail.com", "Password@123", "Samir", "Kumar", "+91-90000-20002", "Hyderabad", "ROLE_CANDIDATE"),
                    new SeedUser("ananya.data", "ananya.data@jobmail.com", "Password@123", "Ananya", "Rao", "+91-90000-20003", "Pune", "ROLE_CANDIDATE"),
                    new SeedUser("karan.devops", "karan.devops@jobmail.com", "Password@123", "Karan", "Mehta", "+91-90000-20004", "Bengaluru", "ROLE_CANDIDATE"),
                    new SeedUser("priya.mobile", "priya.mobile@jobmail.com", "Password@123", "Priya", "Patel", "+91-90000-20005", "Mumbai", "ROLE_CANDIDATE"),
                    new SeedUser("arjun.ml", "arjun.ml@jobmail.com", "Password@123", "Arjun", "Verma", "+91-90000-20006", "Delhi", "ROLE_CANDIDATE")
            );

            Map<String, User> usersByUsername = new HashMap<>();
            for (SeedUser su : seedUsers) {
                User user = userRepository.findByUsername(su.username()).orElseGet(() -> {
                    User u = new User();
                    u.setUsername(su.username());
                    u.setEmail(su.email());
                    u.setFirstName(su.firstName());
                    u.setLastName(su.lastName());
                    u.setMobileNumber(su.mobile());
                    u.setLocation(su.location());
                    u.setPassword(passwordEncoder.encode(su.password()));
                    return u;
                });
                Role role = rolesByName.get(su.roleName());
                if (role != null) user.setRole(role);
                user.setEnabled(true);
                user.setAccountStatus("APPROVED");
                userRepository.save(user);
                usersByUsername.put(su.username(), user);
            }

            // Seed Pending Recruiter (For Admin Approval Testing)
            User pendingRecruiter = userRepository.findByUsername("rohit.recruiter").orElseGet(() -> {
                User u = new User();
                u.setUsername("rohit.recruiter");
                u.setEmail("rohit@apextech.io");
                u.setFirstName("Rohit");
                u.setLastName("Verma");
                u.setMobileNumber("+91-98765-99001");
                u.setLocation("Gurugram");
                u.setPassword(passwordEncoder.encode("Password@123"));
                return u;
            });
            pendingRecruiter.setEnabled(false);
            pendingRecruiter.setAccountStatus("PENDING");
            Role recRole = rolesByName.get("ROLE_RECRUITER");
            if (recRole != null) pendingRecruiter.setRole(recRole);
            userRepository.save(pendingRecruiter);
            usersByUsername.put("rohit.recruiter", pendingRecruiter);

            // Seed Rejected Recruiter (For Admin History Testing)
            User rejectedRecruiter = userRepository.findByUsername("sneha.recruiter").orElseGet(() -> {
                User u = new User();
                u.setUsername("sneha.recruiter");
                u.setEmail("sneha@vanguardlogistics.com");
                u.setFirstName("Sneha");
                u.setLastName("Kapoor");
                u.setMobileNumber("+91-98765-99002");
                u.setLocation("Pune");
                u.setPassword(passwordEncoder.encode("Password@123"));
                return u;
            });
            rejectedRecruiter.setEnabled(false);
            rejectedRecruiter.setAccountStatus("REJECTED");
            if (recRole != null) rejectedRecruiter.setRole(recRole);
            userRepository.save(rejectedRecruiter);
            usersByUsername.put("sneha.recruiter", rejectedRecruiter);

            // Ensure sample verification documents exist in storage
            try {
                fileStorageService.saveDocument("uploads/verification_docs", "sample_id_proof.pdf", "sample_id_proof.pdf", "IDENTITY_PROOF", "application/pdf", fileStorageService.createSamplePdfContent("Official Identity Verification Document", "Government ID & Address Proof for Recruiter Verification"));
                fileStorageService.saveDocument("uploads/verification_docs", "sample_company_cert.pdf", "sample_company_cert.pdf", "COMPANY_PROOF", "application/pdf", fileStorageService.createSamplePdfContent("Certificate of Incorporation", "Ministry of Corporate Affairs - Recruiter Company Certificate"));
            } catch (Exception ignored) {}

            // --- Recruiter Requests ---
            if (recruiterRequestRepository.count() == 0) {
                // Approved Request for Mira
                User mira = usersByUsername.get("mira.recruiter");
                if (mira != null) {
                    RecruiterRequest req1 = new RecruiterRequest();
                    req1.setUser(mira);
                    req1.setFullName("Mira Khan");
                    req1.setEmail("mira@globalsearch.com");
                    req1.setPhone("+91-98765-10001");
                    req1.setUsername("mira.recruiter");
                    req1.setDesignation("Lead Talent Partner");
                    req1.setCompanyName("Global Search Partners");
                    req1.setCompanyEmail("recruitment@globalsearch.com");
                    req1.setCompanyPhone("+91-80-40001234");
                    req1.setCompanyWebsite("https://globalsearch.com");
                    req1.setCompanyAddress("Level 5, Embassy TechVillage, Outer Ring Road");
                    req1.setCompanyLocation("Bengaluru");
                    req1.setIndustry("Executive Search & Staffing");
                    req1.setCompanyType("Private Limited");
                    req1.setRegistrationNumber("CIN-U72200KA2018PTC112345");
                    req1.setEmployeeId("EMP-GS-089");
                    req1.setLinkedInUrl("https://linkedin.com/in/mira-khan-recruiter");
                    req1.setIdentityDocPath("uploads/verification_docs/sample_id_proof.pdf");
                    req1.setIdentityDocName("sample_id_proof.pdf");
                    req1.setCompanyProofDocPath("uploads/verification_docs/sample_company_cert.pdf");
                    req1.setCompanyProofDocName("sample_company_cert.pdf");
                    req1.setStatus("APPROVED");
                    req1.setReviewedBy("admin");
                    req1.setReviewedAt(now.minus(15, ChronoUnit.DAYS));
                    req1.setCreatedAt(now.minus(16, ChronoUnit.DAYS));
                    recruiterRequestRepository.save(req1);
                }

                // Approved Request for Devon
                User devon = usersByUsername.get("devon.tech");
                if (devon != null) {
                    RecruiterRequest req2 = new RecruiterRequest();
                    req2.setUser(devon);
                    req2.setFullName("Devon Singh");
                    req2.setEmail("devon@hirehq.com");
                    req2.setPhone("+91-98765-10002");
                    req2.setUsername("devon.tech");
                    req2.setDesignation("VP of Technical Recruiting");
                    req2.setCompanyName("HireHQ Solutions");
                    req2.setCompanyEmail("contact@hirehq.com");
                    req2.setCompanyPhone("+91-40-67005432");
                    req2.setCompanyWebsite("https://hirehq.com");
                    req2.setCompanyAddress("Hitec City, Mindspace Madhapur");
                    req2.setCompanyLocation("Hyderabad");
                    req2.setIndustry("Technology & Cloud Staffing");
                    req2.setCompanyType("Corporation");
                    req2.setRegistrationNumber("CIN-U72900TG2020PTC098765");
                    req2.setEmployeeId("HHQ-DIR-04");
                    req2.setLinkedInUrl("https://linkedin.com/in/devon-singh-tech");
                    req2.setIdentityDocPath("uploads/verification_docs/sample_id_proof.pdf");
                    req2.setIdentityDocName("sample_id_proof.pdf");
                    req2.setCompanyProofDocPath("uploads/verification_docs/sample_company_cert.pdf");
                    req2.setCompanyProofDocName("sample_company_cert.pdf");
                    req2.setStatus("APPROVED");
                    req2.setReviewedBy("admin");
                    req2.setReviewedAt(now.minus(10, ChronoUnit.DAYS));
                    req2.setCreatedAt(now.minus(11, ChronoUnit.DAYS));
                    recruiterRequestRepository.save(req2);
                }

                // Pending Request for Rohit (Available for Admin to Approve or Reject!)
                RecruiterRequest pendingReq = new RecruiterRequest();
                pendingReq.setUser(pendingRecruiter);
                pendingReq.setFullName("Rohit Verma");
                pendingReq.setEmail("rohit@apextech.io");
                pendingReq.setPhone("+91-98765-99001");
                pendingReq.setUsername("rohit.recruiter");
                pendingReq.setDesignation("Head of Talent Acquisition");
                pendingReq.setCompanyName("Apex Global Tech");
                pendingReq.setCompanyEmail("hr@apextech.io");
                pendingReq.setCompanyPhone("+91-124-4500999");
                pendingReq.setCompanyWebsite("https://apextech.io");
                pendingReq.setCompanyAddress("Cyber City, DLF Phase 2");
                pendingReq.setCompanyLocation("Gurugram");
                pendingReq.setIndustry("FinTech & Distributed Systems");
                pendingReq.setCompanyType("Private Limited");
                pendingReq.setRegistrationNumber("CIN-U74999HR2021PTC088214");
                pendingReq.setEmployeeId("APX-HR-101");
                pendingReq.setLinkedInUrl("https://linkedin.com/in/rohit-verma-apex");
                pendingReq.setIdentityDocPath("uploads/verification_docs/sample_id_proof.pdf");
                pendingReq.setIdentityDocName("sample_id_proof.pdf");
                pendingReq.setCompanyProofDocPath("uploads/verification_docs/sample_company_cert.pdf");
                pendingReq.setCompanyProofDocName("sample_company_cert.pdf");
                pendingReq.setStatus("PENDING");
                pendingReq.setCreatedAt(now.minus(2, ChronoUnit.HOURS));
                recruiterRequestRepository.save(pendingReq);

                // Rejected Request for Sneha (History check)
                RecruiterRequest rejectedReq = new RecruiterRequest();
                rejectedReq.setUser(rejectedRecruiter);
                rejectedReq.setFullName("Sneha Kapoor");
                rejectedReq.setEmail("sneha@vanguardlogistics.com");
                rejectedReq.setPhone("+91-98765-99002");
                rejectedReq.setUsername("sneha.recruiter");
                rejectedReq.setDesignation("Recruitment Specialist");
                rejectedReq.setCompanyName("Vanguard Logistics");
                rejectedReq.setCompanyEmail("info@vanguardlogistics.com");
                rejectedReq.setCompanyPhone("+91-20-27003456");
                rejectedReq.setCompanyWebsite("https://vanguardlogistics.com");
                rejectedReq.setCompanyAddress("Kharadi World Trade Center");
                rejectedReq.setCompanyLocation("Pune");
                rejectedReq.setIndustry("Supply Chain & Logistics");
                rejectedReq.setCompanyType("Proprietorship");
                rejectedReq.setRegistrationNumber("REG-MH-2015-88372");
                rejectedReq.setEmployeeId("VGL-HR-003");
                rejectedReq.setLinkedInUrl("https://linkedin.com/in/sneha-kapoor");
                rejectedReq.setIdentityDocPath("uploads/verification_docs/sample_id_proof.pdf");
                rejectedReq.setIdentityDocName("sample_id_proof.pdf");
                rejectedReq.setCompanyProofDocPath("uploads/verification_docs/sample_company_cert.pdf");
                rejectedReq.setCompanyProofDocName("sample_company_cert.pdf");
                rejectedReq.setStatus("REJECTED");
                rejectedReq.setRejectionReason("The business registration document submitted does not match official company registry records.");
                rejectedReq.setReviewedBy("admin");
                rejectedReq.setReviewedAt(now.minus(3, ChronoUnit.DAYS));
                rejectedReq.setCreatedAt(now.minus(4, ChronoUnit.DAYS));
                recruiterRequestRepository.save(rejectedReq);
            }

            // --- Candidate Profiles ---
            record ProfileSeed(String username, String title, int exp, BigDecimal salary,
                               String summary, Set<String> skillNames) {}
            List<ProfileSeed> profileSeeds = List.of(
                    new ProfileSeed("riya.backend", "Senior Backend Engineer", 5, BigDecimal.valueOf(2200000),
                            "Full-stack and backend developer with 5+ years building scalable microservices in Java, Spring Boot, and cloud architectures.",
                            Set.of("Java", "Spring Boot", "SQL", "Testing", "System Design", "REST API", "Docker", "Kafka")),
                    new ProfileSeed("samir.react", "Frontend Engineer", 3, BigDecimal.valueOf(1600000),
                            "Creative frontend engineer specializing in high-performance web applications using React, TypeScript, and modern design systems.",
                            Set.of("React", "TypeScript", "UI/UX", "SQL", "GraphQL", "Angular")),
                    new ProfileSeed("ananya.data", "Data Scientist / ML Engineer", 4, BigDecimal.valueOf(2000000),
                            "Data analytics and machine learning practitioner with expertise in Python data pipelines, statistical modeling, and AWS.",
                            Set.of("Python", "SQL", "Machine Learning", "AWS", "TensorFlow", "Tableau")),
                    new ProfileSeed("karan.devops", "Senior DevOps / Cloud Engineer", 6, BigDecimal.valueOf(2500000),
                            "Cloud infrastructure expert specializing in AWS/GCP, Kubernetes, Terraform, and building zero-downtime CI/CD pipelines.",
                            Set.of("AWS", "Kubernetes", "Docker", "Terraform", "Jenkins", "Go", "CI/CD")),
                    new ProfileSeed("priya.mobile", "Mobile Developer (iOS/Android)", 4, BigDecimal.valueOf(1800000),
                            "Cross-platform mobile developer with expertise in Flutter, Swift, and Kotlin for consumer-facing apps.",
                            Set.of("Flutter", "Swift", "Kotlin", "React", "TypeScript")),
                    new ProfileSeed("arjun.ml", "AI/ML Research Engineer", 3, BigDecimal.valueOf(2100000),
                            "Machine learning researcher with focus on NLP, computer vision, and deep learning model deployment.",
                            Set.of("Python", "TensorFlow", "PyTorch", "Machine Learning", "AWS", "Spark"))
            );

            for (ProfileSeed ps : profileSeeds) {
                User user = usersByUsername.get(ps.username());
                if (user == null) continue;
                CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
                    CandidateProfile cp = new CandidateProfile();
                    cp.setUserId(user.getId());
                    cp.setUser(user);
                    return cp;
                });
                profile.setSummary(ps.summary());
                profile.setCurrentJobTitle(ps.title());
                profile.setTotalExperienceYears(ps.exp());
                profile.setExpectedSalary(ps.salary());
                profile.setLocation(user.getLocation());
                profile.setPhone(user.getMobileNumber());
                String resumeName = "sample_" + ps.username().replace(".", "_") + "_resume.pdf";
                try {
                    fileStorageService.saveDocument("uploads/resumes", resumeName, resumeName, "RESUME", "application/pdf", fileStorageService.createSamplePdfContent("Curriculum Vitae / Resume", "Candidate Profile: " + user.getFirstName() + " " + user.getLastName() + " - " + ps.title()));
                } catch (Exception ignored) {}
                profile.setResumeFileName(resumeName);
                profile.setResumeUrl("/api/resumes/view/" + resumeName);
                profile.setResumePath("uploads/resumes/" + resumeName);
                Set<Skill> skillObjs = ps.skillNames().stream()
                        .map(skillsByName::get).filter(Objects::nonNull)
                        .collect(Collectors.toCollection(LinkedHashSet::new));
                profile.setSkills(skillObjs);
                profile.setProfileCompletionPercentage(90);
                candidateProfileRepository.save(profile);
            }

            // --- Jobs ---
            List<User> recruiters = usersByUsername.values().stream()
                    .filter(u -> u.getRole() != null && "ROLE_RECRUITER".equals(u.getRole().getName()))
                    .toList();

            if (jobRepository.count() == 0 && !recruiters.isEmpty()) {
                User rec1 = recruiters.get(0);
                User rec2 = recruiters.size() > 1 ? recruiters.get(1) : rec1;
                User rec3 = recruiters.size() > 2 ? recruiters.get(2) : rec1;

                record JobSeed(String title, String comp, String loc, int exp, String sal,
                               String mode, String type, String cat, List<String> skillNames, String desc) {}

                List<JobSeed> jobList = List.of(
                        // ── Software Engineering ──
                        new JobSeed("Senior Backend Engineer (Java/Spring Boot)", "Microsoft", "Bengaluru", 4, "18-28 LPA", "Hybrid", "Full Time", "Software Engineering",
                                List.of("Java", "Spring Boot", "SQL", "System Design", "Kafka", "Docker"),
                                "Architect and build high-throughput microservices using Java 21, Spring Boot 3, and Azure/AWS. Lead technical designs and scale distributed systems serving millions of users globally."),
                        new JobSeed("Frontend Platform Engineer (React/TypeScript)", "Google", "Hyderabad", 3, "16-25 LPA", "Remote", "Full Time", "Software Engineering",
                                List.of("React", "TypeScript", "UI/UX", "Testing", "GraphQL"),
                                "Build pixel-perfect, accessible, high-performance single-page applications with React 18, TypeScript, and modern component systems. Shape the developer experience for thousands of engineers."),
                        new JobSeed("Full Stack Engineer (Java + React)", "Meta", "Pune", 3, "15-24 LPA", "Hybrid", "Full Time", "Software Engineering",
                                List.of("Java", "React", "Spring Boot", "SQL", "TypeScript"),
                                "End-to-end full-stack development across community and commercial applications. Work with Spring Boot REST services and dynamic React frontends to ship features impacting billions."),
                        new JobSeed("Backend Engineer - Payments Platform", "Stripe", "Bengaluru", 4, "20-32 LPA", "Remote", "Full Time", "Software Engineering",
                                List.of("Java", "Go", "PostgreSQL", "Kafka", "System Design", "REST API"),
                                "Build the next generation of Stripe's global payments infrastructure. Work on highly reliable, fault-tolerant distributed systems processing billions of dollars daily."),
                        new JobSeed("Node.js Backend Engineer", "LinkedIn", "Hyderabad", 3, "14-22 LPA", "Hybrid", "Full Time", "Software Engineering",
                                List.of("Node.js", "TypeScript", "MongoDB", "Redis", "REST API", "Docker"),
                                "Build scalable APIs and backend services for LinkedIn's professional social platform with Node.js, TypeScript, and modern NoSQL databases serving 900M+ professionals."),
                        new JobSeed("Software Engineer - Go/Systems", "Uber", "Bengaluru", 4, "22-35 LPA", "Hybrid", "Full Time", "Software Engineering",
                                List.of("Go", "Kafka", "PostgreSQL", "Docker", "Kubernetes"),
                                "Engineer high-performance, low-latency backend services at Uber scale. Build in Go, leverage event streaming with Kafka, and optimize for city-scale real-time operations."),
                        new JobSeed("GraphQL API Engineer", "Airbnb", "Remote", 3, "18-26 LPA", "Remote", "Full Time", "Software Engineering",
                                List.of("GraphQL", "Node.js", "TypeScript", "React", "PostgreSQL"),
                                "Design and implement the GraphQL API layer powering Airbnb's web and mobile experiences. Work on data federation, caching strategies, and developer tooling for our global platform."),
                        new JobSeed("Software Engineer II - Backend", "Salesforce", "Bengaluru", 2, "12-18 LPA", "Hybrid", "Full Time", "Software Engineering",
                                List.of("Java", "Spring Boot", "SQL", "Azure", "REST API"),
                                "Join Salesforce's engineering team to build CRM product features. Work on Java microservices, REST APIs, and multi-tenant cloud architecture at enterprise scale."),

                        // ── Cloud & DevOps ──
                        new JobSeed("Cloud Infrastructure & DevOps Engineer", "Amazon", "Bengaluru", 5, "20-35 LPA", "Hybrid", "Full Time", "Cloud & DevOps",
                                List.of("AWS", "Docker", "Kubernetes", "Python", "Terraform", "CI/CD"),
                                "Design and automate enterprise cloud infrastructure on AWS. Implement CI/CD pipelines, container orchestration with Kubernetes, and observability systems for Amazon's global e-commerce platform."),
                        new JobSeed("Senior Site Reliability Engineer (SRE)", "Google", "Hyderabad", 5, "25-40 LPA", "Hybrid", "Full Time", "Cloud & DevOps",
                                List.of("Kubernetes", "Go", "Python", "GCP", "Docker", "Terraform", "Ansible"),
                                "Maintain 99.99% uptime for critical infrastructure. Drive reliability engineering, incident response, and infrastructure automation across Google Cloud Platform."),
                        new JobSeed("Platform Engineer - Kubernetes & Helm", "Salesforce", "Bengaluru", 4, "18-28 LPA", "Hybrid", "Full Time", "Cloud & DevOps",
                                List.of("Kubernetes", "Docker", "AWS", "Azure", "CI/CD", "Terraform", "Jenkins"),
                                "Build and maintain Salesforce's internal developer platform on Kubernetes. Implement GitOps workflows and improve deployment velocity for 50,000+ engineers."),
                        new JobSeed("DevOps Engineer - CI/CD & Automation", "IBM", "Pune", 3, "12-18 LPA", "Hybrid", "Full Time", "Cloud & DevOps",
                                List.of("Jenkins", "Docker", "Kubernetes", "Ansible", "Python", "CI/CD"),
                                "Automate and streamline the software delivery lifecycle for IBM's enterprise clients. Implement CI/CD pipelines, infrastructure-as-code, and monitoring solutions."),

                        // ── Data & Analytics ──
                        new JobSeed("Lead Data Scientist & ML Engineer", "Netflix", "Remote", 5, "25-42 LPA", "Remote", "Full Time", "Data & Analytics",
                                List.of("Python", "Machine Learning", "SQL", "AWS", "Spark", "TensorFlow"),
                                "Build recommendation algorithms and predictive models powering global entertainment. Develop high-scale inference pipelines and experiment frameworks influencing content strategy for 260M subscribers."),
                        new JobSeed("Data Engineer - Real-Time Pipelines", "Amazon", "Hyderabad", 4, "18-28 LPA", "Hybrid", "Full Time", "Data & Analytics",
                                List.of("Python", "Spark", "Kafka", "AWS", "SQL", "PostgreSQL"),
                                "Design and build real-time data pipelines processing petabytes of e-commerce data daily. Work with Apache Spark, Kafka, and AWS data services to power Amazon's analytics platform."),
                        new JobSeed("Business Intelligence Engineer", "Salesforce", "Bengaluru", 3, "14-20 LPA", "Hybrid", "Full Time", "Data & Analytics",
                                List.of("SQL", "Python", "Tableau", "PostgreSQL"),
                                "Transform complex business data into actionable insights. Build dashboards, reports, and analytical models that drive product and strategic decisions for Salesforce leadership."),
                        new JobSeed("Analytics Engineer - dbt & Snowflake", "Spotify", "Remote", 3, "16-24 LPA", "Remote", "Full Time", "Data & Analytics",
                                List.of("SQL", "Python", "Tableau", "Spark", "AWS"),
                                "Build Spotify's music analytics data layer. Power dashboards and data products that help 600M+ users discover the right music."),

                        // ── AI & Machine Learning ──
                        new JobSeed("AI Research Engineer - NLP", "Google", "Bengaluru", 4, "28-48 LPA", "Hybrid", "Full Time", "AI & Machine Learning",
                                List.of("Python", "TensorFlow", "PyTorch", "Machine Learning", "SQL"),
                                "Research and develop cutting-edge NLP models for Google Search, Assistant, and Bard. Work alongside world-class AI researchers to advance the state of the art in language understanding."),
                        new JobSeed("Machine Learning Engineer - Recommendations", "Netflix", "Remote", 3, "22-36 LPA", "Remote", "Full Time", "AI & Machine Learning",
                                List.of("Python", "PyTorch", "Machine Learning", "Spark", "Kafka", "AWS"),
                                "Build ML models powering Netflix's personalization engine. Design A/B testing frameworks, develop feature engineering pipelines, and deploy models serving real-time predictions."),
                        new JobSeed("Computer Vision Engineer", "Apple", "Hyderabad", 4, "24-40 LPA", "Hybrid", "Full Time", "AI & Machine Learning",
                                List.of("Python", "TensorFlow", "PyTorch", "Machine Learning", "Swift"),
                                "Develop computer vision models for iPhone, iPad, and Mac. Work on face recognition, object detection, and AR frameworks that ship to hundreds of millions of devices."),

                        // ── Design & UX ──
                        new JobSeed("Senior Product Designer (UX/UI)", "Airbnb", "Remote", 5, "20-32 LPA", "Remote", "Full Time", "Design & UX",
                                List.of("Figma", "UI/UX"),
                                "Lead design for Airbnb's guest and host experience. Create intuitive, visually stunning interfaces that make travel accessible to everyone worldwide."),
                        new JobSeed("UX Researcher", "Microsoft", "Hyderabad", 3, "14-22 LPA", "Hybrid", "Full Time", "Design & UX",
                                List.of("Figma", "UI/UX"),
                                "Conduct qualitative and quantitative research to shape Microsoft's product strategy. Run user studies and synthesize insights to build more human-centered products."),
                        new JobSeed("Product Designer - Growth", "Spotify", "Remote", 3, "16-24 LPA", "Remote", "Full Time", "Design & UX",
                                List.of("Figma", "UI/UX"),
                                "Shape Spotify's freemium onboarding and premium conversion experience. Work with data, experimentation, and user research to design flows that drive subscription growth."),

                        // ── QA & Testing ──
                        new JobSeed("QA Automation Engineer", "Apple", "Hyderabad", 3, "12-18 LPA", "On-site", "Full Time", "QA & Testing",
                                List.of("Testing", "Java", "Python", "SQL"),
                                "Create automated test suites and end-to-end integration frameworks for enterprise applications. Drive product quality and reliability metrics for Apple's suite of professional apps."),
                        new JobSeed("Senior SDET - Test Architecture", "Microsoft", "Bengaluru", 5, "18-26 LPA", "Hybrid", "Full Time", "QA & Testing",
                                List.of("Testing", "Java", "TypeScript", "CI/CD", "Azure"),
                                "Architect automated testing frameworks for Microsoft's cloud products. Define testing standards and build test infrastructure across 200+ engineering teams."),

                        // ── Mobile Development ──
                        new JobSeed("Senior iOS Engineer (Swift/SwiftUI)", "Uber", "Bengaluru", 4, "20-32 LPA", "Hybrid", "Full Time", "Mobile Development",
                                List.of("Swift", "Kotlin", "REST API", "TypeScript"),
                                "Build world-class iOS experiences for Uber's rider and driver apps used by 130M+ active users. Work with SwiftUI, Combine, and Uber's custom design system."),
                        new JobSeed("Flutter Developer - Cross-Platform", "LinkedIn", "Hyderabad", 3, "14-22 LPA", "Hybrid", "Full Time", "Mobile Development",
                                List.of("Flutter", "Kotlin", "Swift", "REST API"),
                                "Build LinkedIn's next-gen mobile apps using Flutter for iOS and Android. Deliver rich, performant cross-platform experiences to 900M+ professionals."),

                        // ── Product Management ──
                        new JobSeed("Senior Product Manager - Platform", "Salesforce", "Bengaluru", 6, "22-38 LPA", "Hybrid", "Full Time", "Product Management",
                                List.of("Agile", "Scrum", "JIRA", "SQL"),
                                "Own the product strategy for Salesforce's developer platform. Define roadmaps, work with engineering leads, and drive platform adoption across thousands of ISV partners."),
                        new JobSeed("Product Manager - Growth", "Spotify", "Remote", 4, "18-28 LPA", "Remote", "Full Time", "Product Management",
                                List.of("Agile", "SQL", "Scrum", "JIRA"),
                                "Lead growth initiatives for Spotify's freemium conversion funnel. Use data, experimentation, and user research to drive subscription growth for 600M+ listeners worldwide.")
                );

                for (int i = 0; i < jobList.size(); i++) {
                    JobSeed js = jobList.get(i);
                    Company comp = companiesByName.get(js.comp());
                    Category cat = categoriesByName.get(js.cat());

                    Job job = new Job();
                    job.setTitle(js.title());
                    job.setCompany(comp);
                    job.setCategory(cat);
                    job.setLocation(js.loc());
                    job.setExperienceRequired(js.exp());
                    job.setMinExperience(Math.max(0, js.exp() - 1));
                    job.setMaxExperience(js.exp() + 3);
                    job.setOpenings(2 + (i % 4));
                    job.setDepartment(cat != null ? cat.getName() : "Engineering");
                    job.setIndustry("Information Technology & Services");
                    job.setSalaryRange(js.sal());
                    job.setWorkMode(js.mode());
                    job.setJobType(js.type());
                    job.setDescription(js.desc());
                    job.setResponsibilities("Architect, implement, and maintain scalable solutions.\nLead code reviews and drive architectural standards.\nPartner with cross-functional product and engineering teams.");
                    job.setBenefits("Comprehensive Health & Life Insurance, Performance Bonuses, ESOP/Equity Grants, Remote Setup Allowance, Annual Education Budget.");
                    job.setEducationRequirements("Bachelor's or Master's degree in Computer Science, Information Technology, or equivalent experience.");
                    job.setApplicationDeadline("2026-12-31");
                    job.setStatus("PUBLISHED");

                    User assignedRec = (i % 3 == 0) ? rec1 : (i % 3 == 1) ? rec2 : rec3;
                    job.setRecruiter(assignedRec);
                    job.setRecruiterId(assignedRec.getId());
                    job.setCreatedAt(now.minus((long) (i * 1.5), ChronoUnit.DAYS));

                    List<Skill> allSkillObjs = js.skillNames().stream()
                            .map(skillsByName::get).filter(Objects::nonNull)
                            .toList();
                    Set<Skill> reqSkills = new LinkedHashSet<>(allSkillObjs.subList(0, Math.min(3, allSkillObjs.size())));
                    Set<Skill> prefSkills = new LinkedHashSet<>(allSkillObjs.subList(Math.min(3, allSkillObjs.size()), Math.min(5, allSkillObjs.size())));
                    Set<Skill> addSkills = allSkillObjs.size() > 5 ? new LinkedHashSet<>(allSkillObjs.subList(5, allSkillObjs.size())) : Collections.emptySet();

                    job.setSkills(reqSkills);
                    job.setPreferredSkills(prefSkills);
                    job.setAdditionalSkills(addSkills);
                    jobRepository.save(job);
                }

                // Seed 1 PENDING job for Admin Moderation review
                Job pendingJob = new Job();
                pendingJob.setTitle("Principal Cloud & Security Architect");
                pendingJob.setCompany(companiesByName.get("Microsoft"));
                pendingJob.setCategory(categoriesByName.get("Cloud & DevOps"));
                pendingJob.setLocation("Bengaluru");
                pendingJob.setExperienceRequired(8);
                pendingJob.setMinExperience(7);
                pendingJob.setMaxExperience(14);
                pendingJob.setOpenings(1);
                pendingJob.setDepartment("Cloud & Security");
                pendingJob.setIndustry("Cloud Computing");
                pendingJob.setSalaryRange("35-55 LPA");
                pendingJob.setWorkMode("Hybrid");
                pendingJob.setJobType("Full Time");
                pendingJob.setDescription("Architect next-generation zero-trust enterprise cloud security framework for hyperscale operations.");
                pendingJob.setResponsibilities("Define cloud security boundaries, lead DevSecOps implementation, mentor senior engineers.");
                pendingJob.setBenefits("Executive stock grants, health coverage, sabbatical allowance.");
                pendingJob.setEducationRequirements("B.Tech / M.Tech in CS or related field.");
                pendingJob.setApplicationDeadline("2026-11-30");
                pendingJob.setStatus("PENDING");
                pendingJob.setRecruiter(rec1);
                pendingJob.setRecruiterId(rec1.getId());
                pendingJob.setCreatedAt(now.minus(4, ChronoUnit.HOURS));
                pendingJob.setSkills(Set.of(skillsByName.get("AWS"), skillsByName.get("Kubernetes"), skillsByName.get("Terraform")));
                pendingJob.setPreferredSkills(Set.of(skillsByName.get("Go"), skillsByName.get("CI/CD")));
                jobRepository.save(pendingJob);
            }

            // --- Applications ---
            List<Job> allJobs = jobRepository.findAll();
            User riya   = usersByUsername.get("riya.backend");
            User samir  = usersByUsername.get("samir.react");
            User ananya = usersByUsername.get("ananya.data");
            User karan  = usersByUsername.get("karan.devops");
            User priyaM = usersByUsername.get("priya.mobile");
            User arjun  = usersByUsername.get("arjun.ml");
            List<User> recruiters2 = usersByUsername.values().stream()
                    .filter(u -> u.getRole() != null && "ROLE_RECRUITER".equals(u.getRole().getName()))
                    .toList();

            if (applicationRepository.count() == 0 && allJobs.size() >= 5) {
                java.util.function.Function<String, Job> findJob = (fragment) ->
                        allJobs.stream().filter(j -> j.getTitle().contains(fragment)).findFirst().orElse(allJobs.get(0));

                java.util.function.Consumer<Application> saveApp = (app) -> {
                    if (app.getCandidate() != null) {
                        String fname = "sample_" + app.getCandidate().getUsername().replace(".", "_") + "_resume.pdf";
                        app.setResumeFileName(fname);
                        app.setResumeUrl("/api/resumes/view/" + fname);
                    }
                    applicationRepository.save(app);
                };

                // ── RIYA ──
                Job msftJob   = findJob.apply("Senior Backend Engineer (Java");
                Job stripeJob = findJob.apply("Backend Engineer - Payments");
                Job metaJob   = findJob.apply("Full Stack Engineer (Java");
                Job linkedinJob = findJob.apply("Node.js Backend");

                Application app1 = new Application();
                app1.setJob(msftJob); app1.setCandidate(riya);
                app1.setAppliedDate(now.minus(10, ChronoUnit.DAYS));
                app1.setMatchScore(BigDecimal.valueOf(92.00));
                app1.setStatus(Application.ApplicationStatus.INTERVIEW_SCHEDULED);
                app1.setRecruiterNotes("Strong Spring Boot and system design fundamentals. Cleared initial screening.");
                saveApp.accept(app1);

                if (!recruiters2.isEmpty()) {
                    Interview iv1 = new Interview();
                    iv1.setApplication(app1); iv1.setInterviewer(recruiters2.get(0));
                    iv1.setInterviewDate(now.plus(2, ChronoUnit.DAYS));
                    iv1.setInterviewType("System Architecture Round");
                    iv1.setMeetingLink("https://meet.google.com/xyz-msft-arch");
                    iv1.setStatus("SCHEDULED"); iv1.setFeedback("Pre-screening cleared. Round 1 scheduled.");
                    interviewRepository.save(iv1);
                }

                Application app2 = new Application();
                app2.setJob(stripeJob); app2.setCandidate(riya);
                app2.setAppliedDate(now.minus(20, ChronoUnit.DAYS));
                app2.setMatchScore(BigDecimal.valueOf(88.00));
                app2.setStatus(Application.ApplicationStatus.OFFER_SENT);
                saveApp.accept(app2);

                Offer offer1 = new Offer();
                offer1.setApplication(app2); offer1.setSalaryOffered(BigDecimal.valueOf(2600000));
                offer1.setJoiningDate("Within 30 Days");
                offer1.setDetails("Comprehensive health insurance, joining bonus, remote setup allowance, quarterly equity grants.");
                offer1.setStatus("PENDING"); offerRepository.save(offer1);

                Application app3 = new Application();
                app3.setJob(metaJob); app3.setCandidate(riya);
                app3.setAppliedDate(now.minus(7, ChronoUnit.DAYS));
                app3.setMatchScore(BigDecimal.valueOf(85.00));
                app3.setStatus(Application.ApplicationStatus.SHORTLISTED);
                app3.setRecruiterNotes("Good full-stack background. Moving to technical screening.");
                saveApp.accept(app3);

                Application app4 = new Application();
                app4.setJob(linkedinJob); app4.setCandidate(riya);
                app4.setAppliedDate(now.minus(2, ChronoUnit.DAYS));
                app4.setMatchScore(BigDecimal.valueOf(78.00));
                app4.setStatus(Application.ApplicationStatus.APPLIED);
                saveApp.accept(app4);

                // ── SAMIR ──
                Job googleFEJob  = findJob.apply("Frontend Platform Engineer");
                Job airbnbGQLJob = findJob.apply("GraphQL API");

                Application app5 = new Application();
                app5.setJob(googleFEJob); app5.setCandidate(samir);
                app5.setAppliedDate(now.minus(8, ChronoUnit.DAYS));
                app5.setMatchScore(BigDecimal.valueOf(95.00));
                app5.setStatus(Application.ApplicationStatus.INTERVIEW_SCHEDULED);
                app5.setRecruiterNotes("Exceptional UI portfolio and React performance background.");
                saveApp.accept(app5);

                if (recruiters2.size() > 1) {
                    Interview iv2 = new Interview();
                    iv2.setApplication(app5); iv2.setInterviewer(recruiters2.get(1));
                    iv2.setInterviewDate(now.plus(1, ChronoUnit.DAYS));
                    iv2.setInterviewType("Technical Coding Round");
                    iv2.setMeetingLink("https://meet.google.com/abc-google-fe");
                    iv2.setStatus("SCHEDULED"); iv2.setFeedback("Strong candidate. Proceeding to technical round.");
                    interviewRepository.save(iv2);
                }

                Application app6 = new Application();
                app6.setJob(airbnbGQLJob); app6.setCandidate(samir);
                app6.setAppliedDate(now.minus(5, ChronoUnit.DAYS));
                app6.setMatchScore(BigDecimal.valueOf(82.00));
                app6.setStatus(Application.ApplicationStatus.SHORTLISTED);
                saveApp.accept(app6);

                Application app7 = new Application();
                app7.setJob(metaJob); app7.setCandidate(samir);
                app7.setAppliedDate(now.minus(3, ChronoUnit.DAYS));
                app7.setMatchScore(BigDecimal.valueOf(76.00));
                app7.setStatus(Application.ApplicationStatus.APPLIED);
                saveApp.accept(app7);

                // ── ANANYA ──
                Job netflixJob    = findJob.apply("Lead Data Scientist");
                Job amazonDataJob = findJob.apply("Data Engineer - Real-Time");
                Job googleAIJob   = findJob.apply("AI Research Engineer");

                Application app8 = new Application();
                app8.setJob(netflixJob); app8.setCandidate(ananya);
                app8.setAppliedDate(now.minus(25, ChronoUnit.DAYS));
                app8.setMatchScore(BigDecimal.valueOf(91.00));
                app8.setStatus(Application.ApplicationStatus.OFFER_SENT);
                saveApp.accept(app8);

                Offer offer2 = new Offer();
                offer2.setApplication(app8); offer2.setSalaryOffered(BigDecimal.valueOf(3200000));
                offer2.setJoiningDate("Within 45 Days");
                offer2.setDetails("Health & dental, ESOP vesting over 4 years, annual learning budget, unlimited vacation.");
                offer2.setStatus("ACCEPTED"); offerRepository.save(offer2);

                Application app9 = new Application();
                app9.setJob(amazonDataJob); app9.setCandidate(ananya);
                app9.setAppliedDate(now.minus(12, ChronoUnit.DAYS));
                app9.setMatchScore(BigDecimal.valueOf(87.00));
                app9.setStatus(Application.ApplicationStatus.INTERVIEW_SCHEDULED);
                app9.setRecruiterNotes("Strong Spark and Python background. Excellent data pipeline experience.");
                saveApp.accept(app9);

                if (!recruiters2.isEmpty()) {
                    Interview iv3 = new Interview();
                    iv3.setApplication(app9); iv3.setInterviewer(recruiters2.get(0));
                    iv3.setInterviewDate(now.plus(3, ChronoUnit.DAYS));
                    iv3.setInterviewType("Data & System Design");
                    iv3.setMeetingLink("https://chime.aws/amazon-data-interview");
                    iv3.setStatus("SCHEDULED"); iv3.setFeedback("Passed assessment. Proceeding to system design round.");
                    interviewRepository.save(iv3);
                }

                Application app10 = new Application();
                app10.setJob(googleAIJob); app10.setCandidate(ananya);
                app10.setAppliedDate(now.minus(1, ChronoUnit.DAYS));
                app10.setMatchScore(BigDecimal.valueOf(79.00));
                app10.setStatus(Application.ApplicationStatus.APPLIED);
                saveApp.accept(app10);

                // ── KARAN ──
                Job amazonDevOpsJob = findJob.apply("Cloud Infrastructure");
                Job googleSREJob    = findJob.apply("Senior Site Reliability");
                Job sfPlatformJob   = findJob.apply("Platform Engineer - Kubernetes");

                Application app11 = new Application();
                app11.setJob(amazonDevOpsJob); app11.setCandidate(karan);
                app11.setAppliedDate(now.minus(9, ChronoUnit.DAYS));
                app11.setMatchScore(BigDecimal.valueOf(93.00));
                app11.setStatus(Application.ApplicationStatus.INTERVIEW_SCHEDULED);
                app11.setRecruiterNotes("6 years of hands-on AWS and Kubernetes. Near-perfect technical assessment.");
                saveApp.accept(app11);

                if (recruiters2.size() > 1) {
                    Interview iv4 = new Interview();
                    iv4.setApplication(app11); iv4.setInterviewer(recruiters2.get(1));
                    iv4.setInterviewDate(now.plus(4, ChronoUnit.DAYS));
                    iv4.setInterviewType("Infrastructure Design Round");
                    iv4.setMeetingLink("https://chime.aws/amazon-devops-interview");
                    iv4.setStatus("SCHEDULED"); iv4.setFeedback("Excellent AWS architecture knowledge.");
                    interviewRepository.save(iv4);

                    Interview iv5 = new Interview();
                    iv5.setApplication(app11); iv5.setInterviewer(recruiters2.get(0));
                    iv5.setInterviewDate(now.minus(3, ChronoUnit.DAYS));
                    iv5.setInterviewType("HR & Culture Fit");
                    iv5.setMeetingLink("https://chime.aws/amazon-devops-hr");
                    iv5.setStatus("COMPLETED"); iv5.setFeedback("Good cultural alignment. Leadership principles well demonstrated.");
                    interviewRepository.save(iv5);
                }

                Application app12 = new Application();
                app12.setJob(googleSREJob); app12.setCandidate(karan);
                app12.setAppliedDate(now.minus(6, ChronoUnit.DAYS));
                app12.setMatchScore(BigDecimal.valueOf(89.00));
                app12.setStatus(Application.ApplicationStatus.SHORTLISTED);
                app12.setRecruiterNotes("Strong SRE background with GCP experience.");
                saveApp.accept(app12);

                Application app13 = new Application();
                app13.setJob(sfPlatformJob); app13.setCandidate(karan);
                app13.setAppliedDate(now.minus(2, ChronoUnit.DAYS));
                app13.setMatchScore(BigDecimal.valueOf(84.00));
                app13.setStatus(Application.ApplicationStatus.APPLIED);
                saveApp.accept(app13);

                // ── PRIYA.MOBILE ──
                Job uberIOSJob       = findJob.apply("Senior iOS Engineer");
                Job linkedinFlutter  = findJob.apply("Flutter Developer");

                if (priyaM != null) {
                    Application app14 = new Application();
                    app14.setJob(uberIOSJob); app14.setCandidate(priyaM);
                    app14.setAppliedDate(now.minus(7, ChronoUnit.DAYS));
                    app14.setMatchScore(BigDecimal.valueOf(86.00));
                    app14.setStatus(Application.ApplicationStatus.SHORTLISTED);
                    app14.setRecruiterNotes("Strong SwiftUI portfolio. Relevant consumer app experience at scale.");
                    saveApp.accept(app14);

                    Application app15 = new Application();
                    app15.setJob(linkedinFlutter); app15.setCandidate(priyaM);
                    app15.setAppliedDate(now.minus(3, ChronoUnit.DAYS));
                    app15.setMatchScore(BigDecimal.valueOf(81.00));
                    app15.setStatus(Application.ApplicationStatus.APPLIED);
                    saveApp.accept(app15);
                }

                // ── ARJUN ──
                Job netflixMLJob = findJob.apply("Machine Learning Engineer - Recommendations");
                Job appleCVJob   = findJob.apply("Computer Vision");

                if (arjun != null) {
                    Application app16 = new Application();
                    app16.setJob(netflixMLJob); app16.setCandidate(arjun);
                    app16.setAppliedDate(now.minus(11, ChronoUnit.DAYS));
                    app16.setMatchScore(BigDecimal.valueOf(90.00));
                    app16.setStatus(Application.ApplicationStatus.INTERVIEW_SCHEDULED);
                    app16.setRecruiterNotes("Strong PyTorch background. Excellent paper on collaborative filtering.");
                    saveApp.accept(app16);

                    if (!recruiters2.isEmpty()) {
                        Interview iv6 = new Interview();
                        iv6.setApplication(app16); iv6.setInterviewer(recruiters2.get(0));
                        iv6.setInterviewDate(now.plus(5, ChronoUnit.DAYS));
                        iv6.setInterviewType("ML System Design");
                        iv6.setMeetingLink("https://zoom.us/netflix-ml-interview");
                        iv6.setStatus("SCHEDULED"); iv6.setFeedback("Strong ML fundamentals. System design round scheduled.");
                        interviewRepository.save(iv6);
                    }

                    Application app17 = new Application();
                    app17.setJob(appleCVJob); app17.setCandidate(arjun);
                    app17.setAppliedDate(now.minus(5, ChronoUnit.DAYS));
                    app17.setMatchScore(BigDecimal.valueOf(83.00));
                    app17.setStatus(Application.ApplicationStatus.SHORTLISTED);
                    saveApp.accept(app17);

                    Application app18 = new Application();
                    app18.setJob(googleAIJob); app18.setCandidate(arjun);
                    app18.setAppliedDate(now.minus(2, ChronoUnit.DAYS));
                    app18.setMatchScore(BigDecimal.valueOf(88.00));
                    app18.setStatus(Application.ApplicationStatus.APPLIED);
                    saveApp.accept(app18);
                }
            }

            // --- Notifications ---
            if (notificationRepository.count() == 0) {
                List<Object[]> notifData = new ArrayList<>();
                if (riya   != null) {
                    notifData.add(new Object[]{riya.getId(), "Your application for Senior Backend Engineer at Microsoft has been moved to INTERVIEW_SCHEDULED.", 2, false});
                    notifData.add(new Object[]{riya.getId(), "Official Offer Extended: Backend Engineer at Stripe! Review your offer details in the portal.", 24, false});
                    notifData.add(new Object[]{riya.getId(), "Your application for Full Stack Engineer at Meta has been SHORTLISTED.", 48, true});
                }
                if (samir  != null) {
                    notifData.add(new Object[]{samir.getId(), "Your application for Frontend Platform Engineer at Google has been moved to INTERVIEW_SCHEDULED.", 3, false});
                    notifData.add(new Object[]{samir.getId(), "Application for GraphQL API Engineer at Airbnb has been SHORTLISTED.", 72, true});
                }
                if (ananya != null) {
                    notifData.add(new Object[]{ananya.getId(), "Congratulations! You received a job offer from Netflix for Lead Data Scientist role.", 1, false});
                    notifData.add(new Object[]{ananya.getId(), "Interview scheduled for Data Engineer at Amazon — 3 days from now.", 6, false});
                }
                if (karan  != null) {
                    notifData.add(new Object[]{karan.getId(), "Your application for Cloud Infrastructure Engineer at Amazon is INTERVIEW_SCHEDULED.", 4, false});
                    notifData.add(new Object[]{karan.getId(), "Application for Senior SRE at Google has been SHORTLISTED.", 96, true});
                }
                if (arjun  != null) {
                    notifData.add(new Object[]{arjun.getId(), "Interview scheduled for ML Engineer at Netflix — System Design Round in 5 days.", 5, false});
                    notifData.add(new Object[]{arjun.getId(), "Application for Computer Vision Engineer at Apple has been SHORTLISTED.", 48, true});
                }

                for (Object[] nd : notifData) {
                    Notification n = new Notification();
                    n.setUserId((Long) nd[0]);
                    n.setMessage((String) nd[1]);
                    n.setCreatedAt(now.minus((Integer) nd[2], ChronoUnit.HOURS));
                    n.setIsRead((Boolean) nd[3]);
                    notificationRepository.save(n);
                }
            }

            // --- Audit Log ---
            if (auditLogRepository.count() == 0) {
                AuditLog log = new AuditLog();
                log.setEventType("SYSTEM_STARTUP");
                log.setUserId(1L);
                log.setDetails("GlobalCo JobBoard production database seeded successfully with expanded dataset.");
                log.setTimestamp(now);
                auditLogRepository.save(log);
            }
        });
    }
}
