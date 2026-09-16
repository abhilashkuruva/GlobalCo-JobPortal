# Execution Guide

## 1) Prerequisites
- MySQL 8
- Java 21
- Maven
- Node.js 18+

## 2) Database Setup
1. Ensure MySQL is running on port 3306.
2. Update `backend/src/main/resources/application.properties` with your MySQL username and password if they differ from `root/password`.

Commands (run in MySQL client):
```sql
CREATE DATABASE IF NOT EXISTS job_portal_db;
USE job_portal_db;
SOURCE db/schema.sql;
SOURCE db/sample_data.sql;
```
Then load:
- `db/schema.sql`
- `db/sample_data.sql`

## 3) Backend Commands
From repository root:
```bat
mvn -q -DskipTests=false test
mvn -q spring-boot:run
```
Backend runs at: `http://localhost:8080`

Swagger UI:
- `http://localhost:8080/swagger-ui.html`

## 4) Frontend Commands
```bat
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

## 5) Testing
Run:
```bat
mvn -q test
```

## 6) Verification Queries (MySQL)
```sql
USE job_portal_db;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM jobs;
SELECT COUNT(*) FROM applications;
```

## 7) Troubleshooting
- If JWT auth fails: verify `JWT_SECRET` in backend env/properties.
- If DB connection fails: verify MySQL host/port and credentials.
