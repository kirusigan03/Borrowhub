# BorrowHub Backend

Spring Boot API for BorrowHub. This first pass is just the skeleton — enough to
get the server running and talking to MySQL. Entities and real endpoints
(equipment, bookings, auth, payments) come next.

## 1. Install prerequisites

- **JDK 21** — check with `java -version`.
- **Maven** — check with `mvn -version`. If you don't have it:
  - Easiest: open this `backend/` folder in **IntelliJ IDEA** (Community
    Edition is free) — it detects `pom.xml` and downloads everything
    automatically, no separate Maven install needed.
  - Or install it yourself: macOS `brew install maven`, Windows
    `choco install maven`, Linux `sudo apt install maven`.
- **MySQL** (8.x) running locally — MySQL Workbench or the MySQL CLI both
  work fine for creating the database.

## 2. Create the database

```sql
CREATE DATABASE borrowhub;
```

(`application.properties` also has `createDatabaseIfNotExist=true`, so this
step is a fallback if that flag doesn't work on your MySQL setup.)

## 3. Set your DB credentials

Open `src/main/resources/application.properties` and update:

```properties
spring.datasource.username=root
spring.datasource.password=changeme
```

to match your local MySQL user/password.

## 4. Run it

From the `backend/` folder:

```bash
mvn spring-boot:run
```

Or just click the ▶ run button on `BackendApplication.java` in your IDE.

## 5. Confirm it's working

Visit **http://localhost:8080/api/health** — you should see:

```json
{ "status": "ok", "service": "borrowhub-backend", "time": "..." }
```

If that loads, Spring Boot is running and Hibernate connected to MySQL
successfully (check the console log for `HikariPool ... started` and no
connection errors).

## Project layout so far

```
src/main/java/com/borrowhub/backend/
  BackendApplication.java     ← entry point
  config/
    SecurityConfig.java       ← temporary "allow everything" — replaced once auth exists
    WebConfig.java            ← CORS so the Vite frontend (localhost:5173) can call the API
  controller/
    HealthController.java     ← temporary GET /api/health check
```

Next up: `entity/` classes for `users`, `equipment`, `bookings`, `payments`,
etc. (matching the tables from the research doc), then repositories,
services, and real REST controllers — starting with signup/login so the
existing frontend `AuthContext` has something real to call.
