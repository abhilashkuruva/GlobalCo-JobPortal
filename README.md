# GlobalCo JobBoard — Enterprise Recruitment & Intelligent ATS Platform

A modern, production-ready, full-stack recruitment platform built on **Java 21 + Spring Boot 3.2.3** and **React 18 + Vite 7 + Tailwind CSS**, featuring an algorithmic **Candidate-Job Match Engine**, comprehensive **ATS Hiring Pipeline**, and an accessible **Red & White** visual identity.

---

## 🚀 Key Highlights & Capabilities

### 1. Unified Backend Architecture (`Java 21`, `Spring Boot 3.2.3`)
- **Security & RBAC**: Stateless JWT Bearer authentication with role-based access control supporting `ROLE_CANDIDATE`, `ROLE_RECRUITER`, and `ROLE_ADMIN`.
- **Intelligent Match Engine**: Multi-factor candidate scoring algorithm weighting skill overlap (50%), experience level compatibility (25%), and location/work mode fit (25%) with transparent percentage breakdowns.
- **Recruitment ATS Pipeline**: Complete state transitions from `APPLIED` → `SCREENING` → `SHORTLISTED` → `INTERVIEW_SCHEDULED` → `SELECTED` → `OFFER_SENT` → `OFFER_ACCEPTED` / `OFFER_DECLINED` / `REJECTED`.
- **Zero-Setup Default**: Pre-configured with H2 in-memory persistence and rich seed data for instant, zero-friction execution. Full MySQL 8 production configuration is ready via profile toggle.
- **RESTful API Surface**: 14 modular Spring REST controllers with complete request validation, global exception handling, and OpenApi/Swagger documentation.

### 2. Modern Red & White Visual Identity (`React 18`, `Tailwind CSS`)
- **Curated Palette**: Crimson Red (`#DC2626`, `#B91C1C`), soft rose surfaces (`#FEF2F2`), crisp slate typography (`#0F172A`), and clean cards.
- **Zero Placeholders**: Every button, modal, toggle, and filter is fully functional and connected to real backend endpoints.
- **1-Click Demo Logins**: Instant credential autofill on the Sign In page for Candidate, Recruiter, and Admin personas.

---

## 👥 Personas & Workflows

### 🎯 Candidate Persona
- **Multi-faceted Job Search**: Search by keyword, location, experience levels, and work modes (Remote, Hybrid, On-site).
- **Match Score Breakdown**: View real-time compatibility score with percentage breakdown across technical skills, experience, and location.
- **1-Click Apply**: Submit job applications instantly with duplicate-prevention safeguards.
- **Bookmark / Saved Jobs**: Bookmark opportunities with instant optimistic state synchronization and a dedicated Saved Jobs cockpit.
- **Live Application Tracking**: Real-time pipeline tracker with application withdrawal and offer acceptance/declination actions.
- **Profile & Resume Center**: Manage headline, summary, years of experience, expected salary, interactive technical skills manager, and resume upload/parsing simulator.

### 👔 Recruiter / ATS Persona
- **Hiring Command Cockpit**: Overview of active requisitions, total applicants, shortlisted talent, and upcoming interview schedules.
- **Post Opportunity**: Create and publish job openings with title, company, category, work mode, compensation range, and required skills tags.
- **Full ATS Pipeline**: Filter applicants by stage, view match scores, advance candidate status, schedule interviews with Google Meet links, and generate formal offer letters.
- **Candidate Export**: Export applicant rosters for any requisition directly to CSV.

### 🛡️ Administrator Persona
- **Platform Governance**: System KPI overview (total users, active openings, submitted applications, offers).
- **User Moderation**: View all registered accounts and activate or suspend user access in 1 click.
- **Job Moderation**: Oversight of live job postings with moderation deletion capabilities.
- **Audit Stream**: Security and critical recruitment event logging.

---

## 🔑 Demo Accounts (Pre-Seeded)

| Persona | Username | Password | Role | Primary Cockpit |
| :--- | :--- | :--- | :--- | :--- |
| **Candidate** | `riya.backend` | `Password@123` | `ROLE_CANDIDATE` | `/candidate/dashboard` |
| **Recruiter** | `mira.recruiter` | `Password@123` | `ROLE_RECRUITER` | `/recruiter/dashboard` |
| **Administrator** | `admin` | `Password@123` | `ROLE_ADMIN` | `/admin/dashboard` |

> 💡 *Note: The login page features 1-click quick autofill pills for all demo personas.*

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.2.3
- **Data & ORM**: Spring Data JPA, Hibernate 6, H2 Database (default) / MySQL 8
- **Security**: Spring Security 6.2, JJWT 0.12.5 (HMAC-SHA256)
- **API Documentation**: Springdoc OpenAPI / Swagger UI 2.3.0
- **Testing**: JUnit 5, Mockito, Spring Boot Test

### Frontend
- **Runtime & Build**: Node.js, Vite 7
- **UI Library**: React 18
- **Styling**: Tailwind CSS (Red & White Design System)
- **Icons**: Lucide React
- **HTTP Client**: Axios with interceptors for JWT Bearer attachment
- **Routing**: React Router v6 with Role-Based Route Guards (`RequireAuth`)

---

## 📁 Clean Repository Structure

```text
GlobalCo-JobBoard/
├── .github/                       # GitHub Actions workflows & PR templates
├── .gitignore                     # Production Git ignore for Java, Node, Python, and OS artifacts
├── README.md                      # Primary project overview, quick start & API directory
├── Project_Master_Preparation_Notes.docx  # Exhaustive 45+ section Master Viva & Interview Manual
│
├── backend/                       # Java 21 & Spring Boot 3.2.3 Backend API
│   ├── .gitignore                 # Backend-specific ignore rules
│   ├── pom.xml                    # Maven build file with dependencies
│   └── src/
│       ├── main/
│       │   ├── java/com/jobboard/
│       │   │   ├── config/        # Swagger / OpenAPI & system configurations
│       │   │   ├── controller/    # 14 RESTful controllers (Jobs, Auth, ATS, Admin, etc.)
│       │   │   ├── dto/           # Request/Response Data Transfer Objects with validation
│       │   │   ├── entity/        # 13 JPA entities mapped to relational database
│       │   │   ├── exception/     # GlobalExceptionHandler & custom domain exceptions
│       │   │   ├── repository/    # 13 Spring Data JPA repositories with custom queries
│       │   │   ├── security/      # Spring Security 6, JWT filter & UserDetailsService
│       │   │   ├── service/       # 11 Domain services (Matching, ATS, Auth, etc.)
│       │   │   └── JobBoardApplication.java  # Main Spring Boot entrypoint
│       │   └── resources/
│       │       └── application.properties    # H2 / MySQL profile configurations
│       └── test/
│           └── java/com/jobboard/ # 11 Automated unit & integration tests
│
├── frontend/                      # React 18 + Vite 7 + Tailwind CSS Client
│   ├── .gitignore                 # Frontend-specific ignore rules
│   ├── index.html                 # Single-page application root HTML
│   ├── package.json               # Frontend dependencies & build scripts
│   ├── vite.config.js             # Vite 7 build configuration
│   ├── tailwind.config.js         # Curated Red & White design system tokens
│   ├── postcss.config.js          # PostCSS autoprefixer pipeline
│   └── src/
│       ├── components/            # Reusable UI components (Navbar, Footer, JobCard, etc.)
│       ├── contexts/              # Global state (AuthContext with token persistence)
│       ├── pages/                 # Role-based pages (Home, Auth, Jobs, Candidate, Recruiter, Admin)
│       ├── routes/                # Centralized route definitions & RequireAuth guards
│       ├── services/              # Modular Axios API services with JWT interceptors
│       ├── App.jsx                # Root application layout shell
│       ├── main.jsx               # React DOM root entrypoint
│       └── index.css              # Custom styling, scrollbars & badge utility classes
│
├── database/                      # Relational Database SQL Scripts
│   ├── schema.sql                 # Complete 3NF DDL schema with constraints & indexes
│   └── sample_data.sql            # Seed dataset for users, jobs, applications, and skills
│
├── devops/                        # Infrastructure & Deployment Automation
│   ├── docker-compose.yml         # MySQL 8 + phpMyAdmin zero-friction local stack
│   └── README.md                  # Container management instructions
│
├── docs/                          # Architectural & Technical Documentation
│   ├── API_DOCUMENTATION.md       # Detailed REST endpoints specifications
│   ├── DATABASE_DESIGN.md         # Schema rationale & normalization breakdown
│   ├── EXECUTION_GUIDE.md         # Step-by-step local execution walkthrough
│   ├── PROJECT_EXPLANATION.md     # Deep conceptual overview of project architecture
│   ├── REVIEW_GUIDE.md            # Comprehensive viva & project review checklist
│   └── JobPortal.postman_collection.json # Postman API test collection
│
├── scripts/                       # Automation & verification scripts
│   └── test_seekers_json.ps1      # PowerShell API diagnostic test script
│
└── uploads/                       # File upload directories (resumes & documents)
    ├── resumes/                   # Candidate uploaded PDF/Word resumes
    └── verification_docs/         # Recruiter enterprise verification documents
```

---

## ⚡ Quick Start & Execution

### 1. Prerequisites
- **Java**: JDK 21+ installed and available on `PATH`.
- **Maven**: 3.8+ installed (or use `./mvnw`).
- **Node.js**: 18+ and `npm`.

### 2. Start Backend Server
```bash
cd backend
mvn clean test             # Run automated test suite
mvn spring-boot:run        # Starts API on http://localhost:8080
```
- **Swagger Documentation**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **H2 Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (`jdbc:h2:mem:jobboard_db`, user: `sa`, password: `password`)

### 3. Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev                # Starts UI on http://localhost:5173
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

The backend includes comprehensive unit and integration test coverage across authentication, job matching, candidate profiles, and recruitment workflows:

```bash
cd backend
mvn clean test
```

### Test Suite Summary:
```text
[INFO] Running com.jobboard.ApplicationServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.jobboard.AuthServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.jobboard.CandidateProfileServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.jobboard.JobServiceTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] Results:
[INFO] Tests run: 11, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

Frontend bundle validation:
```bash
cd frontend
npm run build
# Produces optimized production bundle in /dist with 0 errors
```

---

## 📡 REST API Directory

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new candidate or recruiter |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/api/jobs` | Public | Filtered and paginated job search |
| `GET` | `/api/jobs/{id}` | Public | Detailed job requisition metadata |
| `GET` | `/api/jobs/{id}/match` | Candidate | Algorithmic candidate-to-job match breakdown |
| `POST` | `/api/jobs/{id}/apply` | Candidate | 1-click job application submission |
| `GET` | `/api/saved-jobs` | Candidate | List bookmarked jobs |
| `POST` | `/api/saved-jobs/{id}` | Candidate | Bookmark a job |
| `DELETE` | `/api/saved-jobs/{id}` | Candidate | Remove bookmark |
| `GET` | `/api/applications/my-applications` | Candidate | Candidate's active applications |
| `POST` | `/api/applications/{id}/withdraw` | Candidate | Withdraw submitted application |
| `PUT` | `/api/offers/{id}/respond` | Candidate | Accept or decline formal job offer |
| `GET` | `/api/profiles/me` | Candidate | Fetch candidate profile & skills |
| `PUT` | `/api/profiles/me` | Candidate | Update candidate profile & skills |
| `POST` | `/api/recruiter/jobs` | Recruiter | Post new job opening |
| `GET` | `/api/recruiter/my-jobs` | Recruiter | Requisitions managed by recruiter |
| `GET` | `/api/recruiter/jobs/{id}/applicants` | Recruiter | ATS applicant pipeline for specific role |
| `PUT` | `/api/recruiter/applications/{id}/status` | Recruiter | Move candidate stage in ATS |
| `GET` | `/api/recruiter/jobs/{id}/export-applicants` | Recruiter | Download applicants list as CSV |
| `POST` | `/api/interviews/schedule` | Recruiter | Schedule interview with meeting details |
| `POST` | `/api/offers` | Recruiter | Issue formal compensation offer |
| `GET` | `/api/admin/stats` | Admin | Platform-wide KPI metrics |
| `GET` | `/api/admin/users` | Admin | User directory and status |
| `PUT` | `/api/admin/users/{id}/toggle-status` | Admin | Activate or suspend user account |
| `GET` | `/api/admin/logs` | Admin | System audit trail |

---

## 📄 License
This project is licensed under the MIT License.
