USE job_portal_db;

-- Insert Roles
INSERT INTO roles (name) VALUES ('ROLE_CANDIDATE'), ('ROLE_RECRUITER'), ('ROLE_HIRING_MANAGER'), ('ROLE_ADMIN');

-- Insert Skills
INSERT INTO skills (name) VALUES ('Java'), ('Spring Boot'), ('React'), ('MySQL'), ('JavaScript'), ('AWS'), ('Docker');

-- Insert Admin User (Password is 'password' encoded via BCrypt)
INSERT INTO users (username, email, password, first_name, last_name, role_id) 
VALUES ('admin', 'admin@globalco.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00dmxs.TVuHOn2', 'System', 'Admin', 4);

-- Insert Recruiter
INSERT INTO users (username, email, password, first_name, last_name, role_id) 
VALUES ('recruiter1', 'hr@globalco.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00dmxs.TVuHOn2', 'John', 'Recruiter', 2);

-- Insert Candidate
INSERT INTO users (username, email, password, first_name, last_name, role_id) 
VALUES ('candidate1', 'jane.doe@email.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00dmxs.TVuHOn2', 'Jane', 'Doe', 1);

-- Insert Company
INSERT INTO companies (name, description, website, location)
VALUES ('GlobalCo Tech', 'Leading software solutions provider.', 'https://globalco.com', 'San Francisco');

-- Insert a Job
INSERT INTO jobs (title, description, company_id, recruiter_id, location, job_type, work_mode, salary_min, salary_max, experience_required, status)
VALUES ('Senior Java Developer', 'Work on enterprise Spring Boot apps.', 1, 2, 'Remote', 'FULL_TIME', 'REMOTE', 100000, 150000, 5, 'PUBLISHED');

-- Map Skills to Job
INSERT INTO job_skills (job_id, skill_id) VALUES (1, 1), (1, 2), (1, 4); -- Java, Spring Boot, MySQL

-- Create Candidate Profile
INSERT INTO candidate_profiles (user_id, summary, location, total_experience_years, current_job_title, expected_salary)
VALUES (3, 'Experienced full stack developer.', 'New York', 4, 'Software Engineer', 120000);

-- Map Skills to Candidate
INSERT INTO candidate_skills (candidate_profile_id, skill_id) VALUES (1, 1), (1, 3); -- Java, React