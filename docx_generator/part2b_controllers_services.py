from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa
)
from docx.shared import Inches, Pt

def generate_part_2b_controllers_services(doc):
    add_heading_1(doc, "Complete File-by-File Deep Dive: Controllers, Services & Data Tier")
    add_p(doc,
        "This section provides an exhaustive, class-by-class inspection of all 14 REST Controllers, 11 Domain Services, "
        "13 JPA Entities, and 13 Spring Data Repositories implemented in the GlobalCo Spring Boot backend. "
        "Every endpoint, injection dependency, validation rule, and transaction boundary is documented here."
    )

    # ==========================================
    # ALL 14 REST CONTROLLERS
    # ==========================================
    add_heading_1(doc, "Exhaustive Inspection of All 14 REST Controllers")

    controllers = [
        ("AuthController.java", "/api/auth", "Authentication & Identity Management",
         "AuthService, AuthenticationManager, JwtUtil, UserRepository",
         [("POST /api/auth/register", "SignupRequest DTO", "201 Created / AuthResponse", "Public", "Validates username/email uniqueness, hashes password with BCrypt, saves User entity with selected Role, returns JWT."),
          ("POST /api/auth/login", "LoginRequest DTO", "200 OK / AuthResponse", "Public", "Authenticates credentials against Spring Security, retrieves user details, issues signed JWT token."),
          ("GET /api/auth/me", "None (Bearer Header)", "200 OK / UserDto", "Authenticated", "Returns currently authenticated user profile extracted from SecurityContextHolder.")]),

        ("JobController.java", "/api/jobs", "Public & Candidate Vacancy Catalog",
         "JobService, CandidateProfileService",
         [("GET /api/jobs", "Query params: search, location, category, type", "200 OK / List<JobDto>", "Public", "Fetches active jobs with company & category eager fetched (JOIN FETCH) to eliminate N+1 queries."),
          ("GET /api/jobs/{id}", "Path variable: id", "200 OK / JobDetailDto", "Public", "Retrieves complete job specification including description, required skills, and compensation range."),
          ("GET /api/jobs/{id}/match", "Path variable: id", "200 OK / MatchScoreBreakdownDto", "Candidate", "Executes multi-factor match engine calculating skill overlap, experience, and location fit.")]),

        ("ApplicationController.java", "/api/applications", "Candidate Application Lifecycle",
         "ApplicationService, UserService",
         [("POST /api/jobs/{id}/apply", "Path: jobId, { coverLetter }", "201 Created / ApplicationDto", "Candidate", "Validates candidate hasn't already applied (UNIQUE constraint), creates Application record in APPLIED status, dispatches notification."),
          ("GET /api/applications/my-applications", "None", "200 OK / List<ApplicationDto>", "Candidate", "Returns all applications submitted by the logged-in candidate with current pipeline stage and interview details."),
          ("POST /api/applications/{id}/withdraw", "Path variable: id", "200 OK / { message }", "Candidate", "Transitions application to WITHDRAWN status if not already finalized.")]),

        ("RecruiterController.java", "/api/recruiter", "Enterprise ATS Requisitions & Pipeline",
         "JobService, ApplicationService, RecruiterService, AnalyticsService",
         [("GET /api/recruiter/my-jobs", "None", "200 OK / List<RecruiterJobDto>", "Recruiter", "Returns all requisitions created by logged-in recruiter with live applicant counts per stage."),
          ("POST /api/recruiter/jobs", "JobCreateDto", "201 Created / JobDto", "Recruiter", "Creates new job vacancy mapped to recruiter's assigned enterprise company."),
          ("GET /api/recruiter/jobs/{id}/applicants", "Path: jobId, Query: stage", "200 OK / List<ApplicantDto>", "Recruiter", "Retrieves applicants ranked by match score with resume links and contact details."),
          ("PUT /api/recruiter/applications/{id}/status", "Path: id, { status }", "200 OK / ApplicationDto", "Recruiter", "Advances candidate across ATS stages (SCREENING -> SHORTLISTED -> INTERVIEW -> OFFER -> HIRED/REJECTED)."),
          ("GET /api/recruiter/jobs/{id}/export-applicants", "Path: jobId", "200 OK / text/csv", "Recruiter", "Generates dynamic CSV roster of all candidates with contact info and match scores for external ATS sync.")]),

        ("CandidateProfileController.java", "/api/profiles", "Candidate Resume & Skills Management",
         "CandidateProfileService, UserService",
         [("GET /api/profiles/me", "None", "200 OK / CandidateProfileDto", "Candidate", "Returns candidate bio, experience, expected salary, resume URL, and verified skill set."),
          ("PUT /api/profiles/me", "CandidateProfileDto", "200 OK / CandidateProfileDto", "Candidate", "Updates profile metadata and syncs skills in profile_skills join table.")]),

        ("InterviewController.java", "/api/interviews", "Technical Interview Coordination",
         "InterviewService, ApplicationService",
         [("POST /api/interviews/schedule", "InterviewScheduleDto", "201 Created / InterviewDto", "Recruiter", "Schedules technical round, generates meeting URL (Google Meet / Teams), sets application stage to INTERVIEW_SCHEDULED, alerts candidate."),
          ("GET /api/interviews/upcoming", "None", "200 OK / List<InterviewDto>", "Candidate / Recruiter", "Retrieves upcoming interview sessions filtered by the current user's identity.")]),

        ("OfferController.java", "/api/offers", "Formal Compensation & Acceptance",
         "OfferService, ApplicationService",
         [("POST /api/offers", "OfferRequestDto", "201 Created / OfferDto", "Recruiter", "Generates formal job offer with base salary, joining date, and terms. Advances application stage to OFFER_SENT."),
          ("PUT /api/offers/{id}/respond", "Path: id, { status: ACCEPTED/DECLINED }", "200 OK / OfferDto", "Candidate", "Records candidate offer decision. If accepted, marks application as HIRED.")]),

        ("AdminController.java", "/api/admin", "Superuser Platform Governance",
         "AdminService, UserService, JobService, AuditLogService",
         [("GET /api/admin/stats", "None", "200 OK / AdminStatsDto", "Admin", "Returns platform-wide metrics: total users, active jobs, applications, offers, and hiring velocity."),
          ("GET /api/admin/users", "Query: role, search", "200 OK / List<UserAdminDto>", "Admin", "Returns user accounts with status badges and creation dates."),
          ("PUT /api/admin/users/{id}/toggle-status", "Path: id", "200 OK / { status }", "Admin", "Toggles user enabled flag, suspending or restoring account access immediately."),
          ("GET /api/admin/logs", "Query: page, size", "200 OK / Page<AuditLogDto>", "Admin", "Returns immutable security audit stream (who performed what action from which IP).")]),

        ("CategoryController.java", "/api/categories", "Job Classification Taxonomy",
         "CategoryService / CategoryRepository",
         [("GET /api/categories", "None", "200 OK / List<CategoryDto>", "Public", "Returns taxonomy of job categories (Software Engineering, Data Science, DevOps, Product).")]),

        ("CompanyController.java", "/api/companies", "Enterprise Employer Directory",
         "CompanyService / CompanyRepository",
         [("GET /api/companies", "Query: verified", "200 OK / List<CompanyDto>", "Public", "Returns verified enterprise employers with company logos and descriptions.")]),

        ("SavedJobController.java", "/api/saved-jobs", "Candidate Bookmarks Management",
         "JobService, UserService",
         [("GET /api/saved-jobs", "None", "200 OK / List<JobDto>", "Candidate", "Returns candidate's bookmarked job vacancies."),
          ("POST /api/saved-jobs/{id}", "Path: jobId", "201 Created / { message }", "Candidate", "Bookmarks a job vacancy (enforced by unique constraint on user_id, job_id)."),
          ("DELETE /api/saved-jobs/{id}", "Path: jobId", "200 OK / { message }", "Candidate", "Removes vacancy from candidate bookmarks.")]),

        ("AnalyticsController.java", "/api/analytics", "Recruitment Conversion Metrics",
         "AnalyticsService",
         [("GET /api/analytics/recruiter", "None", "200 OK / RecruiterAnalyticsDto", "Recruiter", "Computes funnel conversion rates across ATS stages, average days to hire, and pipeline velocity.")]),

        ("NotificationController.java", "/api/notifications", "In-App Alerts & Activity Stream",
         "NotificationService",
         [("GET /api/notifications", "None", "200 OK / List<NotificationDto>", "Authenticated", "Returns unread notifications for current user (application updates, interview invites, offers)."),
          ("PUT /api/notifications/{id}/read", "Path: id", "200 OK / { message }", "Authenticated", "Marks notification as read.")]),

        ("ResumeController.java", "/api/resumes", "Resume Upload & Parser Dispatch",
         "ResumeParserService, CandidateProfileService",
         [("POST /api/resumes/upload", "MultipartFile file", "200 OK / ResumeParsedDto", "Candidate", "Accepts PDF/DOCX resume (up to 20MB), validates MIME type via Apache Tika, extracts text, identifies skills, and updates profile.")])
    ]

    for c_name, c_path, c_role, c_deps, c_endpoints in controllers:
        add_heading_2(doc, f"Controller: {c_name}")
        add_p(doc, f"Base URI Mapping: {c_path} | Primary Domain: {c_role}", bold_prefix="Architecture: ")
        add_p(doc, c_deps, bold_prefix="Injected Dependencies: ")
        
        ep_headers = ["HTTP Method & Endpoint", "Request Payload", "Response Code / DTO", "Access Level", "Execution Logic"]
        ep_data = [[ep[0], ep[1], ep[2], ep[3], ep[4]] for ep in c_endpoints]
        add_table(doc, ep_headers, ep_data, [Inches(1.5), Inches(1.2), Inches(1.2), Inches(0.9), Inches(2.4)])
        doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # ==========================================
    # ALL 11 DOMAIN SERVICES
    # ==========================================
    add_heading_1(doc, "Exhaustive Inspection of All 11 Domain Services")
    
    services = [
        ("AuthService.java",
         "Handles user registration, authentication verification, password hashing, and role mapping.",
         "UserRepository, RoleRepository, PasswordEncoder (BCrypt), JwtUtil, AuthenticationManager",
         "1. signup(): Validates unique constraints; encodes raw password with BCrypt; loads Role entity from DB; instantiates User; triggers CandidateProfile initialization if role is CANDIDATE.\n"
         "2. login(): Executes authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user, pass)); on success, fetches UserDetails and generates signed JWT token."),

        ("JobService.java",
         "Manages job requisition lifecycle, full-text catalog filtering, and company associations.",
         "JobRepository, CompanyRepository, CategoryRepository, SkillRepository",
         "1. getJobs(): Derives JPA query with specification predicates (keyword search in title/description, location match, work mode enum); uses JOIN FETCH to prevent N+1 queries.\n"
         "2. createJob(): Validates salaryMin <= salaryMax; maps recruiter entity; associates skills; saves Job entity with status OPEN."),

        ("ApplicationService.java",
         "Controls applicant state machine, idempotency checks, and recruiter status transitions.",
         "ApplicationRepository, JobRepository, UserRepository, NotificationService, AuditLogService",
         "1. applyForJob(): Decorated with @Transactional. Checks applicationRepo.existsByJobAndCandidate; if true, throws DuplicateApplicationException; inserts Application in APPLIED state; dispatches notification.\n"
         "2. updateStatus(): Enforces valid state machine transitions (e.g., cannot move from REJECTED to HIRED without re-screening); updates application status; writes immutable AuditLog entry."),

        ("CandidateProfileService.java",
         "Manages candidate resume metadata, skill tagging, and computes match scores.",
         "CandidateProfileRepository, SkillRepository, JobRepository",
         "1. calculateMatch(): Retrieves candidate verified skills and job required skills; normalizes string casing; performs HashSet intersection in O(N+M); weights skill factor (50%), experience factor (25%), and location factor (25%); returns MatchScoreBreakdownDto."),

        ("AdminService.java",
         "Provides platform telemetry aggregation, user moderation, and governance reporting.",
         "UserRepository, JobRepository, ApplicationRepository, OfferRepository, AuditLogRepository",
         "1. getPlatformStats(): Aggregates counts using database COUNT(*) queries; computes offer acceptance ratio.\n"
         "2. toggleUserStatus(): Inverts User.enabled flag; invalidates user login capability; logs moderation event."),

        ("InterviewService.java",
         "Coordinates technical interview scheduling, candidate notification, and meeting URLs.",
         "InterviewRepository, ApplicationRepository, NotificationService",
         "1. scheduleInterview(): Instantiates Interview entity with round type (Technical, HR, System Design); validates scheduledAt is in the future; updates application status to INTERVIEW_SCHEDULED; dispatches calendar invite."),

        ("OfferService.java",
         "Handles formal offer creation, salary terms, and candidate response orchestration.",
         "OfferRepository, ApplicationRepository, NotificationService, AuditLogService",
         "1. createOffer(): Validates candidate is in SELECTED stage; creates Offer record with joining date and compensation; transitions application to OFFER_SENT.\n"
         "2. respondToOffer(): If ACCEPTED, transitions application to HIRED; if DECLINED, marks application as OFFER_DECLINED; notifies hiring recruiter."),

        ("AnalyticsService.java",
         "Computes recruitment conversion metrics, pipeline velocities, and KPI telemetry.",
         "ApplicationRepository, JobRepository",
         "1. getRecruiterAnalytics(): Calculates stage-by-stage drop-off percentages; computes average time candidates spend in SCREENING vs INTERVIEW stages."),

        ("NotificationService.java",
         "Dispatches in-app notifications and manages user notification read states.",
         "NotificationRepository",
         "1. createNotification(): Instantiates Notification entity; associates with target User; sets read=false and createdAt=now().\n"
         "2. getUserNotifications(): Retrieves top 50 notifications ordered by createdAt DESC."),

        ("ResumeParserService.java",
         "Extracts plain text and technical skills from uploaded PDF and Word documents.",
         "Apache Tika Core & Parsers, SkillRepository",
         "1. parseResume(): Streams MultipartFile bytes into Apache Tika AutoDetectParser; extracts raw string text; tokenizes words; matches tokens against Skill taxonomy in database; returns detected skills array."),

        ("AuditLogService.java",
         "Maintains append-only governance trail for compliance and non-repudiation.",
         "AuditLogRepository",
         "1. logAction(): Captures action name, performedBy username, client IP address, entity ID, and timestamp; saves immutable AuditLog record.")
    ]

    for s_name, s_resp, s_deps, s_logic in services:
        add_heading_2(doc, f"Service: {s_name}")
        add_p(doc, s_resp, bold_prefix="Domain Responsibility: ")
        add_p(doc, s_deps, bold_prefix="Dependencies: ")
        add_p(doc, s_logic, bold_prefix="Core Business Logic: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # ==========================================
    # ALL 13 JPA ENTITIES & REPOSITORIES
    # ==========================================
    add_heading_1(doc, "Complete Persistence Tier: 13 JPA Entities & Repositories")
    
    entities_full = [
        ("User", "users", "id (BIGINT, PK, AUTO_INCREMENT)", "username (VARCHAR, UNIQUE, NOT NULL), email (VARCHAR, UNIQUE, NOT NULL), password (VARCHAR, NOT NULL), enabled (BOOLEAN, DEFAULT TRUE), createdAt (TIMESTAMP)", "ManyToMany(Role), OneToOne(CandidateProfile), OneToMany(Application), OneToMany(Notification)", "UserRepository: findByUsername, existsByUsername, existsByEmail, findByRolesContaining"),
        ("Role", "roles", "id (BIGINT, PK)", "name (VARCHAR, UNIQUE, NOT NULL - e.g. ROLE_CANDIDATE, ROLE_RECRUITER, ROLE_ADMIN)", "ManyToMany(User)", "RoleRepository: findByName(String name)"),
        ("CandidateProfile", "candidate_profiles", "id (BIGINT, PK)", "user_id (BIGINT, FK, UNIQUE), headline (VARCHAR), bio (TEXT), yearsOfExperience (INT), expectedSalary (DECIMAL), resumeUrl (VARCHAR)", "OneToOne(User), ManyToMany(Skill) via profile_skills join table", "CandidateProfileRepository: findByUser(User user)"),
        ("Skill", "skills", "id (BIGINT, PK)", "name (VARCHAR, UNIQUE, NOT NULL), category (VARCHAR)", "ManyToMany(CandidateProfile), ManyToMany(Job)", "SkillRepository: findByNameIgnoreCase, findByNameIn"),
        ("Job", "jobs", "id (BIGINT, PK)", "company_id (BIGINT, FK), category_id (BIGINT, FK), recruiter_id (BIGINT, FK), title (VARCHAR), description (TEXT), location (VARCHAR), workMode (ENUM), jobType (ENUM), salaryMin (DECIMAL), salaryMax (DECIMAL), active (BOOLEAN)", "ManyToOne(Company), ManyToOne(Category), ManyToOne(User/Recruiter), ManyToMany(Skill), OneToMany(Application)", "JobRepository: findByActiveTrue, findByRecruiter, searchJobs(JPQL JOIN FETCH)"),
        ("Company", "companies", "id (BIGINT, PK)", "name (VARCHAR, UNIQUE, NOT NULL), website (VARCHAR), logoUrl (VARCHAR), description (TEXT), verified (BOOLEAN)", "OneToMany(Job)", "CompanyRepository: findByVerifiedTrue"),
        ("Category", "categories", "id (BIGINT, PK)", "name (VARCHAR, UNIQUE, NOT NULL), slug (VARCHAR, UNIQUE)", "OneToMany(Job)", "CategoryRepository: findBySlug"),
        ("Application", "applications", "id (BIGINT, PK)", "job_id (BIGINT, FK), candidate_id (BIGINT, FK), status (ENUM: APPLIED..HIRED), appliedAt (TIMESTAMP), coverLetter (TEXT) [UNIQUE KEY (job_id, candidate_id)]", "ManyToOne(Job), ManyToOne(User/Candidate), OneToMany(Interview), OneToOne(Offer)", "ApplicationRepository: existsByJobAndCandidate, findByCandidate, findByJobAndStatus"),
        ("Interview", "interviews", "id (BIGINT, PK)", "application_id (BIGINT, FK), interviewer_id (BIGINT, FK), roundName (VARCHAR), scheduledAt (TIMESTAMP), meetingUrl (VARCHAR), feedback (TEXT), passed (BOOLEAN)", "ManyToOne(Application), ManyToOne(User/Interviewer)", "InterviewRepository: findByApplication, findUpcomingInterviews"),
        ("Offer", "offers", "id (BIGINT, PK)", "application_id (BIGINT, FK, UNIQUE), baseSalary (DECIMAL), joiningDate (DATE), terms (TEXT), status (ENUM: EXTENDED, ACCEPTED, DECLINED)", "OneToOne(Application)", "OfferRepository: findByApplication"),
        ("RecruiterRequest", "recruiter_requests", "id (BIGINT, PK)", "user_id (BIGINT, FK), companyName (VARCHAR), companyWebsite (VARCHAR), status (ENUM: PENDING, APPROVED, REJECTED), requestedAt (TIMESTAMP)", "ManyToOne(User)", "RecruiterRequestRepository: findByStatus"),
        ("Notification", "notifications", "id (BIGINT, PK)", "user_id (BIGINT, FK), title (VARCHAR), message (TEXT), read (BOOLEAN), createdAt (TIMESTAMP)", "ManyToOne(User)", "NotificationRepository: findByUserOrderByCreatedAtDesc"),
        ("AuditLog", "audit_logs", "id (BIGINT, PK)", "action (VARCHAR), performedBy (VARCHAR), clientIp (VARCHAR), details (TEXT), timestamp (TIMESTAMP)", "None (Decoupled append-only audit trail)", "AuditLogRepository: findAllByOrderByTimestampDesc")
    ]

    ent_headers = ["Entity Name", "Table Name", "Primary Key & Columns", "Relational Associations", "Spring Data Repository Methods"]
    ent_rows = [[e[0], e[1], f"PK: {e[2]}\nColumns: {e[3]}", e[4], e[5]] for e in entities_full]
    add_table(doc, ent_headers, ent_rows, [Inches(1.1), Inches(1.0), Inches(2.2), Inches(1.5), Inches(1.4)])
    
    doc.add_page_break()
