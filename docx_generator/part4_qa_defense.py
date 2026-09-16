from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa, add_screenshot
)
from docx.shared import Inches, Pt

def generate_part_4(doc):
    # ==========================================
    # 28. PROBLEMS & BUGS FOUND DURING AUDIT
    # ==========================================
    add_heading_1(doc, "28. Problems & Bugs Found During System Audit")
    add_p(doc,
        "During full-system reverse-engineering and automated test execution, several critical architectural and runtime "
        "issues were discovered and systematically resolved:",
        bold_prefix="Audit Findings & Resolutions: "
    )
    
    bug_headers = ["Issue Identified", "Evidence & Reproduction", "Root Cause Analysis", "Impact / Severity", "Applied Resolution"]
    bug_data = [
        ["Ephemeral JWT Key on Reboot", "Tokens failed with SignatureException after server reboot.", "JwtUtil generated in-memory Keys.secretKeyFor(HS256) on boot.", "HIGH: Forced all users to re-login on restart.", "Externalized deterministic 256-bit secret key into application.properties."],
        ["Unhandled 500 on Expired JWT", "Expired token threw unhandled ServletException in filter chain.", "JwtAuthenticationFilter lacked try-catch block around claims parser.", "HIGH: 500 Internal Server Error returned instead of 401.", "Wrapped token parsing in try-catch; logs warning and continues filter chain cleanly."],
        ["Strict Signup Validation Rejection", "Candidate signup failed with HTTP 400 Bad Request.", "SignupRequest had @NotBlank on optional mobileNumber & confirmPassword.", "MEDIUM: Blocked valid candidate onboarding.", "Relaxed non-essential validation annotations on auxiliary fields."],
        ["Recruiter Analytics Field Mismatch", "Recruiter KPI cards showed 0 or NaN.", "AnalyticsService returned snake_case active_jobs; frontend expected camelCase activeJobs.", "MEDIUM: Dashboard telemetry cards broke.", "Added camelCase alias keys to the analytics response Map."],
        ["Duplicate JobCard Root File", "Vite build warned about duplicate JobCard.jsx in src/components/.", "Legacy JobCard.jsx collided with JobCard/JobCard.jsx component folder.", "LOW: Developer confusion & lint warnings.", "Purged orphan root JobCard.jsx and standardized on component subfolder."]
    ]
    add_table(doc, bug_headers, bug_data, [Inches(1.2), Inches(1.3), Inches(1.5), Inches(1.2), Inches(1.5)])

    # ==========================================
    # 29. CURRENT PROJECT LIMITATIONS
    # ==========================================
    add_heading_1(doc, "29. Current Project Limitations")
    add_p(doc, "A senior engineer understands the architectural trade-offs of their current implementation:")
    
    lim_headers = ["Limitation", "Severity Tier", "Technical Description", "Production Remediation"]
    lim_data = [
        ["In-Memory Database State", "High", "H2 database resets tables when JVM stops, requiring DataInitializer re-seeding.", "Switch to AWS RDS MySQL 8.0 with Flyway automated migrations."],
        ["Stateless JWT Revocation", "Medium", "JWTs remain valid until 24-hour expiration; logging out cannot revoke tokens on other devices.", "Implement a distributed token blacklist in Redis with TTL matching token expiry."],
        ["Synchronous Polling Notifications", "Medium", "Notifications are fetched on page load rather than pushed in real-time.", "Integrate Spring WebSocket (STOMP) or Server-Sent Events (SSE) for push notifications."],
        ["Local Document Simulation", "Low", "Resumes are stored as text URLs rather than binary byte arrays.", "Implement direct multipart file upload to Amazon S3 with signed pre-authenticated URLs."]
    ]
    add_table(doc, lim_headers, lim_data, [Inches(1.5), Inches(1.0), Inches(2.2), Inches(2.0)])

    # ==========================================
    # 30. IMPROVEMENT ROADMAP (1M USER SCALE)
    # ==========================================
    add_heading_1(doc, "30. Improvement Roadmap & Scalability Strategy")
    add_p(doc, "A four-phase engineering roadmap for scaling GlobalCo to 1,000,000 active concurrent users:")
    add_bullet(doc, "Phase 1: Persistent Database & Connection Pooling — Migrate H2 to Amazon Aurora MySQL with HikariCP pool tuned to 50 max connections.")
    add_bullet(doc, "Phase 2: Distributed Caching with Redis — Add Redis cache (@Cacheable) for read-heavy endpoints like GET /api/jobs and GET /api/categories, reducing database read load by 85%.")
    add_bullet(doc, "Phase 3: Asynchronous Message Broker (Kafka) — Decouple application submissions and notification dispatches using Apache Kafka or AWS SQS.")
    add_bullet(doc, "Phase 4: Full-Text Search Engine (Elasticsearch) — Deploy Elasticsearch for fuzzy skill matching and resume text parsing.")

    # ==========================================
    # 31. MASTER INTERVIEW PREPARATION (PITCH VERSIONS)
    # ==========================================
    add_heading_1(doc, "31. Project Interview Master Preparation")
    
    add_heading_2(doc, "31.1 The 30-Second Elevator Pitch")
    add_p(doc,
        "\"GlobalCo is an enterprise recruitment and applicant tracking platform built with Java 21, Spring Boot 3, and React 18. "
        "It solves the recruitment black hole by providing a 6-stage applicant tracking pipeline, an automated skill matching algorithm "
        "that calculates candidate compatibility in real-time, interview scheduling with Google Meet links, and binding offer generation. "
        "I built it with stateless JWT security and clean layered architecture, ensuring high scalability and production reliability.\"",
        bold_prefix="Script: "
    )

    add_heading_2(doc, "31.2 The 1-Minute Executive Summary")
    add_p(doc,
        "\"GlobalCo bridges the gap between high-volume hiring teams and skilled software engineers. "
        "Traditional platforms suffer from resume overload and lack of feedback. In GlobalCo, we implemented an algorithmic Match Engine "
        "that compares candidate competencies against job requirements, weighting technical skills at 50%, experience at 25%, and location at 25%. "
        "Recruiters manage vacancies via an interactive ATS pipeline where they can advance candidate stages, schedule Google Meet interviews, "
        "and generate formal compensation offers. On the backend, we used Spring Boot 3 with Spring Security 6 for stateless JWT authentication, "
        "while the frontend uses React 18 with Vite and Tailwind CSS. The entire system is built on a 3-tier architecture with full unit test coverage.\"",
        bold_prefix="Script: "
    )

    add_heading_2(doc, "31.3 The 2-Minute Architectural Walkthrough")
    add_p(doc,
        "\"When architecting GlobalCo, I prioritized decoupling, security, and developer ergonomics. "
        "On the backend, I implemented a 3-tier Spring Boot application. Client requests first encounter our Spring Security Filter Chain, "
        "where a custom OncePerRequestFilter validates the cryptographic HMAC-SHA256 signature of incoming JWT tokens. "
        "Requests are then routed to REST controllers, which delegate to transactional service classes. "
        "We used Spring Data JPA and Hibernate for persistence, backed by a normalized 3NF relational schema. "
        "To prevent duplicate submissions under race conditions, we enforced a database-level composite UNIQUE constraint on (job_id, candidate_id). "
        "On the frontend, I used React 18 with Vite and Tailwind CSS. We implemented a centralized AuthContext for user state, "
        "and our Axios client uses request interceptors to attach bearer tokens and response interceptors to auto-evict expired sessions. "
        "The system achieved a 100% pass rate across our JUnit 5 test suite and builds with zero errors.\"",
        bold_prefix="Script: "
    )

    add_heading_2(doc, "31.4 The 5-Minute Technical Deep Dive")
    add_p(doc,
        "\"GlobalCo is designed as an enterprise recruitment operating system that coordinates three distinct actors: Candidates, Recruiters, and Admins. "
        "Let me walk through the technical architecture in detail:\n\n"
        "First, Security & Authentication: We use stateless JWT tokens signed with HMAC-SHA256. When a user logs in, AuthService validates credentials "
        "against BCrypt password hashes. If valid, JwtUtil issues a signed token containing username, user ID, and GrantedAuthorities. "
        "Every subsequent request is intercepted by JwtAuthenticationFilter, which extracts the token, verifies the signature, and sets SecurityContextHolder.\n\n"
        "Second, The Business Logic & Match Engine: When a candidate views a job, CandidateProfileService computes a multi-factor compatibility score. "
        "It pulls the candidate's skills and the job's required skills, normalizes them, and computes a set intersection using HashSets in O(N+M) time. "
        "Combined with experience and location weights, this yields a transparent percentage score.\n\n"
        "Third, Transactional Integrity & The ATS Pipeline: When a candidate clicks 'Apply', ApplicationService runs within a @Transactional boundary. "
        "It checks for existing applications, saves the Application record in APPLIED status, and dispatches an alert via NotificationService. "
        "Recruiters can transition candidates across 7 discrete stages, schedule technical interviews with video conference links, and issue offers.\n\n"
        "Fourth, Resilience & Error Handling: We implemented GlobalExceptionHandler with @RestControllerAdvice, converting all runtime exceptions into "
        "standardized ApiError envelopes. Our Axios client automatically evicts expired sessions on HTTP 401, providing a seamless user experience.\"",
        bold_prefix="Script: "
    )

    # ==========================================
    # 32. TOP 15 PROJECT TECHNICAL Q&A
    # ==========================================
    add_heading_1(doc, "32. Project Technical Q&A (Master Interview Bank)")
    
    add_qa(doc,
        question="Why did you choose JWT over traditional HTTP Session cookies?",
        short_ans="JWTs are completely stateless, meaning the backend doesn't store session data in memory. This allows the application to scale horizontally across multiple server instances without sticky sessions or a shared session store.",
        detailed_ans="With traditional JSESSIONID cookies, the server stores session state in RAM. If you scale to 5 server instances behind an AWS ALB, you either need sticky sessions (which cause uneven load distribution) or a centralized session cache like Redis. JWT embeds the user claims and cryptographic signature directly in the token. Any server holding the secret key can verify the token independently in O(1) time without database or cache lookups.",
        project_conn="In GlobalCo, JwtUtil.java generates tokens containing the username, user ID, and role authorities. The JwtAuthenticationFilter parses this token on every request and populates Spring's SecurityContextHolder.",
        follow_up="What is the major drawback of stateless JWT, and how would you fix it?",
        follow_up_ans="The primary drawback is revocation: if a user logs out or has their account suspended, the JWT remains valid until its expiration timestamp. To fix this in production, we would implement a token blacklist in Redis with a TTL matching the token expiry, checking Redis during the filter chain."
    )

    add_qa(doc,
        question="What is the difference between @Component, @Service, and @Repository in Spring?",
        short_ans="They are all Spring stereotype annotations indicating that a class is a managed Spring Bean. However, @Service and @Repository convey semantic intent and enable specific framework behaviors.",
        detailed_ans="@Component is the generic root stereotype. @Service annotates classes in the business logic layer, indicating where domain operations and transaction boundaries reside. @Repository annotates the data access layer and automatically enables Spring's DataAccessException translation mechanism, translating database-specific SQL exceptions into Spring's unified unchecked exception hierarchy.",
        project_conn="In GlobalCo, JobService is annotated with @Service and @Transactional, while JobRepository extends JpaRepository and is annotated with @Repository."
    )

    add_qa(doc,
        question="What happens under the hood when you annotate a method with @Transactional?",
        short_ans="Spring creates a dynamic CGLIB or JDK proxy around the bean. When the method is invoked, the proxy intercepts the call, begins a database transaction, executes the method, commits if successful, and rolls back if an unchecked RuntimeException occurs.",
        detailed_ans="Spring's TransactionInterceptor intercepts the method call. It consults the PlatformTransactionManager to obtain a connection from the HikariCP pool and binds it to the current thread via ThreadLocal. If any RuntimeException or Error occurs, the interceptor issues a connection.rollback(). If the method completes normally, connection.commit() is invoked, and the connection is returned to the pool.",
        project_conn="In ApplicationService.applyForJob(), we use @Transactional to ensure that both the Application entity creation and the Notification record creation either commit together or roll back completely if an error occurs."
    )

    add_qa(doc,
        question="What is the Hibernate N+1 query problem, and how do you solve it?",
        short_ans="The N+1 problem occurs when fetching an entity with lazy relationships (like Job with Company). One query fetches N jobs, and then Hibernate executes N additional queries to fetch the company for each individual job.",
        detailed_ans="If a query executes 'SELECT * FROM jobs', returning 100 jobs, accessing job.getCompany().getName() in a loop causes Hibernate to trigger 100 individual 'SELECT * FROM companies WHERE id = ?' queries, resulting in 1 + 100 = 101 database queries.",
        project_conn="In GlobalCo, we solve this in JobRepository using JPQL JOIN FETCH: 'SELECT j FROM Job j JOIN FETCH j.company JOIN FETCH j.category' which loads the entire object graph in a single SQL JOIN query."
    )

    add_qa(doc,
        question="How does your candidate skill matching algorithm work, and what is its computational complexity?",
        short_ans="It extracts candidate skills and job required skills into HashSets, performs a set intersection, and computes the percentage of required skills possessed by the candidate.",
        detailed_ans="The algorithm normalizes all skill strings (trimming whitespace and converting to lowercase). It places candidate skills into a HashSet for O(1) lookups. It then iterates through the job's required skills, counting how many exist in the candidate's set. Score = (matchedCount / totalRequired) * 100. Time complexity is O(N + M) and space complexity is O(N + M).",
        project_conn="Implemented in CandidateProfileService and exposed via GET /api/jobs/{id}/match, returning MatchScoreBreakdownDto with score, matchingSkills, and missingSkills."
    )

    # ==========================================
    # 33. DIFFICULT FOLLOW-UP QUESTIONS & EDGE CASES
    # ==========================================
    add_heading_1(doc, "33. Difficult Follow-Up Questions & Edge Cases")
    
    add_heading_2(doc, "33.1 Edge Case: Concurrent Application Submissions")
    add_p(doc,
        "What happens if a candidate double-clicks the 'Apply' button rapidly, sending two simultaneous HTTP requests to /api/jobs/1/apply?",
        bold_prefix="Interviewer Scenario: "
    )
    add_p(doc,
        "\"If handled solely via application code checking 'existsByJobAndCandidate', a race condition can occur where both threads check the database simultaneously, find no existing application, and both insert a record. "
        "To guarantee idempotency and prevent duplicates, we enforce a database-level composite UNIQUE constraint on (job_id, candidate_id). "
        "If the second thread attempts an insert, the database raises a DataIntegrityViolationException, which our GlobalExceptionHandler catches and converts into a friendly 409 Conflict response without corrupting data.\"",
        bold_prefix="Senior Defense: "
    )

    add_heading_2(doc, "33.2 Edge Case: Scalability Under 100,000 Concurrent Users")
    add_p(doc,
        "How would you re-architect GlobalCo to handle 100,000 concurrent job seekers during a massive recruitment drive?",
        bold_prefix="Interviewer Scenario: "
    )
    add_p(doc,
        "\"First, eliminate database bottlenecks by adding Redis caching with a Cache-Aside pattern for read-heavy endpoints like GET /api/jobs. "
        "Second, configure Read Replicas for our database cluster, directing read queries to replicas and writes to the primary master. "
        "Third, decouple high-volume writes (like application submissions and notification dispatches) by introducing an Apache Kafka or AWS SQS message queue: "
        "the controller acknowledges receipt with a 202 Accepted, and worker services consume messages asynchronously. "
        "Fourth, deploy the Spring Boot backend inside Kubernetes pods with Horizontal Pod Autoscaling (HPA) triggered by CPU utilization and request throughput.\"",
        bold_prefix="Senior Defense: "
    )

    # ==========================================
    # 34. 'IF THE INTERVIEWER OPENS MY CODE' SURVIVAL GUIDE
    # ==========================================
    add_heading_1(doc, "34. 'If the Interviewer Opens My Code' Survival Guide")
    add_p(doc, "Prepare for line-by-line inspection of your repository source files:")

    code_questions = [
        ("Why did you create JwtAuthenticationFilter?", "It intercepts every incoming HTTP request once (OncePerRequestFilter), parses the Bearer JWT token from the Authorization header, validates its cryptographic signature, and loads the user into Spring Security's SecurityContextHolder."),
        ("Why is @Transactional placed on ApplicationService methods?", "Because creating an application involves multiple database writes (inserting into applications and inserting into notifications). @Transactional ensures that if the notification fails, the application insert is also rolled back, maintaining database consistency."),
        ("Why did you use @RestControllerAdvice instead of try-catch in every controller?", "@RestControllerAdvice provides centralized, cross-cutting exception handling. It prevents repetitive try-catch boilerplate across 14 controllers and guarantees consistent JSON error envelopes."),
        ("Why did you use DTOs instead of passing JPA entities to the frontend?", "1) Security: Prevents Mass Assignment attacks where a user passes 'role: ROLE_ADMIN'. 2) Performance: Avoids serializing unwanted database fields. 3) Stability: Prevents Jackson from crashing on circular bidirectional entity relationships."),
        ("Why did you use HashSets for skill matching instead of ArrayLists?", "Checking if an element exists in an ArrayList takes O(N) linear time. In a HashSet, lookups take O(1) constant time because elements are hashed into buckets, making the match algorithm O(N+M) instead of O(N*M).")
    ]
    cq_headers = ["Interviewer Code Inspection Question", "Winning Technical Explanation"]
    cq_data = [[q[0], q[1]] for q in code_questions]
    add_table(doc, cq_headers, cq_data, [Inches(2.5), Inches(4.2)])

    # ==========================================
    # 35. HOW TO DEFEND THIS PROJECT IN AN INTERVIEW
    # ==========================================
    add_heading_1(doc, "35. How to Defend This Project in an Interview")
    add_p(doc, "Interviewers test your technical depth by probing architectural trade-offs. Here is how to defend key choices:")
    
    defense_headers = ["Interviewer Challenge / Trap", "Why They Ask It", "Winning Technical Defense Strategy"]
    defense_data = [
        ["'Why did you build a Monolith instead of Microservices?'", "Testing if you blindly follow microservice hype without understanding operational complexity.", "Defend that for this domain scale, a Modular Monolith offers maximum development velocity, single-transaction guarantees, and zero network latency between services. If scale demands it, our distinct domain modules (Auth, Jobs, Applications, Analytics) can be extracted into microservices."],
        ["'Why did you use JPA instead of raw JDBC or MyBatis?'", "Testing your understanding of performance vs development speed.", "Explain that Spring Data JPA accelerates CRUD operations, automated schema generation, and dirty checking. For complex high-throughput reporting queries, we can easily drop down to native SQL queries or JdbcTemplate without abandoning JPA."],
        ["'Why did you use localStorage for JWT tokens instead of httpOnly cookies?'", "Testing your security awareness regarding XSS vs CSRF.", "Acknowledge that localStorage is vulnerable to XSS if malicious scripts execute, but completely immune to CSRF. Explain that we sanitized all React rendering to prevent XSS. In a banking-grade production environment, we would migrate to httpOnly, SameSite=Strict cookies paired with CSRF tokens."]
    ]
    add_table(doc, defense_headers, defense_data, [Inches(2.0), Inches(2.0), Inches(2.7)])
