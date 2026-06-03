# todo. — Full Stack TodoList

A production-ready TodoList built with Spring Boot, Spring Security, JWT, MySQL, and a custom HTML/CSS/JS frontend. Not your typical CRUD demo.

---

## Why This Is Different

Most TodoList projects are throwaway demos — no auth, shared data, no real architecture. This one is built the way a real application should be:

| Typical TodoList | This Project |
|---|---|
| One global list, everyone sees everything | Every user has their own private list |
| No authentication | JWT-based login and registration |
| In-memory or H2 database | Persistent MySQL with relational schema |
| No security layer | Spring Security protecting every route |
| Plain ugly UI | Custom dark UI with animations and stats |
| Frontend and backend tangled | Clean separation: REST API + static frontend |

---

## Tech Stack

### Backend
- **Java 25** with Spring Boot 3.2
- **Spring Security** — stateless JWT authentication
- **Spring Data JPA** — ORM with MySQL
- **Lombok** — boilerplate reduction
- **jjwt 0.11.5** — JWT generation and validation

### Frontend
- **Vanilla HTML / CSS / JS** — zero frameworks, zero dependencies
- **Google Fonts** — Syne + DM Mono
- **Fetch API** — communicates with the REST backend
- **localStorage** — stores JWT token client-side

### Database
- **MySQL** — two tables: `users` and `todos` with a foreign key relation

---

## Architecture

```
Browser (auth.html / index.html)
        │
        │  HTTP + Bearer Token
        ▼
┌─────────────────────────────┐
│       Spring Boot App        │
│                             │
│  /api/auth/**  → public     │
│  /api/todos/** → secured    │
│                             │
│  JwtAuthFilter              │
│  SecurityConfig             │
│  CorsConfig                 │
└────────────┬────────────────┘
             │  JPA / Hibernate
             ▼
        MySQL Database
        ┌──────────┐     ┌──────────┐
        │  users   │────<│  todos   │
        └──────────┘     └──────────┘
```

---

## Project Structure

```
src/main/
├── java/com/example/todolist/
│   ├── config/
│   │   ├── CorsConfig.java          # Global CORS rules
│   │   └── SecurityConfig.java      # Route protection + password encoder
│   ├── controller/
│   │   ├── AuthController.java      # /api/auth/register, /api/auth/login
│   │   └── TodoController.java      # /api/todos CRUD
│   ├── dto/
│   │   ├── AuthRequest.java         # Login/register body
│   │   └── AuthResponse.java        # Token + username response
│   ├── model/
│   │   ├── User.java                # users table
│   │   └── Todo.java                # todos table (ManyToOne → User)
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── TodoRepository.java      # Queries scoped to user
│   ├── security/
│   │   ├── CustomUserDetailsService.java
│   │   ├── JwtAuthFilter.java       # Intercepts every request
│   │   └── JwtUtil.java             # Generate + validate tokens
│   ├── service/
│   │   ├── AuthService.java
│   │   └── TodoService.java         # All queries auto-scoped to logged-in user
│   └── TodolistApplication.java
└── resources/
    ├── static/
    │   ├── auth.html                # Login / Register page
    │   └── index.html               # Main todo app
    └── application.properties
```

---

## Database Schema

```sql
CREATE TABLE users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL        -- BCrypt hashed
);

CREATE TABLE todos (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    completed   BOOLEAN DEFAULT FALSE,
    created_at  DATETIME,
    user_id     BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Hibernate generates this automatically on startup via `ddl-auto=update`.

---

## Security Flow

```
1. User registers → password BCrypt-hashed → saved to DB
2. User logs in   → credentials verified   → JWT token returned
3. Every request  → JwtAuthFilter reads token from Authorization header
4. Token valid    → user identity loaded   → request proceeds
5. Token missing  → 401 Unauthorized
6. Todo queries   → always filtered by current user → no data leakage
```

No session, no cookies. Fully stateless.

---

## Setup

**Requirements:** Java 25, Maven, MySQL

**1. Clone / extract the project**

**2. Create the database**
```sql
CREATE DATABASE todolist_db;
```

**3. Configure credentials**

Edit `src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

**4. Add frontend files**

Copy `auth.html` and `index.html` into:
```
src/main/resources/static/
```

**5. Run**
```bash
mvn spring-boot:run
```

**6. Open in browser**
```
http://localhost:8080/auth.html
```

---

## API Reference

### Auth — Public

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ username, password }` | Create account |
| POST | `/api/auth/login` | `{ username, password }` | Get JWT token |

**Response:**
```json
{
  "token": "eyJhbGci...",
  "username": "dawly"
}
```

### Todos — Requires JWT

Add header to every request:
```
Authorization: Bearer <token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get all your todos |
| GET | `/api/todos/{id}` | Get one todo |
| GET | `/api/todos/status?completed=true` | Filter by status |
| POST | `/api/todos` | Create a todo |
| PUT | `/api/todos/{id}` | Update a todo |
| DELETE | `/api/todos/{id}` | Delete a todo |

**Todo body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```

---

## Frontend Pages

### `auth.html` — Login & Register
- Tab switcher between Login and Register
- Stores JWT token in `localStorage` on success
- Redirects to `index.html` automatically if already logged in

### `index.html` — Todo App
- Stats bar showing total, done, and pending counts
- Add task form with optional description
- Filter tasks by All / Pending / Done
- Toggle complete, edit inline, delete per task
- Auto-logout on 401 (expired or invalid token)
- Redirects to `auth.html` if not authenticated

---

## Key Design Decisions

**Why JWT instead of sessions?**
Stateless auth means the server holds no session state. Scales horizontally without a shared session store.

**Why is TodoService reading from SecurityContext?**
Instead of passing `userId` as a URL param (which users could tamper with), the service reads the authenticated user directly from Spring's `SecurityContextHolder`. Users can never access each other's data even if they guess IDs.

**Why vanilla JS and not React?**
No build step, no `node_modules`, no bundler. Drop two HTML files into `static/` and it works. Simple to deploy, simple to understand.