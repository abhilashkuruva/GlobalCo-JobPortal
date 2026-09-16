# Project Explanation

## Problem Statement
Build a recruitment platform that supports realistic recruiting workflows similar to modern job portals (LinkedIn, Indeed). The goal is to manage the lifecycle of job postings, candidate applications, interviews, and offers within a secure, role-based environment.

## Industry Background
Modern recruitment relies on Applicant Tracking Systems (ATS) to handle high volumes of data. Key features include skill-based filtering (Match Score), structured interview feedback, and clear audit trails for compliance.

## Recruitment Workflow (high level)
- Recruiter publishes jobs (Draft/Published).
- Candidate searches jobs using keyword and location filters.
- Candidate applies to jobs.
- Recruiter views applicants, shortlists/rejects.
- Recruiter schedules interviews (date/time/meeting link).
- Recruiter records interview feedback and a numeric score.
- Hiring Manager reviews candidates who have completed interviews.
- Recruiter creates offers.
- Candidate accepts/rejects offers.
- Admin can manage users/roles and moderate platform.

## Role Analysis
- **Candidate**: Job seekers. Focused on search, profile management, and tracking.
- **Recruiter**: Job creators. Focused on pipeline management and coordination.
- **Hiring Manager**: Decision makers. Focused on final candidate approval.
- **Admin**: System controllers. Focused on user management and platform health.

## Business Logic
### Resume-Job Match Score
Implemented in `JobService.calculateMatchScore`. It performs a case-insensitive intersection of the `job_skills` and `candidate_skills`. 
`Score = (Matched Skills / Total Job Skills) * 100`. This provides an objective, keyword-based initial screening.

### Profile Completion
Implemented in `CandidateProfileService`. Assigns point values to specific fields (Summary, Resume, Skills, etc.) to calculate a percentage. This encourages candidates to provide full details.

## Authentication Flow (JWT)
- Register -> BCrypt password hashing -> JWT issued on login.
- Frontend stores token (in memory/localStorage) and sends `Authorization: Bearer <token>`.
- Backend validates token via `JwtAuthenticationFilter`.

## Application Workflow (State Machine)
Applications move through statuses: `APPLIED` -> `SCREENING` -> `SHORTLISTED` -> `INTERVIEW_SCHEDULED` -> `SELECTED` -> `OFFER_SENT` -> `OFFER_ACCEPTED` -> `HIRED`. Rejecting a candidate at any stage sets status to `REJECTED`.

## Audit Logging
Managed by `AuditLogService`. Records security events (Login/Logout) and critical recruitment events (Job Creation, Offer acceptance) for administrative oversight.

## Notification System
Managed by `NotificationService`. Alerts users in real-time when application statuses change or interviews are scheduled, ensuring a responsive user experience.

## Backend Architecture
Standard Layered Architecture:
- **Entity Layer**: JPA/Hibernate mappings representing the relational database.
- **Repository Layer**: Data Access Object (DAO) layer using Spring Data JPA for boilerplate-free CRUD.
- **Service Layer**: Core business logic (Match scores, Offer logic, Security processing).
- **Controller Layer**: RESTful API endpoints handling HTTP requests and JSON responses.
- **Security Layer**: Custom Spring Security configuration for JWT and RBAC.

## Frontend Architecture
Component-Based SPA (Single Page Application) using React 18:
- **Pages**: Functional components mapped to routes.
- **Components**: Reusable UI elements (Modals, Navbars).
- **API Client**: Centralized Axios instance with a request interceptor to handle JWT headers.
- **Routing**: React Router DOM with `PrivateRoute` guards for authenticated paths.

## Package Explanations
- `com.globalco.jobboard.controller`: REST API entry points.
- `com.globalco.jobboard.service`: Implementation of business rules.
- `com.globalco.jobboard.repository`: Interfaces for DB communication.
- `com.globalco.jobboard.entity`: Database table mappings.
- `com.globalco.jobboard.security`: Auth configuration and JWT utility.
- `com.globalco.jobboard.exception`: Centralized error handling.

## Table Explanations
- `users`: Core authentication data.
- `roles`: Role definitions (RBAC).
- `candidate_profiles`: Professional history and metadata for seekers.
- `jobs`: Postings created by recruiters.
- `skills`: Lookup table for technologies.
- `job_skills`/`candidate_skills`: M:N mappings for match scoring.
- `applications`: The link between seekers and postings.
- `interviews`: Scheduling and feedback records.
- `offers`: Final package details and candidate responses.
- `audit_logs`: Tracking system-wide events.
