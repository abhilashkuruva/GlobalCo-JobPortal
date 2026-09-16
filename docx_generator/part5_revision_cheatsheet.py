from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa, add_screenshot
)
from docx.shared import Inches, Pt

def generate_part_5(doc):
    # ==========================================
    # 35. BEGINNER LEARNING PATH (LEVELS 1 TO 12)
    # ==========================================
    add_heading_1(doc, "35. Beginner-to-Expert Learning Path (Levels 1 to 12)")
    add_p(doc,
        "If you are reviewing this project with zero prior knowledge, follow this structured 12-level progression. "
        "Each level defines what to learn, which files to inspect, and self-check questions to validate your understanding:"
    )
    
    levels = [
        ("Level 1: Problem Space", "README.md, doc_assets/", "Understand why recruitment portals exist: connecting Enterprise Employers, Jobs, Candidates, and Applications.", "Can you explain the 'application black hole' and how GlobalCo solves it?"),
        ("Level 2: Target Users & Roles", "SecurityConfig.java, users table", "Learn the 3 distinct roles: Candidates (seekers), Recruiters (talent acquisition), and Admins (governance).", "What are the exact GrantedAuthority strings used in Spring Security?"),
        ("Level 3: Core Features", "JobCard.jsx, ApplicantTrackingPage.jsx", "Understand the primary workflows: Job Search, Skill Match Scoring, 1-Click Apply, ATS Pipeline, and Offers.", "What are the 7 stages of the recruitment ATS pipeline?"),
        ("Level 4: Architecture Overview", "pom.xml, package.json, vite.config.js", "Understand the 3-Tier Layered Architecture: React SPA -> Spring Boot REST API -> H2 Relational Database.", "Why is a decoupled client-server architecture superior to server-rendered JSP/Thymeleaf?"),
        ("Level 5: Frontend Layout", "AppRoutes.jsx, AuthContext.jsx, api.js", "Inspect React Router navigation, global authentication context, and Axios request/response interceptors.", "How does the Axios request interceptor attach the Bearer token?"),
        ("Level 6: Backend Layers", "controller/, service/, repository/, entity/", "Inspect Spring Boot tiering: Controllers (@RestController), Services (@Service), and Repositories (@Repository).", "Why are database queries never executed inside controllers?"),
        ("Level 7: Relational Schema", "schema.sql, JPA Entities", "Understand how tables link: Users (1:1) CandidateProfiles (M:N) Skills; Jobs (1:M) Applications (1:M) Interviews.", "How does the composite UNIQUE constraint prevent duplicate job applications?"),
        ("Level 8: REST APIs", "JobController.java, ApplicationController.java", "Review the endpoints: /api/auth/login, /api/jobs, /api/jobs/{id}/apply, /api/recruiter/my-jobs, etc.", "What HTTP status codes are returned on successful creation vs resource not found?"),
        ("Level 9: Security & JWT", "JwtUtil.java, JwtAuthenticationFilter.java", "Trace how JWT tokens are generated on login (JwtUtil), sent via Authorization header, and parsed in the filter.", "What algorithm signs the JWT, and where is the secret key stored?"),
        ("Level 10: Critical Code", "ApplicationService.java, CandidateProfileService.java", "Review the exact Java business logic for match score calculation and atomic application submission.", "Why is @Transactional required on ApplicationService.applyForJob()?"),
        ("Level 11: Runtime Behavior", "Console logs, doc_assets/ screenshots", "Understand how to run both servers: 'mvn spring-boot:run' on port 8080 and 'npm run dev' on port 5173.", "What ports and URLs are used for Swagger UI and H2 Console?"),
        ("Level 12: Interview Mastery", "Part 4 Q&A, 30-sec pitch, 2-min walkthrough", "Practice the 30-second pitch, 2-minute architectural walkthrough, and difficult edge case defenses.", "How would you defend using a Modular Monolith over Microservices?")
    ]
    
    lvl_headers = ["Level", "Key Files to Inspect", "Core Engineering Concept", "Self-Check Validation Question"]
    lvl_data = [[lvl[0], lvl[1], lvl[2], lvl[3]] for lvl in levels]
    add_table(doc, lvl_headers, lvl_data, [Inches(1.2), Inches(1.5), Inches(2.3), Inches(1.7)])

    # ==========================================
    # 36. TECHNICAL GLOSSARY (A TO Z)
    # ==========================================
    add_heading_1(doc, "36. Master Project Technical Glossary")
    
    glossary = [
        ("JWT (JSON Web Token)", "A compact, URL-safe means of representing claims to be transferred between two parties. In GlobalCo, tokens are digitally signed using HMAC-SHA256."),
        ("RBAC (Role-Based Access Control)", "A security approach restricting system access based on roles assigned to authorized users (ROLE_CANDIDATE, ROLE_RECRUITER, ROLE_ADMIN)."),
        ("Spring Boot 3", "An opinionated Java framework simplifying microservice and enterprise web app development through auto-configuration and embedded Tomcat."),
        ("Spring Security 6", "A powerful authentication and access-control framework utilizing component-based SecurityFilterChain beans."),
        ("Spring Data JPA", "An abstraction over Hibernate ORM reducing boilerplate data access code through automated repository interfaces."),
        ("Hibernate 6", "An Object-Relational Mapping (ORM) framework that maps Java domain entities to SQL tables and manages persistence lifecycles."),
        ("H2 Database", "A fast, lightweight, Java-based in-memory relational database ideal for rapid local prototyping and automated testing."),
        ("Vite 7", "A next-generation frontend build tool leveraging native ES modules for instantaneous server starts and lightning-fast HMR."),
        ("Tailwind CSS", "A utility-first CSS framework providing low-level styling classes directly in HTML/JSX for responsive, custom design systems."),
        ("Axios Interceptor", "Middleware functions intercepting outgoing HTTP requests (to attach Bearer tokens) or incoming responses (to handle 401 errors)."),
        ("BCrypt", "An adaptive cryptographic password-hashing algorithm incorporating per-user salts to thwart rainbow table attacks."),
        ("@Transactional", "A Spring annotation declaring that a method executes within a database transaction boundary, rolling back on RuntimeException."),
        ("N+1 Query Problem", "A performance anti-pattern where Hibernate executes 1 query to fetch parents and N queries to fetch lazy children. Solved using JOIN FETCH."),
        ("DTO (Data Transfer Object)", "An object carrying data between processes, preventing Mass Assignment vulnerabilities and circular JSON serialization.")
    ]
    
    g_headers = ["Technical Term", "Definitive Engineering Explanation"]
    g_data = [[g[0], g[1]] for g in glossary]
    add_table(doc, g_headers, g_data, [Inches(2.0), Inches(4.7)])

    # ==========================================
    # 37. PROJECT KNOWLEDGE TRACEABILITY MAP
    # ==========================================
    add_heading_1(doc, "37. End-to-End Traceability Matrix")
    add_p(doc, "This matrix maps every functional capability directly to its corresponding frontend page, REST API endpoint, backend controller, service, repository, and database table:")
    
    trace_headers = ["Feature", "Frontend Component", "API Endpoint", "Controller / Service", "Database Table"]
    trace_data = [
        ["Authentication", "LoginPage.jsx", "POST /api/auth/login", "AuthController -> AuthService", "users, roles"],
        ["Candidate Profile", "ProfilePage.jsx", "GET/PUT /api/profiles/me", "CandidateProfileController -> ProfileService", "candidate_profiles, skills"],
        ["Job Catalog", "JobSearchPage.jsx", "GET /api/jobs", "JobController -> JobService", "jobs, companies, categories"],
        ["Skill Match Score", "JobCard.jsx", "GET /api/jobs/{id}/match", "JobController -> CandidateProfileService", "profile_skills, job_skills"],
        ["Job Application", "JobDetailsPage.jsx", "POST /api/jobs/{id}/apply", "ApplicationController -> ApplicationService", "applications, notifications"],
        ["Recruiter Pipeline", "ApplicantTrackingPage.jsx", "PUT /api/recruiter/applications/{id}/status", "RecruiterController -> ApplicationService", "applications, audit_logs"],
        ["Interview Dispatch", "ScheduleInterviewModal.jsx", "POST /api/interviews/schedule", "InterviewController -> InterviewService", "interviews, notifications"],
        ["Offer Management", "ApplicantTrackingPage.jsx", "POST /api/offers", "OfferController -> OfferService", "offers, notifications"],
        ["Admin Governance", "AdminDashboardPage.jsx", "PUT /api/admin/users/{id}/toggle-status", "AdminController -> UserService", "users, audit_logs"]
    ]
    add_table(doc, trace_headers, trace_data, [Inches(1.2), Inches(1.3), Inches(1.6), Inches(1.5), Inches(1.1)])

    # ==========================================
    # 38. MASTER CHEAT SHEET
    # ==========================================
    add_heading_1(doc, "38. Master Project Cheat Sheet")
    
    add_p(doc, "Default Seed Credentials (Password for all accounts: Password@123):", bold_prefix="Authentication Matrix: ")
    add_bullet(doc, "Candidate (Backend): riya.backend / riya.sharma@example.com (ROLE_CANDIDATE)")
    add_bullet(doc, "Candidate (Frontend): samir.react / samir.patel@example.com (ROLE_CANDIDATE)")
    add_bullet(doc, "Recruiter (Talent Lead): mira.recruiter / mira.recruiter@globalco.internal (ROLE_RECRUITER)")
    add_bullet(doc, "Recruiter (Tech): devon.tech / devon.recruiter@globalco.internal (ROLE_RECRUITER)")
    add_bullet(doc, "Platform Administrator: admin / admin@globalco.internal (ROLE_ADMIN)")

    add_p(doc, "Key Local URLs & Ports:", bold_prefix="Network Architecture: ")
    add_bullet(doc, "Frontend Application: http://localhost:5173")
    add_bullet(doc, "Backend REST API Base: http://localhost:8080/api")
    add_bullet(doc, "Swagger / OpenAPI UI: http://localhost:8080/swagger-ui/index.html")
    add_bullet(doc, "H2 Database Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:jobboard_db, User: sa, Password: password)")

    # ==========================================
    # 39. ONE-DAY BEFORE INTERVIEW REVISION GUIDE
    # ==========================================
    add_heading_1(doc, "39. One-Day Before Interview Revision Guide")
    add_p(doc,
        "Use this high-yield, time-budgeted study guide to review the system based on available preparation time:"
    )
    
    add_heading_2(doc, "39.1 Tiered Preparation Framework")
    add_bullet(doc, "Must Know: The 3-tier architecture, stateless JWT auth flow, Jaccard/overlap skill match formula, and 1-click apply duplicate prevention.")
    add_bullet(doc, "Should Know: The 7-stage ATS pipeline state machine, @Transactional atomicity, JOIN FETCH to solve N+1 queries, and GlobalExceptionHandler envelopes.")
    add_bullet(doc, "Good to Know: Scalability roadmap (Redis caching, Kafka event streaming, AWS RDS Aurora migration) and OWASP Top 10 security defenses.")

    add_heading_2(doc, "39.2 Time-Budgeted Revision Schedules")
    schedules = [
        ("30-Minute Lightning Review", "1. Memorize 30-sec pitch and 2-min walkthrough (Section 31).\n2. Review Core Traceability Matrix (Section 37).\n3. Review Top 5 Flashcards (Section 39.3)."),
        ("1-Hour Deep Review", "1. Complete 30-minute review items above.\n2. Review Database ERD and Entity Dictionary (Sections 12 & 13).\n3. Review Top 15 Technical Q&A Bank (Section 32)."),
        ("3-Hour Master Review", "1. Complete 1-hour review items above.\n2. Inspect code snippets in Section 20 (JwtAuthenticationFilter and ApplicationService).\n3. Walk through all 14 screens in the UI Deep Dive.\n4. Study difficult follow-up edge cases and senior defense strategies (Sections 33 & 35)."),
        ("Full-Day (8-Hour) Total Mastery", "1. Execute both backend and frontend locally; verify test suite passing.\n2. Follow the 12-Level Beginner-to-Expert Learning Path step-by-step.\n3. Practice speaking all interview answers aloud until completely natural.")
    ]
    sch_headers = ["Time Available", "High-Yield Study Action Plan"]
    sch_data = [[s[0], s[1]] for s in schedules]
    add_table(doc, sch_headers, sch_data, [Inches(2.0), Inches(4.7)])

    add_heading_2(doc, "39.3 Top 10 Critical Flashcard Questions")
    flashcards = [
        ("1. What happens when a user logs in?", "POST /api/auth/login validates BCrypt password hash. If valid, JwtUtil creates token signed with HMAC-SHA256 containing username and role. Client stores it in localStorage."),
        ("2. How is authorization handled on API routes?", "Spring SecurityFilterChain defines antMatchers. Requests pass through JwtAuthenticationFilter which sets SecurityContextHolder. Methods/routes enforce hasRole('RECRUITER') etc."),
        ("3. Why use DTOs instead of exposing JPA Entities directly?", "DTOs prevent Mass Assignment vulnerabilities, avoid infinite circular JSON recursion caused by bidirectional JPA relationships, and allow decoupling API contracts from database schemas."),
        ("4. How does the frontend attach the JWT token?", "Axios request interceptor in services/api.js intercepts outgoing requests, reads 'token' from localStorage, and appends 'Authorization: Bearer <token>' header."),
        ("5. What happens when a token expires?", "Axios response interceptor catches 401 Unauthorized, purges localStorage, updates AuthContext state to null, and redirects user to /login."),
        ("6. How are duplicate job applications prevented?", "ApplicationService checks existsByJobAndCandidate() before insertion, and the database enforces a UNIQUE constraint on (job_id, candidate_id)."),
        ("7. Why did you use H2 database?", "Zero-configuration in-memory persistence with fast startup for development and testing. Production uses PostgreSQL with identical JPA entity mappings."),
        ("8. How does recruiter status update notify the candidate?", "ApplicationService.updateStatus() updates Application.status and synchronously creates a Notification record mapped to the candidate User."),
        ("9. How do you handle exceptions globally in Spring Boot?", "GlobalExceptionHandler class annotated with @RestControllerAdvice uses @ExceptionHandler methods to return standardized ApiError JSON payloads."),
        ("10. How would you scale this system to 1 million users?", "Introduce Redis caching for job listings, add Read Replicas for the database, use Kafka for async application processing, and containerize backend pods in Kubernetes.")
    ]
    
    fc_headers = ["High-Yield Interview Question", "Immediate Flawless Technical Answer"]
    fc_data = [[fc[0], fc[1]] for fc in flashcards]
    add_table(doc, fc_headers, fc_data, [Inches(2.5), Inches(4.2)])
