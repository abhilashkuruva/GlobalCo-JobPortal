from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa
)
from docx.shared import Inches, Pt

def generate_part_1b_foundations(doc):
    # ==========================================
    # FOUNDATIONS PRIMER: ZERO-TO-HERO ENGINEERING CONCEPTS
    # ==========================================
    add_heading_1(doc, "Foundations Primer: Core Software Engineering & Web Architecture (Zero-to-Hero)")
    add_p(doc,
        "Before dissecting the specific codebase of GlobalCo, this section establishes the foundational computer science, "
        "networking, backend, frontend, database, and cryptographic principles underpinning the entire application. "
        "If you are reviewing this project with zero prior software engineering experience, study this primer first."
    )

    # 1. CLIENT-SERVER & WEB NETWORKING
    add_heading_2(doc, "1. Client-Server Architecture & HTTP Networking Mechanics")
    add_p(doc,
        "Every modern web application is built upon the Client-Server model. A client (the user's web browser, e.g., Chrome) "
        "and a server (the remote machine running the application logic) communicate over a network using the Hypertext Transfer Protocol (HTTP/HTTPS).",
        bold_prefix="Core Concept: "
    )
    add_bullet(doc, "The Client (Presentation Tier): Executes on the end user's machine. Its job is rendering graphical UI components (buttons, tables, forms), handling user gestures (clicks, keystrokes), and dispatching network requests.")
    add_bullet(doc, "The Server (Application Tier): Executes in a controlled cloud or data center environment. Its job is enforcing security, processing business rules, orchestrating database transactions, and returning structured data.")
    add_bullet(doc, "Statelessness: Under HTTP, each request sent from the client to the server is completely independent. The server does not automatically 'remember' who sent a previous request unless credentials (such as a session cookie or JWT token) are explicitly attached.")

    add_heading_3(doc, "1.1 The Anatomy of an HTTP Request & Response")
    add_p(doc, "Every network communication between the React frontend and Spring Boot backend adheres to this strict physical structure:")
    
    http_anatomy = """[CLIENT REQUEST ANATOMY]
POST /api/jobs/101/apply HTTP/1.1                <-- Request Line (Verb, Path, Protocol)
Host: localhost:8080                              <-- Target Server Host
Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...   <-- Security Token (Identity & Role)
Content-Type: application/json                    <-- Payload Data Format
Accept: application/json                          <-- Desired Response Format

{                                                 <-- Request Body (Payload)
  "coverLetter": "I have 5 years Java experience."
}

--------------------------------------------------------------------------------

[SERVER RESPONSE ANATOMY]
HTTP/1.1 201 Created                              <-- Status Line (Protocol, Status Code)
Content-Type: application/json                    <-- Returned Data Format
Date: Wed, 16 Sep 2026 14:00:00 GMT              <-- Timestamp

{                                                 <-- Response Body (JSON Entity)
  "id": 45,
  "jobId": 101,
  "status": "APPLIED",
  "appliedAt": "2026-09-16T14:00:00"
}"""
    add_code(doc, http_anatomy, caption="Raw HTTP Request & Response Anatomy in GlobalCo")

    add_heading_3(doc, "1.2 HTTP Verbs & Standard Status Codes")
    http_table_headers = ["HTTP Verb", "Semantic Purpose", "Idempotent?", "GlobalCo Example Endpoint", "Expected Status Code"]
    http_table_data = [
        ["GET", "Retrieve resource(s) without modifying server state.", "YES", "GET /api/jobs/{id}", "200 OK"],
        ["POST", "Create a new resource or execute a non-idempotent action.", "NO", "POST /api/jobs/{id}/apply", "201 Created"],
        ["PUT", "Replace or completely update an existing resource.", "YES", "PUT /api/profiles/me", "200 OK"],
        ["PATCH", "Partially update specific fields of a resource.", "NO", "PATCH /api/recruiter/applications/{id}/status", "200 OK"],
        ["DELETE", "Remove a specific resource from the system.", "YES", "DELETE /api/saved-jobs/{id}", "200 OK / 204 No Content"]
    ]
    add_table(doc, http_table_headers, http_table_data, [Inches(1.0), Inches(2.2), Inches(1.0), Inches(1.8), Inches(1.2)])

    # 2. JAVA & THE JVM RUNTIME
    add_heading_2(doc, "2. Java 21 LTS & The Java Virtual Machine (JVM) Mechanics")
    add_p(doc,
        "Java is a statically-typed, object-oriented programming language designed for platform independence via the "
        "'Write Once, Run Anywhere' (WORA) philosophy.",
        bold_prefix="Why Java: "
    )
    add_bullet(doc, "Compilation to Bytecode: When you run 'mvn compile', Java source code (.java files) is compiled by javac into platform-neutral bytecode (.class files), rather than native machine instructions.")
    add_bullet(doc, "Java Virtual Machine (JVM): The JVM loads, verifies, and executes bytecode. It abstracts away operating system differences (Windows vs Linux vs macOS).")
    add_bullet(doc, "Just-In-Time (JIT) Compiler: The JVM's HotSpot execution engine monitors bytecode execution in real-time. Code paths executed repeatedly ('hot spots') are dynamically compiled into native x86_64 machine code, achieving near C++ performance.")
    add_bullet(doc, "Automated Garbage Collection (GC): Developers do not manually allocate or free memory (unlike C/C++ malloc/free). The JVM's garbage collector automatically tracks object references and frees unreferenced memory on the Heap.")

    add_heading_3(doc, "2.1 JVM Memory Architecture (Heap, Stack, Metaspace)")
    add_bullet(doc, "Stack Memory: Allocated per thread. Stores local primitive variables and references to objects. Stack frames are created when a method is called and popped when the method returns (LIFO order). High speed, fixed size.")
    add_bullet(doc, "Heap Memory: Shared across all threads. All Java objects and JPA entities (e.g., Job, User, Application) reside on the Heap. Managed dynamically by the Garbage Collector.")
    add_bullet(doc, "Metaspace: Native memory region storing class metadata, method bytecode, runtime constant pools, and static variables. Replaced the legacy PermGen in modern Java.")

    # 3. SPRING BOOT & INVERSION OF CONTROL (IoC)
    add_heading_2(doc, "3. Spring Framework & Spring Boot Mechanics")
    add_p(doc,
        "In traditional programming, an object instantiates its own dependencies using the 'new' keyword (e.g., JobService creates new JobRepository()). "
        "This tightly couples classes, making unit testing and swapping implementations impossible. Spring solves this through Inversion of Control (IoC).",
        bold_prefix="The Core Problem: "
    )
    add_bullet(doc, "Inversion of Control (IoC): Control of object creation, configuration, and lifecycle is inverted from the application code to the framework container (the Spring ApplicationContext).")
    add_bullet(doc, "Dependency Injection (DI): The pattern where the IoC container injects dependent objects into a class (via constructor injection or @Autowired field injection) rather than the class creating them itself.")
    add_bullet(doc, "Spring Beans: Any object managed, configured, and instantiated by the Spring IoC container. Annotated with stereotypes: @Component, @Service, @Repository, or @Controller.")

    add_heading_3(doc, "3.1 Complete Spring Bean Lifecycle")
    bean_lifecycle_ascii = """[SPRING BEAN LIFECYCLE PHASES]
1. Bean Definition Loading: Spring scans @ComponentScan packages for annotations.
                    │
2. Instantiation: Spring invokes the Bean constructor using reflection.
                    │
3. Populate Properties: Injects @Autowired dependencies and @Value configurations.
                    │
4. BeanNameAware / BeanFactoryAware: Informs bean of its identifier and owning container.
                    │
5. BeanPostProcessor (Pre-Initialization): Custom modification before initialization.
                    │
6. @PostConstruct / InitializingBean: Executes custom startup logic (e.g., DataInitializer).
                    │
7. BeanPostProcessor (Post-Initialization): Dynamic Proxy generation (e.g., @Transactional proxies).
                    │
8. BEAN READY FOR USE: Serves client requests inside controllers and services.
                    │
9. PreDestroy / DisposableBean: Container shutdown; releases thread pools and database connections."""
    add_code(doc, bean_lifecycle_ascii, caption="Spring Framework Bean Lifecycle from Startup to Shutdown")

    add_heading_3(doc, "3.2 Spring MVC & The DispatcherServlet Request Pipeline")
    add_p(doc, "When an HTTP request enters the Spring Boot application, it is orchestrated through the front controller pattern:")
    
    mvc_pipeline_ascii = """CLIENT HTTP REQUEST
        │
        ▼
[Spring Security Filter Chain]  <-- JwtAuthenticationFilter checks token
        │
        ▼
[DispatcherServlet]             <-- Core Front Controller in Spring WebMVC
        │
   1. HandlerMapping            <-- Identifies target @RestController method
        │
   2. HandlerAdapter            <-- Invokes controller with parameter resolution
        │
   3. Controller Execution      <-- Runs JobController.getJobById(id)
        │
   4. Service Layer             <-- JobService runs business logic
        │
   5. Repository Layer          <-- Spring Data JPA issues SQL query
        │
   6. HttpMessageConverter      <-- Jackson converts Java DTO -> JSON bytes
        │
        ▼
HTTP 200 OK (JSON Payload) TO CLIENT"""
    add_code(doc, mvc_pipeline_ascii, caption="Spring MVC DispatcherServlet Internal Execution Pipeline")

    # 4. REACT & VIRTUAL DOM
    add_heading_2(doc, "4. React 18 & The Modern Frontend Paradigm")
    add_p(doc,
        "React is a declarative, component-based JavaScript library for building user interfaces. Instead of manually manipulating "
        "the browser's Document Object Model (DOM) via document.getElementById(), React lets developers describe what the UI should look like "
        "for a given state, and React automatically updates the browser efficiently.",
        bold_prefix="Core Philosophy: "
    )
    add_bullet(doc, "The Real DOM Bottleneck: The browser's DOM is a tree representation of HTML elements. Directly reading and writing to the real DOM (e.g., creating 500 table rows) causes expensive browser reflows and repaints, resulting in UI lag.")
    add_bullet(doc, "The Virtual DOM: React maintains a lightweight, in-memory JavaScript representation of the real DOM. When state changes, React creates a new Virtual DOM tree.")
    add_bullet(doc, "Reconciliation & Diffing Algorithm: React compares the new Virtual DOM with the previous snapshot using a heuristic O(N) diffing algorithm. It calculates the minimum set of mutations needed and applies them in a single batch to the real DOM.")
    add_bullet(doc, "React Fiber Architecture: React 18's underlying reconciliation engine. It enables concurrent rendering by breaking rendering work into incremental units (fibers) that can be paused, prioritized, or aborted, ensuring the browser main thread never freezes.")

    add_heading_3(doc, "4.1 React Hooks in GlobalCo")
    add_bullet(doc, "useState: Manages component-local reactive state (e.g., search keywords, loading spinners, form inputs). Triggers re-renders upon state mutation.")
    add_bullet(doc, "useEffect: Executes side-effects after rendering (e.g., fetching job lists from /api/jobs when the page loads, setting up timers, synchronizing localStorage).")
    add_bullet(doc, "useContext: Consumes shared global state across the component tree without 'prop drilling'. Used in AuthContext to provide user profile, token, and login/logout methods to any screen.")
    add_bullet(doc, "useMemo & useCallback: Performance optimization hooks that cache expensive calculations or memoize callback function references to prevent unnecessary child re-renders.")

    # 5. RELATIONAL DATABASE & NORMALIZATION
    add_heading_2(doc, "5. Relational Databases, Normalization & ACID Guarantees")
    add_p(doc,
        "A Relational Database Management System (RDBMS) organizes structured data into tables consisting of rows (records) and columns (attributes). "
        "Relationships between tables are enforced mathematically using Primary Keys and Foreign Keys.",
        bold_prefix="Core Principles: "
    )
    add_bullet(doc, "Primary Key (PK): An attribute or set of attributes that uniquely identifies each row in a table (e.g., id in users table). Cannot be NULL.")
    add_bullet(doc, "Foreign Key (FK): An attribute in one table that references the Primary Key of another table (e.g., candidate_id in applications references id in users), establishing referential integrity.")
    add_bullet(doc, "Cascading Operations: Dictates what occurs when a referenced parent record is deleted or updated (e.g., CASCADE deletes child records; RESTRICT blocks parent deletion if children exist).")

    add_heading_3(doc, "5.1 Database Normalization: 1NF, 2NF, and 3NF")
    norm_headers = ["Normal Form", "Mathematical Rule / Requirement", "Problem It Prevents", "GlobalCo Implementation"]
    norm_data = [
        ["1NF (First Normal Form)", "Each table column must contain atomic (indivisible) values; no repeating groups or arrays.", "Cannot query or index individual items inside comma-separated text.", "Skills are not stored as 'Java, React' strings; they are isolated in a separate skills table."],
        ["2NF (Second Normal Form)", "Must be in 1NF and all non-key attributes must depend on the ENTIRE primary key (no partial dependencies).", "Redundant repetition of data in composite key tables.", "Application record contains only candidate_id, job_id, and status; candidate name is not duplicated."],
        ["3NF (Third Normal Form)", "Must be in 2NF and no transitive dependencies (non-key attribute depends on another non-key attribute).", "Update anomalies (updating company name requires updating 1,000 job rows).", "Company details (website, logo) are normalized into companies; jobs table holds only company_id FK."]
    ]
    add_table(doc, norm_headers, norm_data, [Inches(1.5), Inches(2.2), Inches(1.8), Inches(1.7)])

    add_heading_3(doc, "5.2 ACID Properties Explained with Recruitment Workflows")
    acid_headers = ["ACID Property", "Engineering Definition", "Recruitment Domain Concrete Example"]
    acid_data = [
        ["Atomicity ('All or Nothing')", "A transaction must complete in its entirety or roll back completely. No partial state is ever saved.", "When applying for a job, both the Application entity and Notification record must be saved. If notification creation fails, the application insert rolls back."],
        ["Consistency ('Rules Enforced')", "A transaction brings the database from one valid state to another, satisfying all constraints, cascades, and triggers.", "Database enforces UNIQUE (job_id, candidate_id). Under concurrent apply requests, the database rejects the second request, preserving integrity."],
        ["Isolation ('Concurrent Independence')", "Concurrent execution of transactions results in a system state that would be obtained if executed serially.", "Two recruiters updating candidate statuses simultaneously cannot corrupt each other's audit logs or write dirty reads."],
        ["Durability ('Survives Crashes')", "Once a transaction commits, its effects are permanent and will not be lost even if power fails immediately after.", "When an offer is accepted by a candidate, the status change is written to database transaction logs and disk, surviving JVM restarts."]
    ]
    add_table(doc, acid_headers, acid_data, [Inches(1.5), Inches(2.3), Inches(3.4)])

    # 6. ORM & HIBERNATE INTERNALS
    add_heading_2(doc, "6. Object-Relational Mapping (ORM) & Hibernate Mechanics")
    add_p(doc,
        "Object-Oriented programming languages represent data as rich object graphs with inheritance, encapsulation, and polymorphism. "
        "Relational databases represent data as two-dimensional tables governed by mathematical set theory. "
        "This conceptual divide is called the Object-Relational Impedance Mismatch. Hibernate bridges this gap.",
        bold_prefix="The Impedance Mismatch: "
    )
    add_bullet(doc, "JPA (Java Persistence API): The standard Java specification (interfaces) defining how Java objects map to relational databases.")
    add_bullet(doc, "Hibernate: The concrete implementation of the JPA specification bundled inside Spring Boot.")
    add_bullet(doc, "Persistence Context (First-Level Cache): An in-memory cache of managed entity instances. Within a single transaction, fetching the same entity twice returns the identical Java memory reference without re-querying the database.")
    add_bullet(doc, "Dirty Checking: At the end of a transaction, Hibernate automatically compares the current state of managed entities against their initial snapshot. Any modified attributes generate SQL UPDATE statements automatically, without calling repository.save().")

    # 7. REST ARCHITECTURE (ROY FIELDING'S CONSTRAINTS)
    add_heading_2(doc, "7. REST Architectural Constraints & Principles")
    add_p(doc,
        "Representational State Transfer (REST) is an architectural style for distributed hypermedia systems introduced by Roy Fielding in 2000. "
        "GlobalCo adheres strictly to its foundational constraints:",
        bold_prefix="REST Definition: "
    )
    add_bullet(doc, "Client-Server Separation: User interface concerns are completely separated from data storage concerns. The React frontend can be redesigned or replaced with a mobile app without touching the Spring Boot backend.")
    add_bullet(doc, "Statelessness: The server never stores client session state. Every request contains all information necessary to authenticate and fulfill it (via JWT Bearer tokens).")
    add_bullet(doc, "Cacheability: Responses must explicitly label themselves as cacheable or non-cacheable to prevent clients from reusing stale requisition data.")
    add_bullet(doc, "Uniform Interface: Resources are identified by URIs (e.g., /api/jobs/42), manipulated through representations (JSON), and self-descriptive messages (MIME types).")
    add_bullet(doc, "Layered System: Clients cannot tell whether they are connected directly to the end server or to an intermediary (e.g., reverse proxy, load balancer, CDN).")

    # 8. CRYPTOGRAPHY & AUTHENTICATION (JWT & BCRYPT)
    add_heading_2(doc, "8. Cryptographic Foundations: JWT & BCrypt Password Hashing")
    add_heading_3(doc, "8.1 JSON Web Token (JWT) Anatomy & Signing Math")
    add_p(doc,
        "A JSON Web Token consists of three parts separated by periods (.): Header, Payload, and Signature.\n"
        "Format: xxxxx.yyyyy.zzzzz",
        bold_prefix="Token Anatomy: "
    )
    add_bullet(doc, "Header: Identifies the token type ('JWT') and cryptographic signing algorithm ('HS256' for HMAC-SHA256). Base64Url-encoded.")
    add_bullet(doc, "Payload: Contains claims—statements about an entity (e.g., sub: 'riya.backend', userId: 2, roles: ['ROLE_CANDIDATE'], exp: 1773667200). Base64Url-encoded.")
    add_bullet(doc, "Signature: Calculated by taking the encoded header, the encoded payload, a secret key known only to the backend, and signing it using the specified algorithm:\nSignature = HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secretKey)")
    add_callout(doc,
        "CRITICAL SECURITY PRINCIPLE: JWTs are SIGNED, NOT ENCRYPTED!\n"
        "Base64Url encoding is NOT encryption. Anyone who intercepts a JWT can decode the header and payload in plaintext. "
        "However, they CANNOT modify any claim (such as changing their role from ROLE_CANDIDATE to ROLE_ADMIN) without invalidating the cryptographic signature. "
        "Because the attacker does not possess the 256-bit server secret key, any modified token is immediately rejected by JwtAuthenticationFilter.",
        title="CRYPTOGRAPHIC INTEGRITY VS CONFIDENTIALITY", box_type="warn"
    )

    add_heading_3(doc, "8.2 BCrypt Hashing vs Plaintext & Fast Hashes")
    add_p(doc,
        "Storing passwords in plaintext is a catastrophic security violation. Storing them using fast cryptographic hashes "
        "(like MD5 or SHA-256) is equally dangerous because modern GPUs can compute billions of SHA-256 hashes per second, "
        "allowing attackers to reverse passwords using precomputed Rainbow Tables. GlobalCo uses BCrypt.",
        bold_prefix="Password Security: "
    )
    add_bullet(doc, "Cryptographic Salting: BCrypt automatically generates a unique, cryptographically random 128-bit salt for every password before hashing. Even if 100 users have the password 'Password@123', all 100 resulting hash strings in the database will look completely different, rendering rainbow tables useless.")
    add_bullet(doc, "Adaptive Work Factor (Cost Factor): BCrypt is intentionally slow and computationally expensive. In GlobalCo, a work factor of 10 is used, meaning the key derivation algorithm executes 2^10 = 1,024 iterations. This makes brute-force dictionary attacks economically infeasible for attackers.")
    add_bullet(doc, "One-Way Function: It is mathematically impossible to decrypt a BCrypt hash back into the original password. Verification works by taking the candidate's input password, combining it with the salt extracted from the stored hash, running the algorithm, and comparing the resulting hash.")
    
    doc.add_page_break()
