from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa, add_screenshot
)
from docx.shared import Inches, Pt

def generate_part_1(doc):
    # ==========================================
    # 1. EXECUTIVE SUMMARY
    # ==========================================
    add_heading_1(doc, "1. Executive Summary")
    add_p(doc, 
        "The GlobalCo Job Portal is an enterprise-grade, cloud-ready recruitment and applicant tracking system (ATS) "
        "engineered to eliminate friction between high-growth enterprises and skilled technical candidates. Built upon a decoupled "
        "modern full-stack architecture comprising Java 21 LTS with Spring Boot 3.2.3 on the backend and React 18 with Vite 7 and "
        "Tailwind CSS on the frontend, the platform orchestrates the complete talent lifecycle across three distinct security roles: "
        "Candidates (Job Seekers), Recruiters (Talent Acquisition Teams), and Platform Administrators."
    )
    add_p(doc,
        "Unlike rudimentary CRUD applications, GlobalCo implements production-level software engineering patterns including "
        "stateless JSON Web Token (JWT) authentication with cryptographic HMAC-SHA256 signatures, comprehensive Spring Security 6 "
        "Filter Chains, an algorithmic multi-factor Candidate-Job Match Engine (evaluating technical skills, experience tier, and location), "
        "a full-lifecycle recruitment ATS pipeline (Applied -> Screening -> Shortlisted -> Interview Scheduled -> Selected -> Offer Sent -> Hired / Rejected), "
        "Google Meet interview scheduling integration, dynamic CSV applicant roster exports, and non-repudiable audit logging for administrative governance."
    )
    add_callout(doc,
        "System Status Badges & Integrity Guarantees:\n"
        "• 🟢 CONFIRMED FROM CODE: Validated directly against Java classes, JPA entities, and React components.\n"
        "• 🟡 OBSERVED DURING RUNTIME: Verified through active live execution on ports 8080 and 5173.\n"
        "• 🔵 INFERRED FROM IMPLEMENTATION: Logical architectural extrapolations from software patterns.\n"
        "• 🔴 POTENTIAL ISSUE: Real bugs or edge cases identified during system audits.\n"
        "• 🟣 RECOMMENDED IMPROVEMENT: Senior architectural roadmaps for 1M+ user scale.",
        title="DOCUMENT INTEGRITY & NOMENCLATURE", box_type="info"
    )

    # ==========================================
    # 2. PROJECT OVERVIEW & BEGINNER EXPLANATION
    # ==========================================
    add_heading_1(doc, "2. Project Overview & 'Explain Like I'm a Beginner'")
    add_heading_2(doc, "2.1 The Real-World Airport Analogy")
    add_p(doc,
        "Imagine GlobalCo as a modern International Airport Terminal for Careers. "
        "Just as an airport organizes thousands of passengers, airlines, flights, and security gates without chaos:",
        bold_prefix="Real-World Analogy: "
    )
    add_bullet(doc, "The Airlines are the Enterprise Employers (Google, Microsoft, Amazon, Meta, Netflix) who publish scheduled flights (Job Openings) with specific baggage and passport requirements (Required Technical Skills & Experience).")
    add_bullet(doc, "The Passengers are the Job Seekers / Candidates who create digital boarding passes (Profiles & Resumes), check flight schedules (Job Search Catalog), and receive instant compatibility scores (Automated Skill Match Engine).")
    add_bullet(doc, "The Gate Agents are the Corporate Recruiters who manage the passenger queue (Applicant Tracking Pipeline), verify boarding credentials (Screening & Shortlisting), conduct gate checks (Technical Interviews), and issue boarding clearance (Binding Job Offers).")
    add_bullet(doc, "The Airport Air Traffic Control is the Platform Administrator who monitors all active runways (Platform KPIs), verifies credentials, suspends bad actors (User Moderation), and logs every flight event (System Audit Stream).")

    add_heading_2(doc, "2.2 Conceptual Translation: From Real World to Code")
    add_p(doc, "Here is how real-world recruitment actions translate into full-stack software components:", bold_prefix="System Translation: ")
    
    trans_headers = ["Real-World Concept", "Frontend Representation (React)", "Network Protocol / API", "Backend Service (Spring Boot)", "Database Persistence (SQL)"]
    trans_data = [
        ["Job Posting", "JobCard.jsx / JobDetailsPage.jsx", "GET /api/jobs/{id}", "JobController -> JobService", "jobs, companies, categories"],
        ["Candidate Profile", "ProfilePage.jsx (Skills / Bio)", "PUT /api/profiles/me", "CandidateProfileService", "candidate_profiles, skills"],
        ["Compatibility Check", "MatchScoreBreakdown Modal", "GET /api/jobs/{id}/match", "CandidateProfileService.match()", "profile_skills, job_skills"],
        ["Applying for a Job", "1-Click Apply Button", "POST /api/jobs/{id}/apply", "ApplicationService.apply()", "applications (UNIQUE key)"],
        ["Interview Scheduling", "ScheduleInterviewModal.jsx", "POST /api/interviews/schedule", "InterviewService.schedule()", "interviews, notifications"],
        ["Issuing an Offer", "OfferGenerationModal.jsx", "POST /api/offers", "OfferService.createOffer()", "offers, applications"]
    ]
    add_table(doc, trans_headers, trans_data, [Inches(1.2), Inches(1.5), Inches(1.5), Inches(1.3), Inches(1.2)])

    # ==========================================
    # 3. REAL-WORLD PROBLEM
    # ==========================================
    add_heading_1(doc, "3. Real-World Problem Statement")
    add_p(doc,
        "Traditional recruitment systems, generic job boards, and legacy corporate applicant tracking systems suffer from "
        "four severe operational and architectural breakdowns:",
        bold_prefix="Industry Problem Statement: "
    )
    add_bullet(doc, "The 'Application Black Hole': Job applicants submit resumes into traditional portals and receive zero feedback. They cannot see what stage their resume is in, whether an interviewer has reviewed it, or why they were rejected. GlobalCo provides real-time 6-stage pipeline tracking.")
    add_bullet(doc, "Unqualified Applicant Overwhelm: Recruiters receive hundreds of spam applications with zero relevance to the requisition. GlobalCo's Algorithmic Match Engine calculates multi-factor compatibility scores (skills 50%, experience 25%, location 25%), allowing recruiters to rank applicants objectively.")
    add_bullet(doc, "Fragmented Tooling & Manual Scheduling: Hiring teams waste hours coordinating calendars, generating meeting links across Google Meet / Microsoft Teams, and emailing offer letters manually. GlobalCo unifies requisition posting, applicant scoring, interview dispatch with meeting links, and formal offer acceptance into one unified cockpit.")
    add_bullet(doc, "State Fragility & Monolithic Session Locking: Legacy enterprise recruitment software relies on stateful HTTP session cookies (JSESSIONID) stored in server RAM, preventing horizontal auto-scaling across cloud clusters. GlobalCo uses completely stateless JWT Bearer tokens.")

    # ==========================================
    # 4. ARCHITECTURAL SOLUTION
    # ==========================================
    add_heading_1(doc, "4. Architectural Solution")
    add_p(doc,
        "GlobalCo delivers a high-cohesion, low-coupling solution that bridges modern frontend usability with robust enterprise backend reliability:",
        bold_prefix="Core Architectural Solution: "
    )
    add_bullet(doc, "Decoupled 3-Tier Layered Architecture: Clean separation of presentation (React 18 SPA), business logic (Spring Boot 3.2.3 REST APIs), and persistence (Spring Data JPA + H2/MySQL).")
    add_bullet(doc, "Cryptographic Stateless Authentication: Eliminates server-side session affinity via JSON Web Tokens (JJWT 0.12.5) signed with HMAC-SHA256, allowing horizontal scale behind reverse proxies.")
    add_bullet(doc, "Deterministic Multi-Factor Scoring: Computes skill overlap using mathematical set intersections combined with weighted distance and experience metrics, giving immediate transparency.")
    add_bullet(doc, "ACID Transactional Integrity: Strict relational foreign keys and database-level UNIQUE constraints prevent race conditions and duplicate submissions under concurrent traffic.")

    # ==========================================
    # 5. USERS & ROLES (RBAC MATRIX)
    # ==========================================
    add_heading_1(doc, "5. Users & Roles (Role-Based Access Control)")
    add_p(doc,
        "Security and authorization are governed by a strict Role-Based Access Control (RBAC) model. "
        "User records are associated with roles stored in the database and mapped directly to Spring Security's GrantedAuthority objects."
    )
    
    role_headers = ["User Persona", "Spring Security Role", "Default Demo Account", "Allowed Operations & Workflows", "Restricted Operations"]
    role_data = [
        ["Candidate (Job Seeker)", "ROLE_CANDIDATE", "riya.backend / Password@123", "Search jobs, view match score breakdown, 1-click apply, bookmark jobs, manage skills/profile, track applications, accept/decline offers, join Google Meet interviews.", "Cannot post jobs, view other applicants, change pipeline status, or access admin telemetry."],
        ["Recruiter (Talent Team)", "ROLE_RECRUITER", "mira.recruiter / Password@123", "Create and publish job requisitions, view applicant pipelines, move candidate stages (Screening, Shortlist, etc.), schedule interviews with meeting URLs, generate formal offers, export applicants to CSV.", "Cannot view candidate passwords, edit platform users, or delete audit logs."],
        ["Platform Administrator", "ROLE_ADMIN", "admin / Password@123", "View platform KPI metrics, toggle user status (Active vs Suspend), delete improper job postings, inspect system-wide audit logs and security events.", "Cannot alter candidate applications or tamper with historical audit logs."]
    ]
    add_table(doc, role_headers, role_data, [Inches(1.2), Inches(1.2), Inches(1.5), Inches(1.8), Inches(1.0)])

    # ==========================================
    # 6. CORE FEATURES BREAKDOWN
    # ==========================================
    add_heading_1(doc, "6. Core Features Breakdown")
    add_p(doc, "The platform incorporates eight core production-grade feature modules:")
    
    feat_headers = ["Feature Module", "Primary Actor", "Technical Implementation", "Verification Status"]
    feat_data = [
        ["Stateless JWT Authentication", "All Personas", "Spring Security 6, JJWT 0.12.5, BCrypt password hashing", "🟢 CONFIRMED FROM CODE"],
        ["Intelligent Skill Match Engine", "Candidate / Recruiter", "CandidateProfileService, weighted Jaccard/overlap calculation", "🟢 CONFIRMED FROM CODE"],
        ["1-Click Job Application", "Candidate", "POST /api/jobs/{id}/apply with duplicate check", "🟢 CONFIRMED FROM CODE"],
        ["Recruiter ATS Pipeline", "Recruiter", "7-stage state transitions with Kanban stepper", "🟢 CONFIRMED FROM CODE"],
        ["Interview Scheduling & Dispatch", "Recruiter / Candidate", "POST /api/interviews/schedule with Google Meet URL", "🟢 CONFIRMED FROM CODE"],
        ["Binding Offer Engine", "Recruiter / Candidate", "POST /api/offers, PUT /api/offers/{id}/respond", "🟢 CONFIRMED FROM CODE"],
        ["Saved Jobs / Bookmarks", "Candidate", "POST/DELETE /api/saved-jobs/{id} with optimistic UI sync", "🟢 CONFIRMED FROM CODE"],
        ["Admin Governance & Audit Stream", "Admin", "AdminController, AuditLogService, user status toggle", "🟢 CONFIRMED FROM CODE"]
    ]
    add_table(doc, feat_headers, feat_data, [Inches(1.5), Inches(1.1), Inches(2.5), Inches(1.6)])

    # ==========================================
    # 7. COMPLETE PROJECT STRUCTURE
    # ==========================================
    add_heading_1(doc, "7. Complete Project Structure & Directory Rationale")
    add_p(doc, "The repository follows an enterprise Monorepo architecture with clean physical separation between backend and frontend:")

    proj_tree = """GlobalCo-JobBoard/
├── backend/                                   # Java 21 LTS + Spring Boot 3.2.3 Service
│   ├── pom.xml                               # Maven Project Object Model (Dependencies & Plugins)
│   ├── src/main/java/com/jobboard/
│   │   ├── JobBoardApplication.java          # Spring Boot Application Entry Point
│   │   ├── config/
│   │   │   └── DataInitializer.java          # Database Seeder (CommandLineRunner)
│   │   ├── controller/                       # REST API Controllers (@RestController)
│   │   │   ├── AdminController.java          # Admin KPIs, user moderation, audit logs
│   │   │   ├── AnalyticsController.java      # Recruiter metrics & conversion rates
│   │   │   ├── ApplicationController.java    # Job application submission & lifecycle
│   │   │   ├── AuthController.java           # Login, registration, token issuance
│   │   │   ├── CandidateProfileController.java# Profile & technical skills management
│   │   │   ├── CategoryController.java       # Job category taxonomy
│   │   │   ├── CompanyController.java        # Company profiles & verification
│   │   │   ├── InterviewController.java      # Technical interview scheduling & feedback
│   │   │   ├── JobController.java            # Job search, catalog, match breakdown
│   │   │   ├── NotificationController.java   # Real-time candidate notification feed
│   │   │   ├── OfferController.java          # Formal offer generation & candidate response
│   │   │   ├── RecruiterController.java      # Recruiter requisitions & ATS pipeline
│   │   │   ├── ResumeController.java         # Resume upload & parsing simulation
│   │   │   └── SavedJobController.java       # Bookmarking & saved opportunities
│   │   ├── dto/                              # Data Transfer Objects (Payload validation)
│   │   ├── entity/                           # JPA Relational Entities (@Entity, @Table)
│   │   ├── exception/                        # GlobalExceptionHandler (@ControllerAdvice)
│   │   ├── repository/                       # Spring Data JPA Data Access Interfaces
│   │   ├── security/                         # SecurityConfig, JwtUtil, JwtAuthenticationFilter
│   │   └── service/                          # Business Logic Services (@Service, @Transactional)
│   └── src/main/resources/
│       ├── application.properties            # Core H2, JPA, JWT, and server configuration
│       └── application-prod.properties       # Production MySQL & connection pool profile
├── frontend/                                  # React 18 + Vite 7 + Tailwind CSS Client
│   ├── package.json                          # Node dependencies and build scripts
│   ├── vite.config.js                        # Vite bundler configuration & proxy rules
│   ├── tailwind.config.js                    # Red & White design system theme tokens
│   ├── postcss.config.js                     # PostCSS autoprefixer pipeline
│   └── src/
│       ├── main.jsx                          # React DOM Root initialization
│       ├── App.jsx                           # Root component wrapping AuthProvider & Toast
│       ├── index.css                         # Global CSS styles, Tailwind directives, badges
│       ├── contexts/
│       │   └── AuthContext.jsx               # Global Auth state, localStorage sync, login/logout
│       ├── routes/
│       │   ├── AppRoutes.jsx                 # Route definitions (<Routes>, <Route>)
│       │   ├── RequireAuth.jsx               # Role-based Route Guard (<Navigate to="/login">)
│       │   └── routeMap.js                   # Centralized application URI constants
│       ├── services/
│       │   ├── api.js                        # Central Axios instance with Bearer interceptors
│       │   ├── authApi.js                    # Auth HTTP requests (login, register)
│       │   ├── jobApi.js                     # Job catalog & search HTTP requests
│       │   ├── applicationApi.js             # Application submission & tracking HTTP requests
│       │   └── profileApi.js                 # Profile & skills HTTP requests
│       ├── pages/                            # Full-page views organized by persona
│       │   ├── Candidate/                    # Dashboard, ApplicationTracker, SavedJobs
│       │   ├── Recruiter/                    # HiringHub, ApplicantPipeline, PostJob
│       │   ├── Admin/                        # AdminDashboard, UserManagement, AuditLogs
│       │   ├── Auth/                         # LoginPage, RegisterPage
│       │   ├── Jobs/                         # JobCatalogPage, JobDetailsPage
│       │   └── Profile/                      # ProfilePage, SkillsManager
│       └── components/                       # Reusable UI widgets (Navbar, JobCard, Modal)
├── doc_assets/                               # 17 High-resolution live application screenshots
└── docs/                                     # Architecture documentation, SQL schemas, API specs"""
    add_code(doc, proj_tree, caption="GlobalCo Full-Stack Project Directory Architecture")

    # ==========================================
    # 8. TECHNOLOGY STACK DEEP DIVE
    # ==========================================
    add_heading_1(doc, "8. Technology Stack Deep Dive")
    add_p(doc, "Every technology in GlobalCo was deliberately chosen to satisfy specific engineering requirements:")
    
    tech_headers = ["Layer", "Technology", "Version", "Architectural Justification", "Interview Defense Comparison"]
    tech_data = [
        ["Backend Runtime", "Java LTS", "21 / 17", "Strict type safety, virtual threads, pattern matching, record classes, and robust multi-threaded server performance.", "Chosen over Node.js for rigid type safety, enterprise memory management, and mature concurrency models."],
        ["Backend Framework", "Spring Boot", "3.2.3", "Inversion of Control (IoC), Dependency Injection (DI), declarative @Transactional management, and embedded Tomcat.", "Avoided Express.js to leverage Spring's unified ecosystem, compile-time validation, and automated transactions."],
        ["Security", "Spring Security", "6.2", "Component-based SecurityFilterChain bean architecture, OncePerRequestFilter, defense against CORS/XSS.", "Replaced deprecated WebSecurityConfigurerAdapter with modern component SecurityFilterChain."],
        ["Persistence", "Spring Data JPA / Hibernate", "Hibernate 6", "Object-Relational Mapping (ORM), automated query derivation, dirty checking, first-level caching.", "Preferred over raw JDBC/MyBatis for rapid domain modeling and schema migration lifecycle."],
        ["Database", "H2 In-Memory (Dev) / MySQL 8 (Prod)", "2.2.x", "Zero-friction instant startup with pre-seeded data in dev; production-ready for MySQL 8 with identical JPA entities.", "H2 allows instant developer evaluation without Docker setup; switching to MySQL requires only an application.properties profile change."],
        ["Frontend Library", "React", "18.2.0", "Component-based architecture, Virtual DOM diffing, concurrent rendering, and hook-based state encapsulation.", "Selected over Angular for lighter bundle footprint and flexible component composition."],
        ["Build Tool", "Vite", "7.3.5", "Native ES Modules (ESM) hot reloading powered by esbuild; near-instant development server boot and optimized Rollup bundling.", "Vastly superior to legacy Create-React-App/Webpack, reducing cold start times from 30s to under 300ms."],
        ["Styling System", "Tailwind CSS", "3.4.19", "Utility-first CSS, zero runtime overhead, custom Red & White palette tokens, responsive grid system.", "Eliminates global CSS naming collisions and ensures strict design consistency across components."]
    ]
    add_table(doc, tech_headers, tech_data, [Inches(1.0), Inches(1.1), Inches(0.8), Inches(2.0), Inches(1.8)])

    # ==========================================
    # 9. SYSTEM ARCHITECTURE
    # ==========================================
    add_heading_1(doc, "9. System Architecture")
    add_p(doc,
        "The application is architected around a 3-Tier Layered Architecture with clear boundaries between the Presentation Tier, "
        "Application (Business Logic) Tier, and Data Persistence Tier:"
    )
    
    arch_ascii = """+-----------------------------------------------------------------------------------------+
|                               PRESENTATION TIER (CLIENT)                                |
|  React 18 SPA (Vite 7) | Tailwind CSS (Red & White Design System) | Lucide React Icons  |
|  AuthContext (Token Sync) | Axios Client (Request/Response Interceptors)                |
+--------------------------------------------+--------------------------------------------+
                                             | HTTPS / JSON (Bearer JWT Authorization)
                                             v
+-----------------------------------------------------------------------------------------+
|                         SPRING SECURITY FILTER CHAIN (GATEWAY)                          |
|  CorsFilter -> JwtAuthenticationFilter (OncePerRequestFilter) -> SecurityContextHolder   |
+--------------------------------------------+--------------------------------------------+
                                             | Authenticated Principal (User + Roles)
                                             v
+-----------------------------------------------------------------------------------------+
|                         REST CONTROLLER LAYER (PRESENTATION)                            |
|  AuthController | JobController | ApplicationController | RecruiterController | ...      |
+--------------------------------------------+--------------------------------------------+
                                             | DTOs (Validated with @Valid, @NotNull)
                                             v
+-----------------------------------------------------------------------------------------+
|                         SERVICE LAYER (BUSINESS LOGIC)                                  |
|  @Service @Transactional: JobService | ApplicationService | CandidateProfileService ...  |
+--------------------------------------------+--------------------------------------------+
                                             | JPA Entities (Managed Persistence Context)
                                             v
+-----------------------------------------------------------------------------------------+
|                         DATA ACCESS TIER (PERSISTENCE)                                  |
|  Spring Data JPA Repositories | Hibernate 6 ORM | HikariCP Connection Pool              |
+--------------------------------------------+--------------------------------------------+
                                             | SQL (Parameterized DML / DDL)
                                             v
+-----------------------------------------------------------------------------------------+
|                         RELATIONAL STORAGE ENGINE                                       |
|  H2 In-Memory DB (jdbc:h2:mem:jobboard_db) / MySQL 8.0 Enterprise Cluster              |
+-----------------------------------------------------------------------------------------+"""
    add_code(doc, arch_ascii, caption="GlobalCo 3-Tier Layered Architecture & Data Flow Pipeline")

    # ==========================================
    # 10. FRONTEND ARCHITECTURE
    # ==========================================
    add_heading_1(doc, "10. Frontend Architecture")
    add_p(doc,
        "The client application is organized into three architectural layers: Routing & Guards, Global State Context, and Resilient HTTP Services:"
    )
    add_heading_2(doc, "10.1 Global State Management (AuthContext.jsx)")
    add_p(doc,
        "Rather than over-engineering with external state libraries like Redux or MobX, GlobalCo uses React's native Context API (`AuthContext.jsx`). "
        "The context encapsulates the authenticated user object, the JWT token string, and user roles. "
        "Upon successful login, the token and user metadata are synchronized to browser `localStorage`, ensuring session continuity across page refreshes.",
        bold_prefix="State Synchronization: "
    )
    add_heading_2(doc, "10.2 Role-Based Route Guards (RequireAuth.jsx)")
    add_p(doc,
        "Protected pages are shielded using a declarative higher-order component (`RequireAuth.jsx`). "
        "If an unauthenticated user attempts to access `/candidate/dashboard`, they are redirected to `/login`. "
        "If a Candidate attempts to navigate to `/admin/dashboard`, the guard evaluates `user.role === 'ROLE_ADMIN'`. "
        "Failing the role check results in an automatic redirect to `/unauthorized` or their role-appropriate cockpit.",
        bold_prefix="Declarative Route Protection: "
    )
    add_heading_2(doc, "10.3 Resilient Axios Interceptors (api.js)")
    add_p(doc,
        "All outgoing network requests pass through a centralized Axios client configured in `src/services/api.js`:",
        bold_prefix="HTTP Interception Pipeline: "
    )
    add_bullet(doc, "Request Interceptor: Automatically inspects localStorage for 'token'. If present, it injects 'Authorization: Bearer <jwt>' into the HTTP request headers.")
    add_bullet(doc, "Response Interceptor: Monitors incoming HTTP responses. If a 401 Unauthorized is detected (indicating token expiry or signature tampering), it automatically clears localStorage, resets AuthContext state, and triggers a clean redirect to /login.")
