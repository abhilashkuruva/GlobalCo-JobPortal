# Database Design

This document describes schema, relationships, normalization, and indexes.

See `db/schema.sql` for the authoritative definitions.

## Core Relationships
- users -> candidate_profiles (1:1)
- companies -> jobs (1:N)
- jobs -> applications (1:N)
- users (candidate) -> applications (1:N)
- applications -> interviews (1:N)
- applications -> offers (1:1)
- users -> candidate_skills (M:N via join table)
- candidate_profiles -> education/experience/projects/certifications (1:N)
- users -> resumes (1:1)
- users -> saved_jobs (M:N)

## Normalization Explanation
The database is designed to **3rd Normal Form (3NF)**:
- **1NF**: Atomic values (e.g., separate tables for Education/Experience rather than comma-separated lists in profile).
- **2NF**: No partial dependencies (all non-key columns in mapping tables depend on the full composite primary key).
- **3NF**: No transitive dependencies (e.g., Company details are stored in `companies` and referenced by ID in `jobs`, rather than repeating company info for every job).

## ER Diagram (Conceptual)
```text
[Roles] 1 --- N [Users] 1 --- 1 [Candidate Profiles]
                      1          | 1
                      |          |--- N [Education]
                      |          |--- N [Experience]
                      |          |--- N [Certifications]
                      |
                      N --- N [Saved Jobs] --- N [Jobs]
                      |                          |
                      |--- N [Audit Logs]        | 1
                      |--- N [Notifications]     |
                                                 | N
                                          [Applications] 1 --- 1 [Offers]
                                                 | 1
                                                 | N
                                           [Interviews]
```

## Indexes
- `idx_job_title`: Accelerates job search by keyword.
- `idx_job_location`: Accelerates location-based filtering.
- `idx_job_status`: Efficiently filters only 'PUBLISHED' jobs for candidates.
- `idx_app_status`: Helps recruiters filter candidates in the pipeline (e.g., finding only 'SHORTLISTED' applicants).

## Match Score Inputs
- job_skills: job required skills list
- candidate_skills: candidate skill list
- score = matched(jobSkills ∩ candidateSkills) / jobSkills.length
