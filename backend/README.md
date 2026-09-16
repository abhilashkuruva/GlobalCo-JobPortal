# GlobalCo JobBoard — Backend Service

Spring Boot 3.2.3 and Java 21 RESTful recruitment and applicant tracking API.

---

## 🛠️ Tech Stack & Architecture

- **Java Version**: 21 (LTS)
- **Framework**: Spring Boot 3.2.3
- **ORM & Data**: Spring Data JPA, Hibernate 6
- **Database**: MySQL 8 / H2 in-memory
- **Security**: Spring Security 6.2, Stateless JWT (HMAC-SHA256)
- **Documentation**: Springdoc OpenAPI / Swagger UI (`/swagger-ui.html`)
- **Testing**: JUnit 5, Mockito, Spring Boot Test

---

## 📂 Package Structure

```text
com.jobboard
├── JobBoardApplication.java  # Main Application Entry Point
├── config/                   # CORS, Swagger/OpenAPI, DataInitializer
├── controller/               # 14 REST Controllers (Auth, Jobs, Applications, Admin, etc.)
├── dto/                      # Data Transfer Objects & request validation
├── entity/                   # 13 JPA Entities (User, Job, Application, Offer, etc.)
├── exception/                # GlobalExceptionHandler and custom domain exceptions
├── repository/               # 13 Spring Data JPA Repositories
├── security/                 # JWT Authentication Filter, CustomUserDetailsService, SecurityConfig
├── service/                  # Core Business Services (Auth, Job, Application, Interview, etc.)
└── util/                     # Helper utilities
```

---

## 🚀 Running Locally

### Prerequisites
- JDK 21 installed and configured on `PATH`
- Maven 3.8+
- MySQL 8 running locally on port 3306 (or started via Docker Compose)

### 1. Build and Run Tests
```bash
mvn clean test
```

### 2. Start Application
```bash
mvn spring-boot:run
```

The server starts on port `8080`.

- **API Base**: `http://localhost:8080/api`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema**: `http://localhost:8080/v3/api-docs`

---

## 🔑 Pre-Seeded Personas

| Role | Username | Password |
| :--- | :--- | :--- |
| Candidate | `riya.backend` | `Password@123` |
| Recruiter | `mira.recruiter` | `Password@123` |
| Administrator | `admin` | `Password@123` |
