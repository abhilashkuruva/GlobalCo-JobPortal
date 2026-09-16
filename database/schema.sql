CREATE DATABASE IF NOT EXISTS job_portal_db;
USE job_portal_db;

-- 1. Roles Table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    role_id BIGINT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Companies Table
CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    location VARCHAR(100),
    logo_url VARCHAR(255)
);

-- 4. Candidate Profiles Table
CREATE TABLE candidate_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    summary TEXT,
    location VARCHAR(100),
    total_experience_years INT,
    current_job_title VARCHAR(100),
    expected_salary DECIMAL(15, 2),
    profile_completion_percentage INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Jobs Table
CREATE TABLE jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_id BIGINT NOT NULL,
    recruiter_id BIGINT NOT NULL,
    location VARCHAR(100),
    job_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'),
    work_mode ENUM('REMOTE', 'HYBRID', 'ON_SITE'),
    salary_min DECIMAL(15, 2),
    salary_max DECIMAL(15, 2),
    experience_required INT,
    status ENUM('DRAFT', 'PUBLISHED', 'EXPIRED', 'ARCHIVED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (recruiter_id) REFERENCES users(id)
);

-- 6. Skills Table
CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 7. Job Skills (Mapping)
CREATE TABLE job_skills (
    job_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 8. Candidate Skills (Mapping)
CREATE TABLE candidate_skills (
    candidate_profile_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (candidate_profile_id, skill_id),
    FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 9. Applications Table
CREATE TABLE applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    status ENUM('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'OFFER_SENT', 'REJECTED', 'WITHDRAWN') DEFAULT 'APPLIED',
    match_score DECIMAL(5, 2),
    resume_url VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (candidate_id) REFERENCES users(id)
);

-- 10. Interviews Table
CREATE TABLE interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    interviewer_id BIGINT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    meeting_link VARCHAR(255),
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') DEFAULT 'SCHEDULED',
    feedback TEXT,
    score INT,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (interviewer_id) REFERENCES users(id)
);

-- 11. Offers Table
CREATE TABLE offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNIQUE NOT NULL,
    offer_letter_url VARCHAR(255),
    salary_offered DECIMAL(15, 2),
    joining_date DATE,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

-- 12. Saved Jobs
CREATE TABLE saved_jobs (
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, job_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 13. Audit Logs
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 14. Notifications
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 15. Categories
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Add category_id to jobs
ALTER TABLE jobs ADD COLUMN category_id BIGINT;
ALTER TABLE jobs ADD FOREIGN KEY (category_id) REFERENCES categories(id);

-- 16. Education
CREATE TABLE education (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_profile_id BIGINT NOT NULL,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(100),
    field_of_study VARCHAR(100),
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 17. Experience
CREATE TABLE experience (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    candidate_profile_id BIGINT NOT NULL,
    company VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- Indexes for Search Performance
CREATE INDEX idx_job_title ON jobs(title);
CREATE INDEX idx_job_location ON jobs(location);
CREATE INDEX idx_job_status ON jobs(status);
CREATE INDEX idx_app_status ON applications(status);