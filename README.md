# 📝 TodoList — Spring Boot REST API with JWT Auth

A CRUD Todo application with per-user authentication using Spring Boot, Spring Security, JWT, and MySQL.

---

## Tech Stack

- Java 17
- Spring Boot 3.2
- Spring Security + JWT (jjwt 0.11.5)
- Spring Data JPA
- MySQL
- Lombok

---

## Prerequisites

- JDK 17+
- Maven 3.8+
- MySQL running on `localhost:3306`

---

## Setup

**1. Create the database**

```sql
CREATE DATABASE todolist_db;
```

**2. Update credentials**

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

**3. Run the application**

```bash
mvn spring-boot:run
```

Server starts at `http://localhost:8080`.

---

## API Endpoints

### Auth (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Todos (requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get current user's todos |
| GET | `/api/todos/{id}` | Get todo by ID |
| GET | `/api/todos/status?completed=true` | Filter by status |
| POST | `/api/todos` | Create a todo |
| PUT | `/api/todos/{id}` | Update a todo |
| DELETE | `/api/todos/{id}` | Delete a todo |

---

## Authentication Flow

**1. Register**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"dawly","password":"secret123"}'
```

Response:
```json
{ "token": "eyJhbGci...", "username": "dawly" }
```

**2. Use token in requests**
```bash
curl http://localhost:8080/api/todos \
  -H "Authorization: Bearer eyJhbGci..."
```

**3. Create a todo**
```bash
curl -X POST http://localhost:8080/api/todos \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs","completed":false}'
```

---

## Project Structure

```
src/main/java/com/example/todolist/
├── TodolistApplication.java
├── config/
│   └── SecurityConfig.java
├── controller/
│   ├── AuthController.java
│   └── TodoController.java
├── dto/
│   ├── AuthRequest.java
│   └── AuthResponse.java
├── model/
│   ├── Todo.java
│   └── User.java
├── repository/
│   ├── TodoRepository.java
│   └── UserRepository.java
├── security/
│   ├── JwtAuthFilter.java
│   └── JwtUtil.java
└── service/
    ├── AuthService.java
    └── TodoService.java
```
