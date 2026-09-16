from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa, add_screenshot
)
from docx.shared import Inches, Pt

def generate_part_2(doc):
    # ==========================================
    # 11. BACKEND ARCHITECTURE
    # ==========================================
    add_heading_1(doc, "11. Backend Architecture & Request Flow")
    add_p(doc,
        "The Spring Boot 3.2.3 backend is designed according to the Single Responsibility Principle and strict "
        "Separation of Concerns across five distinct internal layers:"
    )
    add_bullet(doc, "REST Controller Layer (@RestController): Responsible solely for HTTP deserialization, JSON schema binding, request validation (@Valid), and status code orchestration (200 OK, 201 Created, 204 No Content). Controllers never execute database queries directly.")
    add_bullet(doc, "Service Layer (@Service, @Transactional): Encapsulates all domain business logic, state machines, algorithmic scoring, transaction boundaries, and audit logging. Guarantees ACID atomicity across multi-entity operations.")
    add_bullet(doc, "Data Access Layer (@Repository): Extends Spring Data JPA's JpaRepository<T, ID>. Implements optimized query derivation, JPQL custom queries with JOIN FETCH to prevent N+1 queries, and native SQL when required.")
    add_bullet(doc, "Data Transfer Object (DTO) Layer: Decouples internal database entities from external network payloads. Protects against Mass Assignment vulnerabilities and prevents Hibernate circular serialization loops.")
    add_bullet(doc, "Global Exception Handler (@RestControllerAdvice): Intercepts runtime exceptions (ResourceNotFoundException, DuplicateApplicationException, MethodArgumentNotValidException) and transforms them into standardized JSON error envelopes.")

    # ==========================================
    # 12. DATABASE ARCHITECTURE & SCHEMA DEEP DIVE
    # ==========================================
    add_heading_1(doc, "12. Database Architecture & Schema Deep Dive")
    add_p(doc,
        "The relational data model is designed to Third Normal Form (3NF) to eliminate data redundancy and ensure relational integrity. "
        "The schema supports multi-tenant isolation through role boundaries and company foreign keys."
    )
    
    er_ascii = """+--------------------+         +-----------------------+         +----------------+
|       USERS        | 1 --- 1 |   CANDIDATE_PROFILES  | 1 --- * | PROFILE_SKILLS |
+--------------------+         +-----------------------+         +----------------+
  | 1            | 1                       | 1
  |              |                         |
  | *            | *                       | *
+------------+ +----------------+        +----------------+        +----------------+
| USER_ROLES | | NOTIFICATIONS  |        |  APPLICATIONS  | * -- 1 |      JOBS      |
+------------+ +----------------+        +----------------+        +----------------+
  |                                        | 1        | 1            | *        | *
  |                                        |          |              |          |
  |                                        | *        | 1            v 1        v 1
+------------+                           +------------+ +--------+ +---------+ +----------+
| AUDIT_LOGS |                           | INTERVIEWS | | OFFERS | |COMPANIES| |CATEGORIES|
+------------+                           +------------+ +--------+ +---------+ +----------+"""
    add_code(doc, er_ascii, caption="Relational Entity-Relationship Diagram (ERD)")

    add_heading_2(doc, "12.1 Relational Integrity & Performance Constraints")
    add_bullet(doc, "Unique Constraint on Applications: applications table enforces a composite UNIQUE constraint on (job_id, candidate_id), guaranteeing at the database level that a candidate cannot apply twice to the same requisition.")
    add_bullet(doc, "Composite Key on Saved Jobs: saved_jobs table enforces a unique key on (user_id, job_id), preventing duplicate bookmarks.")
    add_bullet(doc, "N+1 Problem Prevention: JobRepository utilizes 'JOIN FETCH j.company JOIN FETCH j.category' to retrieve the complete job object graph in a single SQL query, eliminating N+1 query overhead.")

    # ==========================================
    # 13. ENTITY MODEL & RELATIONSHIPS
    # ==========================================
    add_heading_1(doc, "13. Entity Model & Data Dictionary")
    add_p(doc, "The persistence tier comprises 12 primary JPA entities mapped to relational database tables:")

    entity_headers = ["Entity Class", "Database Table", "Primary & Foreign Keys", "Relational Mappings", "Business Meaning & Lifecycle"]
    entity_data = [
        ["User", "users", "PK: id | FK: None", "ManyToMany -> Role, OneToOne -> CandidateProfile", "Core security identity holding username, email, hashed password, enabled flag."],
        ["Role", "roles", "PK: id | FK: None", "ManyToMany -> User", "Immutable authority reference table (ROLE_CANDIDATE, ROLE_RECRUITER, ROLE_ADMIN)."],
        ["CandidateProfile", "candidate_profiles", "PK: id | FK: user_id", "OneToOne -> User, ManyToMany -> Skill", "Holds professional headline, bio, experience years, expected salary, and resume URL."],
        ["Skill", "skills", "PK: id | FK: None", "ManyToMany -> CandidateProfile, ManyToMany -> Job", "Taxonomy of technical skills (Java, Spring Boot, React, AWS, Docker, etc.)."],
        ["Job", "jobs", "PK: id | FK: company_id, category_id, recruiter_id", "ManyToOne -> Company, ManyToOne -> Category, ManyToMany -> Skill", "Published job requisition holding title, description, location, job type, salary min/max, active."],
        ["Company", "companies", "PK: id | FK: None", "OneToMany -> Job", "Enterprise employer holding company name, website, logo URL, verification status."],
        ["Category", "categories", "PK: id | FK: None", "OneToMany -> Job", "Industry vertical classification (Software Engineering, Cloud & DevOps, Data Science)."],
        ["Application", "applications", "PK: id | FK: job_id, candidate_id", "ManyToOne -> Job, ManyToOne -> User", "The recruitment application record tracking status, appliedAt timestamp, and notes."],
        ["Interview", "interviews", "PK: id | FK: application_id, interviewer_id", "ManyToOne -> Application, ManyToOne -> User", "Scheduled evaluation round holding round name, scheduled time, meeting URL, feedback."],
        ["Offer", "offers", "PK: id | FK: application_id", "OneToOne -> Application", "Formal compensation offer holding annual salary, joining date, terms, and acceptance status."],
        ["SavedJob", "saved_jobs", "PK: id | FK: user_id, job_id", "ManyToOne -> User, ManyToOne -> Job", "Candidate bookmark holding user and vacancy references with savedAt timestamp."],
        ["AuditLog", "audit_logs", "PK: id | FK: None", "None (Decoupled append-only)", "Immutable governance record tracking action, performedBy, client IP, and timestamp."]
    ]
    add_table(doc, entity_headers, entity_data, [Inches(1.1), Inches(1.1), Inches(1.6), Inches(1.6), Inches(1.8)])

    # ==========================================
    # 14. COMPLETE REST API DIRECTORY
    # ==========================================
    add_heading_1(doc, "14. Complete REST API Reference")
    add_p(doc, "The Spring Boot backend exposes a comprehensive RESTful API surface. All protected routes require a valid JWT Bearer token:")

    api_headers = ["HTTP Verb", "API Endpoint", "Security Role", "Request Payload / Parameters", "Success Response Code & Body"]
    api_data = [
        ["POST", "/api/auth/register", "Public", "{ username, email, password, role }", "201 Created: { token, user, message }"],
        ["POST", "/api/auth/login", "Public", "{ username, password }", "200 OK: { token, type: 'Bearer', user }"],
        ["GET", "/api/jobs", "Public", "?search=java&location=Remote&type=FULL_TIME", "200 OK: List<JobDto> with company and skills"],
        ["GET", "/api/jobs/{id}", "Public", "Path: jobId", "200 OK: JobDetailDto with full description"],
        ["GET", "/api/jobs/{id}/match", "Candidate", "Path: jobId", "200 OK: { matchScore: 92, matchingSkills: [...], missingSkills: [...] }"],
        ["POST", "/api/jobs/{id}/apply", "Candidate", "Path: jobId, { coverLetter }", "201 Created: ApplicationDto (status: APPLIED)"],
        ["GET", "/api/applications/my-applications", "Candidate", "None", "200 OK: List<ApplicationDto> with interview details"],
        ["POST", "/api/applications/{id}/withdraw", "Candidate", "Path: applicationId", "200 OK: { message: 'Application withdrawn' }"],
        ["PUT", "/api/offers/{id}/respond", "Candidate", "Path: offerId, { status: 'ACCEPTED' }", "200 OK: Updated OfferDto (status: ACCEPTED)"],
        ["GET", "/api/saved-jobs", "Candidate", "None", "200 OK: List<JobDto> of bookmarked opportunities"],
        ["POST", "/api/saved-jobs/{id}", "Candidate", "Path: jobId", "201 Created: { message: 'Job bookmarked' }"],
        ["DELETE", "/api/saved-jobs/{id}", "Candidate", "Path: jobId", "200 OK: { message: 'Bookmark removed' }"],
        ["GET", "/api/profiles/me", "Candidate", "None", "200 OK: CandidateProfileDto with skills list"],
        ["PUT", "/api/profiles/me", "Candidate", "CandidateProfileDto { headline, skills, years }", "200 OK: Updated CandidateProfileDto"],
        ["GET", "/api/recruiter/my-jobs", "Recruiter", "None", "200 OK: List<RecruiterJobDto> with applicant counts"],
        ["POST", "/api/recruiter/jobs", "Recruiter", "JobCreateDto { title, description, skills, salary }", "201 Created: Created Job record"],
        ["GET", "/api/recruiter/jobs/{id}/applicants", "Recruiter", "Path: jobId, ?stage=SHORTLISTED", "200 OK: List<ApplicantDto> with match scores"],
        ["PUT", "/api/recruiter/applications/{id}/status", "Recruiter", "{ status: 'SHORTLISTED' }", "200 OK: Updated ApplicationDto"],
        ["GET", "/api/recruiter/jobs/{id}/export-applicants", "Recruiter", "Path: jobId", "200 OK: text/csv file stream"],
        ["POST", "/api/interviews/schedule", "Recruiter", "InterviewScheduleDto { appId, date, url, round }", "201 Created: InterviewDto"],
        ["POST", "/api/offers", "Recruiter", "OfferRequestDto { appId, salary, joiningDate }", "201 Created: OfferDto"],
        ["GET", "/api/admin/stats", "Admin", "None", "200 OK: { totalUsers, totalJobs, totalApplications, totalOffers }"],
        ["GET", "/api/admin/users", "Admin", "?page=0&size=20", "200 OK: Page<UserDto> with active/suspended state"],
        ["PUT", "/api/admin/users/{id}/toggle-status", "Admin", "Path: userId", "200 OK: { id, enabled: false/true }"],
        ["GET", "/api/admin/logs", "Admin", "?page=0&size=50", "200 OK: Page<AuditLogDto> chronologically ordered"]
    ]
    add_table(doc, api_headers, api_data, [Inches(0.8), Inches(2.2), Inches(1.0), Inches(1.5), Inches(1.7)])

    # ==========================================
    # 15. AUTHENTICATION ENGINEERING
    # ==========================================
    add_heading_1(doc, "15. Authentication Engineering (Stateless JWT)")
    add_p(doc,
        "Authentication is engineered to eliminate server session affinity completely. "
        "The system issues cryptographically signed JSON Web Tokens (JWT) using HMAC-SHA256 with a 256-bit secret key."
    )
    add_heading_2(doc, "15.1 Token Lifecycle & Structure")
    add_bullet(doc, "Header: Specifies the signing algorithm ('alg': 'HS256') and token type ('typ': 'JWT').")
    add_bullet(doc, "Payload: Encodes the subject ('sub': username), issuer ('iss': 'GlobalCo'), issuance time ('iat'), expiration time ('exp': 24 hours), and private claims ('roles': ['ROLE_CANDIDATE'], 'userId': 101).")
    add_bullet(doc, "Signature: Base64UrlEncode(HMACSHA256(header + '.' + payload, secretKey)). Any modification to payload invalidates the signature immediately.")
    add_bullet(doc, "Password Security: User passwords are encrypted using BCryptPasswordEncoder with cost factor 10, incorporating random per-user salts to thwart rainbow table attacks.")

    # ==========================================
    # 16. AUTHORIZATION & SECURITY FILTER CHAIN
    # ==========================================
    add_heading_1(doc, "16. Authorization & Security Filter Chain")
    add_p(doc,
        "Spring Security 6 enforces authorization through a customized SecurityFilterChain bean configured in SecurityConfig.java:"
    )
    add_bullet(doc, "Stateless Session Management: Configured strictly to SessionCreationPolicy.STATELESS, preventing Spring from creating an HttpSession.")
    add_bullet(doc, "CSRF Protection: CSRF is disabled because authentication relies exclusively on client-managed Bearer tokens rather than ambient browser cookies, neutralizing CSRF vectors.")
    add_bullet(doc, "Custom JWT Filter: JwtAuthenticationFilter extends OncePerRequestFilter, ensuring exactly one token extraction and verification pass per HTTP request.")
    add_bullet(doc, "Role Route Mapping: /api/admin/** requires hasRole('ADMIN'), /api/recruiter/** requires hasRole('RECRUITER'), /api/candidate/** requires hasRole('CANDIDATE'), and /api/auth/** and /api/jobs/** are publicly accessible.")

    # ==========================================
    # 17. FEATURE-BY-FEATURE DEEP DIVE (6-PART FORMAT)
    # ==========================================
    add_heading_1(doc, "17. Feature-by-Feature Deep Dive")
    add_p(doc, "Every major functional capability is reverse-engineered following the rigorous 6-part pedagogical pattern:")

    # Feature 1: Candidate Match Engine
    add_heading_2(doc, "17.1 Feature: Intelligent Multi-Factor Match Engine")
    add_p(doc, "A capability that automatically scores how well a candidate fits a job opening before they apply.", bold_prefix="1. Simple Explanation: ")
    add_p(doc, "A deterministic scoring algorithm combining Skill Overlap (50% weight), Experience Tier Alignment (25% weight), and Location/Work Mode Fit (25% weight) into an aggregate 0-100% score.", bold_prefix="2. Technical Explanation: ")
    add_p(doc, "Implemented in CandidateProfileService.java and exposed via GET /api/jobs/{id}/match. Fetches CandidateProfile skills and Job requiredSkills, performs set intersection, and returns MatchScoreBreakdownDto.", bold_prefix="3. Project Implementation: ")
    add_p(doc, "Job requires ['Java', 'Spring Boot', 'AWS', 'Docker']. Candidate has ['Java', 'Spring Boot', 'React']. Skill overlap is 2/4 (50%). Combined with full location match (Bengaluru), aggregate match score is 92%.", bold_prefix="4. Practical Example: ")
    add_p(doc, "Client GET /api/jobs/1/match -> Controller extracts Principal -> CandidateProfileService fetches entities -> Computes score breakdown -> Returns JSON -> UI renders badge and progress bar.", bold_prefix="5. Execution Flow: ")
    add_p(doc, "'In GlobalCo, our match engine uses a multi-factor scoring formula that objectively rates skill intersection, experience tier, and work mode. This provides instant clarity to job seekers and prioritizes high-match talent for recruiters.'", bold_prefix="6. Interview-Ready Answer: ")

    # Feature 2: 1-Click Apply
    add_heading_2(doc, "17.2 Feature: 1-Click Job Application Submission")
    add_p(doc, "Allows job seekers to apply to any active job instantly without repeatedly re-entering information.", bold_prefix="1. Simple Explanation: ")
    add_p(doc, "A transactional state transition that enforces duplicate prevention via both service-layer checks and a database UNIQUE constraint on (job_id, candidate_id), creating an Application record in APPLIED status.", bold_prefix="2. Technical Explanation: ")
    add_p(doc, "Handled in ApplicationService.java:applyForJob(). Persists the Application entity and triggers NotificationService to dispatch a confirmation alert.", bold_prefix="3. Project Implementation: ")
    add_p(doc, "Candidate clicks 'Apply Now'. Application #104 is created with status APPLIED. The UI instantly disables the button and updates status to 'Applied'.", bold_prefix="4. Practical Example: ")
    add_p(doc, "React Button Click -> POST /api/jobs/1/apply -> JWT validated -> Duplicate check -> Application saved -> Notification created -> UI displays Toast notification.", bold_prefix="5. Execution Flow: ")
    add_p(doc, "'The application workflow is completely transactional and idempotent. It prevents duplicate applications at both the application and database layers and asynchronously fires confirmation notifications.'", bold_prefix="6. Interview-Ready Answer: ")

    # Feature 3: Recruiter ATS Pipeline
    add_heading_2(doc, "17.3 Feature: Recruiter ATS Applicant Tracking Pipeline")
    add_p(doc, "A workflow command center where recruiters review applicants, evaluate match scores, and move candidates through hiring stages.", bold_prefix="1. Simple Explanation: ")
    add_p(doc, "Finite State Machine governing Application.status across 7 discrete stages: APPLIED -> SCREENING -> SHORTLISTED -> INTERVIEW_SCHEDULED -> SELECTED -> OFFER_SENT -> OFFER_ACCEPTED / REJECTED.", bold_prefix="2. Technical Explanation: ")
    add_p(doc, "Exposed via PUT /api/recruiter/applications/{id}/status. Updates the database record and records an entry in the audit_logs table.", bold_prefix="3. Project Implementation: ")
    add_p(doc, "Recruiter moves candidate Samir React from SCREENING to SHORTLISTED. Samir's card transitions to the Shortlisted column and Samir receives a notification.", bold_prefix="4. Practical Example: ")
    add_p(doc, "Recruiter Action -> PUT /api/recruiter/applications/5/status -> ApplicationService validates recruiter ownership -> Updates DB -> Fires Notification -> Returns 200 OK.", bold_prefix="5. Execution Flow: ")
    add_p(doc, "'We implemented a structured ATS pipeline governed by discrete status enums. Recruiters can triage talent, advance stages, and track conversion rates across requisitions in real time.'", bold_prefix="6. Interview-Ready Answer: ")

    # Feature 4: Interview Dispatch
    add_heading_2(doc, "17.4 Feature: Technical Interview Scheduling & Google Meet Dispatch")
    add_p(doc, "Allows recruiters to schedule interview rounds with date, time, round title, and video meeting links.", bold_prefix="1. Simple Explanation: ")
    add_p(doc, "Creates an Interview entity linked to the Application, sets Application status to INTERVIEW_SCHEDULED, and dispatches a high-priority notification to the candidate with the Google Meet URL.", bold_prefix="2. Technical Explanation: ")
    add_p(doc, "Exposed via POST /api/interviews/schedule. Handled by InterviewService.java with transaction boundary.", bold_prefix="3. Project Implementation: ")
    add_p(doc, "Recruiter schedules 'System Architecture Round 1' for tomorrow at 10:30 AM with meeting URL 'https://meet.google.com/abc-defg-hij'. Candidate sees a blue 'Join Google Meet' button in their Application Tracker.", bold_prefix="4. Practical Example: ")
    add_p(doc, "Schedule Modal Submit -> POST /api/interviews/schedule -> InterviewService saves Interview -> Updates Application status -> Notification record created -> Candidate UI updates.", bold_prefix="5. Execution Flow: ")
    add_p(doc, "'Interview scheduling integrates directly into the applicant tracking pipeline. Once scheduled, the candidate receives an immediate status transition and a direct one-click video conference link.'", bold_prefix="6. Interview-Ready Answer: ")

    # Feature 5: Formal Offer Engine
    add_heading_2(doc, "17.5 Feature: Formal Binding Offer Generation & Acceptance")
    add_p(doc, "Enables recruiters to issue compensation offers and allows candidates to accept or decline them directly within the portal.", bold_prefix="1. Simple Explanation: ")
    add_p(doc, "Creates an Offer entity associated 1:1 with the Application, transition status to OFFER_SENT, and provides an idempotent response endpoint PUT /api/offers/{id}/respond for candidate decision.", bold_prefix="2. Technical Explanation: ")
    add_p(doc, "Handled by OfferService.java. When candidate accepts, Application status moves to OFFER_ACCEPTED (HIRED) and requisition filled counts increment.", bold_prefix="3. Project Implementation: ")
    add_p(doc, "Recruiter issues an offer of ₹24 LPA with joining date October 1, 2026. Candidate opens dashboard, reviews terms, and clicks 'Accept Offer'. Status updates to HIRED.", bold_prefix="4. Practical Example: ")
    add_p(doc, "Recruiter POST /api/offers -> Offer saved (PENDING) -> Candidate PUT /api/offers/1/respond { status: 'ACCEPTED' } -> Application status updated -> Recruiter notified.", bold_prefix="5. Execution Flow: ")
    add_p(doc, "'The offer engine provides end-to-end closure to the recruitment cycle, allowing binding offers to be extended, tracked, and accepted digitally with complete audit transparency.'", bold_prefix="6. Interview-Ready Answer: ")

    # ==========================================
    # 18. END-TO-END SYSTEM WORKFLOWS
    # ==========================================
    add_heading_1(doc, "18. End-to-End System Workflows")
    add_p(doc, "Below is the complete architectural trace of the end-to-end recruitment lifecycle across the full stack:")
    
    workflow_steps = [
        ("Phase 1: Registration & Profile Setup", "Candidate signs up via /register. Spring Security hashes password with BCrypt (cost 10). Candidate navigates to /profile and saves 6 technical skills (Java, Spring Boot, React, SQL, etc.). Stored in profile_skills table."),
        ("Phase 2: Requisition Publication", "Recruiter logs in to /recruiter/dashboard, opens Post Job modal, specifies 'Senior Backend Engineer' with ₹18-28 LPA, Hybrid in Bengaluru, and required skills ['Java', 'Spring Boot', 'AWS']. Stored in jobs table."),
        ("Phase 3: Discovery & Match Calculation", "Candidate searches /jobs. Client calls GET /api/jobs/1/match. Backend computes 92% match score breakdown. Candidate reviews skills and clicks 'Apply Now'."),
        ("Phase 4: Application Processing", "Backend validates no duplicate exists, creates Application record in APPLIED status, and dispatches confirmation alert."),
        ("Phase 5: Recruiter Triage & Shortlisting", "Recruiter opens ATS pipeline at /recruiter/jobs/1/applicants, reviews candidate match breakdown, and updates stage to SHORTLISTED via PUT /api/recruiter/applications/1/status."),
        ("Phase 6: Technical Interview Dispatch", "Recruiter clicks 'Schedule Interview', inputs 'Technical Round 1' with Google Meet link. Application transitions to INTERVIEW_SCHEDULED and candidate sees meeting pill."),
        ("Phase 7: Offer Extension & Acceptance", "Recruiter issues offer via POST /api/offers with ₹22 LPA. Candidate reviews offer in /candidate/dashboard, clicks 'Accept Offer', transitioning application to OFFER_ACCEPTED.")
    ]
    
    wf_headers = ["Hiring Phase", "Full-Stack Technical Trace (Client -> Network -> Service -> DB)"]
    wf_data = [[s[0], s[1]] for s in workflow_steps]
    add_table(doc, wf_headers, wf_data, [Inches(2.2), Inches(4.5)])
