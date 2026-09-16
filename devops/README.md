# DevOps & Infrastructure Guide

This directory contains containerization and infrastructure configuration for **GlobalCo JobBoard**.

## 1. Local MySQL 8 Environment via Docker Compose

To run a production-grade MySQL 8 instance preloaded with schema and seed data:

```bash
# From project root
docker-compose -f devops/docker-compose.yml up -d
```

### Services Started:
- **MySQL 8 Database**: Port `3306`
  - Database: `jobboard_db`
  - User: `jobboard_user`
  - Password: `jobboard_password`
  - Root Password: `rootpassword`
- **phpMyAdmin Web UI**: Port `8081`
  - Access at: [http://localhost:8081](http://localhost:8081)

## 2. Connecting Spring Boot to MySQL Container

In `backend/src/main/resources/application.properties`, activate the MySQL profile or update datasource properties:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/jobboard_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=jobboard_user
spring.datasource.password=jobboard_password
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

## 3. Teardown

```bash
docker-compose -f devops/docker-compose.yml down -v
```
