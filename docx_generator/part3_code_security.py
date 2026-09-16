import os
from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa, add_screenshot
)
from docx.shared import Inches, Pt

def generate_part_3(doc):
    assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "doc_assets"))

    # ==========================================
    # 19. RUNTIME ANALYSIS & SYSTEM TELEMETRY
    # ==========================================
    add_heading_1(doc, "19. Runtime Analysis & System Telemetry")
    add_p(doc,
        "The GlobalCo application operates as two decoupled processes communicating over loopback HTTP network interfaces:",
        bold_prefix="Runtime Architecture: "
    )
    add_bullet(doc, "Backend Process: Spring Boot 3.2.3 executing on Java 21 LTS runtime. Listens on TCP port 8080. Embedded Tomcat server handles worker thread pooling (default 200 max threads).")
    add_bullet(doc, "Frontend Process: Vite 7 development server executing on Node.js v24. Listens on TCP port 5173 with active WebSocket connection for Hot Module Replacement (HMR).")
    add_bullet(doc, "Database Engine: H2 In-Memory Relational Engine executing inside the backend JVM. Configured with DB_CLOSE_DELAY=-1 to preserve schema and pre-seeded data across thread terminations.")
    
    runtime_headers = ["Process / Service", "Default Port", "Active Profile", "Memory Footprint", "Health / Verification Endpoint"]
    runtime_data = [
        ["Spring Boot Backend", "8080", "default (dev)", "~320 MB JVM Heap", "http://localhost:8080/swagger-ui/index.html"],
        ["Vite / React Frontend", "5173", "development", "~85 MB Node RSS", "http://localhost:5173"],
        ["H2 Database Console", "8080", "in-memory (mem:jobboard_db)", "Embedded in JVM", "http://localhost:8080/h2-console"]
    ]
    add_table(doc, runtime_headers, runtime_data, [Inches(1.8), Inches(1.0), Inches(1.2), Inches(1.4), Inches(1.8)])

    add_heading_2(doc, "19.1 Step-by-Step Startup Lifecycle")
    startup_steps = [
        ("Step 1: Prerequisites Check", "Verify Java JDK 21+ and Node.js 18+ are present in the environment system PATH."),
        ("Step 2: Dependency Resolution", "Maven compiles dependencies from pom.xml into target/; npm install resolves frontend node_modules/."),
        ("Step 3: Database Bootstrap", "Spring Boot launches embedded H2 datasource at jdbc:h2:mem:jobboard_db with sa credentials."),
        ("Step 4: Schema DDL Generation", "Hibernate parses @Entity annotations and generates relational tables (users, jobs, applications, etc.)."),
        ("Step 5: Data Seeding", "DataInitializer (CommandLineRunner) executes, creating default roles, users, companies, jobs, and skills."),
        ("Step 6: Security Filter Chain Initialization", "SecurityConfig registers OncePerRequestFilter and CORS configuration."),
        ("Step 7: Frontend Server Launch", "Vite starts local development server on http://localhost:5173 with HMR enabled."),
        ("Step 8: Network Connection", "Axios client in browser communicates with http://localhost:8080/api using Bearer JWT tokens.")
    ]
    su_headers = ["Startup Step", "Operational Event & System Behavior"]
    su_data = [[s[0], s[1]] for s in startup_steps]
    add_table(doc, su_headers, su_data, [Inches(2.0), Inches(4.7)])

    # ==========================================
    # 20. CODE-LEVEL ANALYSIS
    # ==========================================
    add_heading_1(doc, "20. Code-Level Deep Dive")
    add_p(doc, "Let us inspect the foundational classes that control security, business logic, and data flow:")

    add_heading_2(doc, "20.1 Security Filter Chain: JwtAuthenticationFilter.java")
    add_p(doc,
        "This custom filter extends OncePerRequestFilter, ensuring it executes exactly once per incoming HTTP request. "
        "It extracts the Authorization header, validates the Bearer prefix, parses the JWT claims via JwtUtil, "
        "and sets the Spring SecurityContextHolder authentication token."
    )
    
    jwt_filter_code = """@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired private JwtUtil jwtUtil;
    @Autowired private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                logger.warn("JWT parsing failed: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}"""
    add_code(doc, jwt_filter_code, caption="JwtAuthenticationFilter.java - Filter Implementation")

    add_heading_2(doc, "20.2 Business Service: ApplicationService.java")
    add_p(doc,
        "ApplicationService coordinates candidate submissions and recruiter status transitions. "
        "The @Transactional annotation guarantees that application creation and notification dispatch execute atomically."
    )
    
    app_service_code = """@Service
@Transactional
public class ApplicationService {
    @Autowired private ApplicationRepository applicationRepo;
    @Autowired private JobRepository jobRepo;
    @Autowired private NotificationService notificationService;

    public Application applyForJob(Long jobId, User candidate, String coverLetter) {
        Job job = jobRepo.findById(jobId)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (applicationRepo.existsByJobAndCandidate(job, candidate)) {
            throw new DuplicateApplicationException("You have already applied for this position.");
        }

        Application application = Application.builder()
            .job(job)
            .candidate(candidate)
            .status(ApplicationStatus.APPLIED)
            .appliedAt(LocalDateTime.now())
            .coverLetter(coverLetter)
            .build();

        Application saved = applicationRepo.save(application);
        notificationService.createNotification(candidate, "Application Submitted", 
            "Your application for " + job.getTitle() + " at " + job.getCompany().getName() + " was received.");
        return saved;
    }
}"""
    add_code(doc, app_service_code, caption="ApplicationService.java - Atomic Application Submission")

    # ==========================================
    # UI SCREEN-BY-SCREEN DOCUMENTATION
    # ==========================================
    add_heading_1(doc, "UI Screen-by-Screen Deep Dive & Visual Tour")
    add_p(doc,
        "Below is the complete visual documentation of all primary user interfaces across Candidate, Recruiter, "
        "and Administrator personas, captured directly from live application execution:"
    )

    screens = [
        ("Screen 1: GlobalCo Public Landing Page & Search", "media_1789006427122.png",
         "Initial portal landing page welcoming candidates and employers with instant job title, location, and skill search inputs.",
         "Public (Unauthenticated & Authenticated)",
         "Find Jobs nav link, Sign In button, Register Free button, Hero search inputs (Job title, City/Remote, Skills), Search Jobs CTA button.",
         "GET /api/jobs (pre-fetch featured requisitions), Client-side route transition to /jobs upon query submission."),

        ("Screen 2: Featured Engineering Opportunities Catalog", "media_1789006432271.png",
         "Displays curated high-priority job cards from verified employers (Microsoft, Google, Amazon, Meta, Apple, Netflix).",
         "Public / All Users",
         "Company logo badge, job title, location pill (Bengaluru/Hybrid), experience pill, compensation range (₹18-28 LPA), Details button.",
         "GET /api/jobs?featured=true -> returns JSON list of JobDto items mapped to cards."),

        ("Screen 3: Job Filter & Discovery Matrix", "media_1789006446904.png",
         "Multi-faceted job discovery view allowing granular filtering by experience tier and work mode.",
         "Public / Candidates",
         "Experience Level radio pills (Entry, Junior, Mid-Senior, Lead), Work Mode checkboxes (Remote, Hybrid, On-site), Reset button, Apply Filters CTA.",
         "GET /api/jobs?experience=MID_SENIOR&workMode=HYBRID -> updates displayed job count dynamically."),

        ("Screen 4: Sign In Portal with 1-Click Demo Accounts", "media_1789006464290.png",
         "Secure authentication screen with instant 1-click credential autofill pills for Candidate, Recruiter, and Admin personas.",
         "Public",
         "Instant demo account pills (Candidate, Recruiter, Admin), Username/Email input, Password input with visibility toggle, Sign In submit button.",
         "POST /api/auth/login -> returns JWT Bearer token, stored in browser localStorage."),

        ("Screen 5: Candidate Personal Career Cockpit", "media_1789006509350.png",
         "Central command dashboard for job seekers tracking active applications, scheduled interviews, and profile strength.",
         "Candidate (ROLE_CANDIDATE)",
         "KPI cards: Active Applications (2), Interviews Scheduled (1), Offers Extended (1), Profile Strength (90%), Active Applications list with interview badges.",
         "GET /api/applications/my-applications, GET /api/profiles/me -> renders real-time candidate status."),

        ("Screen 6: Candidate Application Tracker & Pipeline Stepper", "media_1789006535291.png",
         "Interactive progress tracker displaying 6-stage visual pipeline stepper and technical interview details.",
         "Candidate (ROLE_CANDIDATE)",
         "6-stage stepper: APPLIED (checked) -> SCREENING (checked) -> SHORTLISTED (checked) -> INTERVIEW (active) -> OFFER -> HIRED; Join Google Meet blue button, Withdraw application link.",
         "GET /api/applications/my-applications, POST /api/applications/{id}/withdraw."),

        ("Screen 7: Candidate Professional Profile & Resume Center", "media_1789006559252.png",
         "Candidate professional identity management center for bio, experience, expected salary, and resume upload.",
         "Candidate (ROLE_CANDIDATE)",
         "Avatar card, Full Name headline, Edit Profile CTA, Upload Resume button, Professional Summary card, Profile Completeness (100%) progress bar.",
         "GET /api/profiles/me, PUT /api/profiles/me -> updates candidate metadata in database."),

        ("Screen 8: Candidate Verified Skills & Tag Manager", "media_1789006567429.png",
         "Interactive technical skill inventory where candidates manage verified competencies used by the match engine.",
         "Candidate (ROLE_CANDIDATE)",
         "Add skill text input, (+) add button, interactive skill pills with (x) delete tags (Java, Spring Boot, System Design, Testing, SQL, REST API), Suggested skill pills, Sync & Save button.",
         "PUT /api/profiles/me with updated skills array -> syncs with profile_skills join table."),

        ("Screen 9: Recruiter Talent Hiring Hub Command Center", "media_1789006622170.png",
         "Enterprise recruiter cockpit providing operational overview of requisitions, talent pipeline, and scheduled interviews.",
         "Recruiter (ROLE_RECRUITER)",
         "KPI metrics: Active Openings (3), Total Candidates (24), Shortlisted (1), Interviews Scheduled (4); Post Opportunity CTA button, Requisitions tab, Sourcing tab.",
         "GET /api/recruiter/my-jobs, GET /api/analytics/recruiter -> computes hiring pipeline conversion."),

        ("Screen 10: Recruiter Active Requisitions & Scheduled Interviews", "media_1789006631073.png",
         "Detailed table of active job requisitions and upcoming interview schedule widget with candidate details.",
         "Recruiter (ROLE_RECRUITER)",
         "Requisitions table (Title, Work Mode, Status badge: PUBLISHED, ATS Pipeline link), Upcoming Interviews list (Riya Sharma - Tomorrow 10:30 AM), Matching Engine Precision card (94%).",
         "GET /api/recruiter/my-jobs, GET /api/interviews/upcoming."),

        ("Screen 11: Recruiter ATS Pipeline & Candidate Assessment", "media_1789006648526.png",
         "Kanban-style candidate pipeline for a specific job requisition allowing stage advancement and offer generation.",
         "Recruiter (ROLE_RECRUITER)",
         "Export Candidates (CSV) button, Pipeline stage filter pills (All, Applied, Screening, Shortlisted, Interview Scheduled, Selected, Offer Sent, Rejected), Candidate card (samir.react, 95% Match, notes), Inspect Profile button, Stage dropdown, Interview button, Send Offer CTA.",
         "GET /api/recruiter/jobs/{id}/applicants, PUT /api/recruiter/applications/{id}/status, GET /api/recruiter/jobs/{id}/export-applicants."),

        ("Screen 12: Admin Platform Governance & System Metrics", "media_1789006703318.png",
         "Superuser governance console tracking platform health, active users, requisitions, and security activity.",
         "Administrator (ROLE_ADMIN)",
         "Refresh Metrics button, Tabs (KPI Overview, User Management, Job Moderation, Security Audit Logs), System KPIs (Total Users: 6, Active Requisitions: 6, Applications: 3, Offers: 1), Recent Security Activity stream, Backend Architecture indicator.",
         "GET /api/admin/stats, GET /api/admin/logs -> system telemetry data."),

        ("Screen 13: Admin Registered Accounts & User Moderation", "media_1789006721345.png",
         "Administrative user directory for inspecting accounts and toggling active/suspended moderation state.",
         "Administrator (ROLE_ADMIN)",
         "Filter tabs (All Users, Candidates, Recruiters, Admins), Search accounts input, User table (Avatar, Username, Email, Role badge, Status badge: Active, Moderation Action: Suspend button).",
         "GET /api/admin/users, PUT /api/admin/users/{id}/toggle-status -> toggles User.enabled flag."),

        ("Screen 14: System Error State & Empty State Handling", "media_1789006379270.png",
         "Demonstrates graceful degradation when backend services are unreachable or search returns zero items.",
         "All Users / Resilient Fallback",
         "Red banner: 'Failed to load opportunities' / '0 Openings Found', 'No matching opportunities' empty state card with 'Reset All Filters' CTA.",
         "Axios response error interceptor catches 500/network timeout and transitions React UI into error state.")
    ]

    for title, img_file, purpose, access, elements, apis in screens:
        add_heading_2(doc, title)
        img_path = os.path.join(assets_dir, img_file)
        if os.path.exists(img_path):
            add_screenshot(doc, img_path, title)
        add_p(doc, purpose, bold_prefix="Screen Purpose: ")
        add_p(doc, access, bold_prefix="Access Control & Security: ")
        add_p(doc, elements, bold_prefix="Interactive UI Elements: ")
        add_p(doc, apis, bold_prefix="Network & API Integration: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ==========================================
    # 21. ALGORITHMS & BUSINESS LOGIC
    # ==========================================
    add_heading_1(doc, "21. Algorithms & Business Logic")
    add_heading_2(doc, "21.1 Candidate-Job Match Scoring Formulation")
    add_p(doc,
        "The automated match score algorithm is formulated as a weighted multi-factor compatibility function:\n"
        "Match Score = (0.50 * S) + (0.25 * E) + (0.25 * L)\n"
        "Where:\n"
        "• S = Skill Overlap Factor = (|CandidateSkills ∩ JobRequiredSkills| / |JobRequiredSkills|) * 100\n"
        "• E = Experience Alignment Factor = 100 if candidateYears >= requiredYears else (candidateYears / requiredYears) * 100\n"
        "• L = Location & Work Mode Fit = 100 if candidateLocation == jobLocation or jobWorkMode == REMOTE else 50",
        bold_prefix="Mathematical Formulation: "
    )
    add_bullet(doc, "Computational Complexity: Set intersection is O(N + M) using Java HashSets where N is candidate skills and M is job required skills. Lookups execute in O(1) constant time.")
    add_bullet(doc, "Space Complexity: O(N + M) auxiliary space for normalized lower-case skill collections.")

    # ==========================================
    # 22. SECURITY & OWASP TOP 10 MITIGATION
    # ==========================================
    add_heading_1(doc, "22. Security & OWASP Top 10 Mitigation")
    
    sec_headers = ["Vulnerability Category", "Threat Scenario", "Mitigation Mechanism in GlobalCo", "Validation Status"]
    sec_data = [
        ["A01: Broken Access Control", "Candidate accesses /api/recruiter endpoints or modifies another candidate's profile.", "Spring Security URL antMatchers enforce role checks. Service methods verify authenticated user owns the profile.", "🟢 CONFIRMED FROM CODE"],
        ["A02: Cryptographic Failures", "Leaked passwords or predictable authentication tokens.", "BCrypt password hashing with cost factor 10. HMAC-SHA256 tokens with 256-bit secret key.", "🟢 CONFIRMED FROM CODE"],
        ["A03: Injection (SQLi)", "Malicious SQL payloads injected via search inputs or filters.", "Spring Data JPA parameterized queries and Hibernate ORM prevent SQL interpretation of user input.", "🟢 CONFIRMED FROM CODE"],
        ["A05: Security Misconfiguration", "Exposing default H2 consoles or verbose stack traces in production.", "GlobalExceptionHandler intercepts all exceptions and returns standardized error envelopes without stack traces.", "🟢 CONFIRMED FROM CODE"],
        ["A07: Identification & Auth", "Brute-force attacks or replay of expired JWT tokens.", "Tokens expire strictly after 24 hours (86,400,000 ms). Expired tokens return 401 Unauthorized immediately.", "🟢 CONFIRMED FROM CODE"]
    ]
    add_table(doc, sec_headers, sec_data, [Inches(1.5), Inches(1.8), Inches(2.2), Inches(1.2)])

    # ==========================================
    # 23. ERROR HANDLING & RESILIENCE
    # ==========================================
    add_heading_1(doc, "23. Error Handling Architecture")
    add_p(doc,
        "The system implements a centralized @RestControllerAdvice inside GlobalExceptionHandler.java. "
        "Any unhandled exception is caught, logged with SLF4J, and mapped into a standardized ApiError response:"
    )
    
    error_json = """{
  "timestamp": "2026-09-16T19:25:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Job with id '999' does not exist",
  "path": "/api/jobs/999"
}"""
    add_code(doc, error_json, caption="Standardized ApiError JSON Envelope")

    # ==========================================
    # 24. CONFIGURATION DEEP DIVE
    # ==========================================
    add_heading_1(doc, "24. Configuration Architecture")
    add_p(doc, "Configuration settings are externalized across development and production property files:", bold_prefix="Properties Breakdown: ")
    add_bullet(doc, "spring.datasource.url=jdbc:h2:mem:jobboard_db;DB_CLOSE_DELAY=-1 : In-memory persistent database across connections.")
    add_bullet(doc, "spring.jpa.hibernate.ddl-auto=create-drop : Recreates clean schema on boot and populates seed data via DataInitializer.")
    add_bullet(doc, "jwt.secret=[SECRET REDACTED] : 256-bit cryptographic key used for HMAC-SHA256 signing.")
    add_bullet(doc, "jwt.expiration=86400000 : 24-hour expiration window in milliseconds.")

    # ==========================================
    # 25. DEPENDENCY ANALYSIS
    # ==========================================
    add_heading_1(doc, "25. Dependency Analysis")
    add_p(doc, "The project relies on production-grade dependencies managed via Maven (backend) and npm (frontend):")
    
    dep_headers = ["Dependency Identifier", "Artifact Version", "Architectural Purpose", "Where Used"]
    dep_data = [
        ["spring-boot-starter-data-jpa", "3.2.3", "Hibernate 6 ORM, Spring Data abstraction, HikariCP connection pool", "All backend repositories & services"],
        ["spring-boot-starter-security", "3.2.3", "Authentication, authorization, filter chains, BCryptPasswordEncoder", "SecurityConfig, UserDetailsService"],
        ["jjwt-api / jjwt-impl / jjwt-jackson", "0.12.5", "HMAC-SHA256 JWT generation, claims extraction, token parsing", "JwtUtil, JwtAuthenticationFilter"],
        ["springdoc-openapi-starter-webmvc-ui", "2.3.0", "OpenAPI 3.0 specification & interactive Swagger UI documentation", "http://localhost:8080/swagger-ui/index.html"],
        ["h2", "2.2.224", "In-memory relational database engine for zero-setup local dev and unit testing", "Development datasource"],
        ["mysql-connector-j", "8.3.0", "Production MySQL driver for seamless cloud deployment profile", "Production datasource"],
        ["react / react-dom", "18.2.0", "Declarative component-driven user interface library with Virtual DOM", "frontend/src/ (All UI views)"],
        ["vite", "7.3.5", "Native ESM development server and Rollup production bundler", "Frontend dev server & npm run build"],
        ["tailwindcss", "3.4.19", "Utility-first CSS framework implementing custom Red & White palette", "All frontend components & styling"],
        ["axios", "1.6.8", "Promise-based HTTP client with request and response interceptors", "frontend/src/services/api.js"],
        ["lucide-react", "0.344.0", "Lightweight SVG icon library with tree-shaking support", "All UI components and buttons"]
    ]
    add_table(doc, dep_headers, dep_data, [Inches(1.8), Inches(0.9), Inches(2.3), Inches(1.7)])

    # ==========================================
    # 26. AUTOMATED TESTING SUITE
    # ==========================================
    add_heading_1(doc, "26. Automated Testing Suite")
    add_p(doc,
        "The project features automated backend unit and integration tests executed using JUnit 5 and Mockito. "
        "Live verification confirmed a 100% pass rate (11/11 tests passed with 0 failures and 0 errors):",
        bold_prefix="Test Execution Verification: "
    )
    add_bullet(doc, "ApplicationServiceTest (3 tests): Validates 1-click application submission, duplicate prevention under repeated requests, and status transitions.")
    add_bullet(doc, "AuthServiceTest (2 tests): Verifies valid login, token generation, and password hash comparison.")
    add_bullet(doc, "CandidateProfileServiceTest (3 tests): Tests profile creation, skill updates, and profile retrieval.")
    add_bullet(doc, "JobServiceTest (3 tests): Validates job search, keyword filtering, and candidate-job matching algorithms.")
    add_bullet(doc, "Frontend Build Verification: 'npm run build' executed cleanly via Vite, transforming 1840 modules into an optimized bundle with 0 errors.")

    # ==========================================
    # 27. CLOUD DEPLOYMENT & PRODUCTION ROADMAP
    # ==========================================
    add_heading_1(doc, "27. Deployment Architecture & Cloud Strategy")
    add_p(doc,
        "To deploy GlobalCo in an enterprise cloud environment (AWS, GCP, Azure, or Kubernetes):"
    )
    add_bullet(doc, "Database Migration: Replace H2 with Amazon RDS MySQL 8.0 or PostgreSQL. Set spring.jpa.hibernate.ddl-auto=validate and execute Flyway migration scripts.")
    add_bullet(doc, "Docker Multi-Stage Build: Containerize backend JAR using eclipse-temurin:21-jre-alpine and frontend build using nginx:alpine.")
    add_bullet(doc, "NGINX Ingress Gateway: Reverse proxy serving React SPA at / and routing /api requests to the Spring Boot backend cluster.")
    add_bullet(doc, "Secret Management: Store JWT secrets and database passwords in AWS Secrets Manager or HashiCorp Vault.")
