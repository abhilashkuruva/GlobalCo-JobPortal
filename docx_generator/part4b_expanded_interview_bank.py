from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa
)
from docx.shared import Inches, Pt

def generate_part_4b_expanded_interview_bank(doc):
    add_heading_1(doc, "Master Technical Interview Bank: Deep-Dive Questions & 5-Tier Responses")
    add_p(doc,
        "This master interview bank prepares candidates for technical vetting across Core Java, Spring Boot, Spring Security, "
        "React, SQL optimization, database locking, distributed systems, and enterprise design trade-offs. "
        "Every question is structured into 5 tiers: Short Fresher Answer, In-Depth Architectural Mechanics, Project Connection, "
        "Likely Follow-Up Question, and Winning Senior Response."
    )

    qa_list = [
        ("What is the difference between Constructor Injection and Field Injection (@Autowired)?",
         "Field injection directly injects dependencies into private variables using Java reflection, whereas Constructor Injection injects them through the class constructor.",
         "Field injection makes unit testing difficult because dependencies cannot be mocked without running a Spring container or using reflection hacks. Furthermore, it hides dependency bloat and permits circular dependencies. Constructor injection guarantees that objects are fully initialized upon instantiation, allows dependencies to be declared 'final' for immutability, and makes unit tests easy because you can simply pass mock instances to the constructor without Spring.",
         "In GlobalCo, classes like ApplicationService and JobService were refactored to prioritize constructor injection, allowing our JUnit 5 unit tests in ApplicationServiceTest to instantiate services with Mockito mocks instantly without Spring context overhead.",
         "What happens if two beans have constructor injection and depend on each other?",
         "Spring throws a BeanCurrentlyInCreationException due to an unresolvable circular dependency. This signals a design flaw where the classes should be refactored, or one dependency can be resolved lazily via @Lazy or setter injection."),

        ("How does Spring's @RestController differ from a traditional @Controller?",
         "@Controller is used in traditional Spring MVC to return HTML view templates (like JSP or Thymeleaf), whereas @RestController combines @Controller and @ResponseBody to return raw data (JSON or XML) directly in the HTTP response body.",
         "In a traditional @Controller, a method returning 'jobs' instructs the ViewResolver to locate 'jobs.html'. In a @RestController, the @ResponseBody annotation is inherited by all methods. Spring invokes Jackson's MappingJackson2HttpMessageConverter, which serializes the returned Java POJO/DTO into JSON byte streams written directly to the HttpServletResponse output stream.",
         "Every API endpoint in GlobalCo (such as JobController and AuthController) is annotated with @RestController because the React frontend operates as an independent Single Page Application consuming pure JSON REST APIs.",
         "How do you return an empty response with an HTTP 204 No Content status in a @RestController?",
         "You return ResponseEntity<Void> with status ResponseEntity.noContent().build(), or annotate the void method with @ResponseStatus(HttpStatus.NO_CONTENT)."),

        ("What are B-Tree indexes, and how do they speed up database queries?",
         "A B-Tree index is a balanced, self-sorting tree data structure that allows the database engine to find specific records in logarithmic time O(log N) instead of scanning the entire table linearly in O(N).",
         "Without an index, finding a user by email requires a Full Table Scan, reading every disk page. A B-Tree index stores sorted keys alongside pointers to the physical table rows (row IDs). The tree has root, branch, and leaf pages. Searching traverses from root to leaf via binary search on keys, turning millions of row inspections into 3 or 4 disk I/O reads. However, indexes add write overhead on INSERT, UPDATE, and DELETE because the index tree must be rebalanced.",
         "In GlobalCo, we place unique indexes on users(email) and users(username), and composite indexes on applications(job_id, candidate_id) to make applicant filtering and uniqueness checks instantaneous.",
         "What is the difference between a Clustered Index and a Non-Clustered Index?",
         "A Clustered Index dictates the physical sorting order of rows on disk; a table can have only ONE clustered index (usually the Primary Key). A Non-Clustered Index is a separate secondary structure containing sorted index keys and pointers back to the clustered index rows."),

        ("What is Optimistic Locking vs Pessimistic Locking in database transactions?",
         "Optimistic Locking assumes conflicts are rare and verifies no updates occurred before committing; Pessimistic Locking assumes conflicts are frequent and locks database rows using 'SELECT FOR UPDATE' to block other transactions.",
         "Optimistic locking uses a version column (@Version in JPA). When an update executes, Hibernate generates: 'UPDATE table SET col = ?, version = version + 1 WHERE id = ? AND version = ?'. If another transaction updated the row first, the version check fails (0 rows affected), and Hibernate throws an OptimisticLockException. Pessimistic locking issues a database-level row lock, holding it until transaction completion, which prevents conflicts but increases lock contention and deadlock risks.",
         "In GlobalCo, applicant status changes and vacancy vacancy counts use Optimistic Locking with an @Version field to prevent two recruiters from corrupting candidate states under high concurrent access without locking table rows.",
         "How should your frontend react when an OptimisticLockException occurs?",
         "The backend catches the exception and returns HTTP 409 Conflict. The React frontend prompts the user: 'This record was modified by another user. Please refresh and try again.'"),

        ("Why does React require 'key' props when rendering lists of elements?",
         "React uses 'key' props to track the identity of elements across renders, allowing it to efficiently determine which items in a list were added, removed, or reordered.",
         "During reconciliation, React's diffing algorithm compares children. Without keys, if an item is inserted at the beginning of an array of 1,000 items, React compares the first new item with the first old item, sees a difference, and mutates all 1,000 DOM nodes. With unique keys (e.g., job.id), React recognizes that the original 1,000 nodes are unchanged and merely inserts one new node at the top, drastically improving rendering performance.",
         "In GlobalCo, all card lists (JobCard in JobSearchPage, candidate cards in ApplicantTrackingPage) explicitly use unique database IDs as keys (e.g., key={job.id}), never array indexes.",
         "Why should you never use the array index as a key if the list can be reordered or filtered?",
         "Because if items are reordered or deleted, the index stays the same for different items, causing React to associate old DOM state or input values with the wrong items, leading to UI bugs."),

        ("What is the difference between useMemo and useCallback in React?",
         "useMemo caches the RESULT of a function calculation between renders, while useCallback caches the FUNCTION INSTANCE itself between renders.",
         "Every time a component re-renders, all functions declared inside it are recreated in memory. Passing an inline function to a memoized child component causes the child to re-render because the function reference is different. useCallback memoizes the function reference, recreating it only when specified dependencies change. useMemo evaluates a calculation and stores the return value, skipping recalculation on subsequent renders if dependencies remain unchanged.",
         "In GlobalCo, in JobSearchPage, the complex multi-parameter filter calculation across 500+ job requisitions is wrapped in useMemo, ensuring filtering only re-evaluates when the search keyword or filter pills actually change.",
         "Can overusing useMemo and useCallback hurt performance?",
         "Yes. Both hooks introduce memory overhead and dependency array comparison costs on every render. If used for trivial calculations (like adding two numbers), the optimization costs more CPU than simply letting React run the code."),

        ("What is CORS, and why did you configure it in Spring Security?",
         "Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts web applications running on one domain/port from making HTTP requests to a different domain/port.",
         "Under the Same-Origin Policy, browsers block JavaScript from reading HTTP responses from a different origin (protocol, domain, or port). Because our React frontend executes on http://localhost:5173 and our Spring Boot backend runs on http://localhost:8080, they are considered different origins. When the frontend makes a request, the browser first sends an HTTP OPTIONS 'preflight' request asking if the origin is permitted.",
         "In GlobalCo's SecurityConfig.java, we registered a CorsConfigurationSource allowing origins 'http://localhost:5173', verbs 'GET, POST, PUT, DELETE, OPTIONS', and headers 'Authorization, Content-Type', enabling smooth cross-origin communication without security holes.",
         "Why doesn't Postman or curl experience CORS errors?",
         "Because CORS is enforced strictly by web browsers, not servers. CLI tools and backend clients do not implement browser Same-Origin Policies and ignore CORS response headers entirely."),

        ("What is the difference between Authentication and Authorization?",
         "Authentication is the process of verifying WHO a user is (identity); Authorization is the process of determining WHAT an authenticated user is permitted to do (permissions/roles).",
         "Authentication answers: 'Is this user really riya.backend?' by validating credentials (passwords, JWT signatures, biometric data). Authorization answers: 'Is riya.backend allowed to delete this job requisition?' by checking their assigned roles and permissions (ROLE_CANDIDATE vs ROLE_RECRUITER).",
         "In GlobalCo, authentication is handled by AuthService and JwtAuthenticationFilter, while authorization is enforced by SecurityConfig route matchers (e.g., .requestMatchers('/api/recruiter/**').hasRole('RECRUITER')) and method-level @PreAuthorize annotations.",
         "Which HTTP status codes correspond to Authentication failure vs Authorization failure?",
         "Authentication failure returns HTTP 401 Unauthorized (unauthenticated or invalid token); Authorization failure returns HTTP 403 Forbidden (authenticated user lacks required role)."),

        ("How would you scale GlobalCo to handle 1,000,000 active users?",
         "Scale the system by decoupling state, introducing distributed caching, read-write database replicas, asynchronous message streaming, and horizontal container autoscaling.",
         "1. Stateless Application Tier: Package the Spring Boot backend in Docker containers deployed on AWS EKS (Kubernetes) with Horizontal Pod Autoscaling (HPA) behind an Application Load Balancer.\n"
         "2. Distributed In-Memory Caching: Deploy a Redis cluster using the Cache-Aside pattern for read-heavy operations like GET /api/jobs and taxonomy lookups, reducing database reads by up to 90%.\n"
         "3. Database Scaling: Migrate H2 to Amazon Aurora MySQL with a multi-AZ primary writer and 5 read replicas. Direct write traffic to primary and read traffic to replicas.\n"
         "4. Asynchronous Processing: Introduce Apache Kafka to queue high-volume events (applications, notification emails, resume parsing) for background worker consumption.\n"
         "5. Static Asset CDN: Serve the React production bundle (HTML, CSS, JS) via Amazon CloudFront CDN edge locations, achieving sub-50ms page loads globally.",
         "GlobalCo's decoupled 3-tier architecture with stateless JWT security was intentionally designed so that no server-side HTTP sessions exist, making horizontal auto-scaling seamless without session migration complexity.",
         "What is the single biggest bottleneck in a high-traffic system like this?",
         "The relational database. While application servers scale horizontally with ease, relational databases are constrained by disk I/O, locks, and connection limits, which is why caching and read replicas are essential.")
    ]

    for q, sa, da, pc, fu, fua in qa_list:
        add_qa(doc, q, sa, da, pc, fu, fua)

    doc.add_page_break()
