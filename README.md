# NestJS Authentication & Dashboard (No Database)

A full-stack web application built with **NestJS**, **TypeScript**, **Handlebars (HBS)**, and an **In-Memory Session Store** (no database).

---

## Features

- **No Database:** In-memory session store backed by a high-performance `Map<string, SessionRecord>()` with automatic expiration and garbage collection.
- **Dual Authentication Bridge:**
  - **Browser / SSR:** Delivered via `httpOnly`, `sameSite: 'lax'`, secure session cookies.
  - **REST API:** Delivered via JSON response (`token`) and verified with `Authorization: Bearer <token>`.
- **Server-Side Rendered (SSR) Frontend:** Powered by **Handlebars (HBS)** and vanilla CSS/JS (no React/Vue/Angular).
- **Protected Dashboard:** Displays authenticated user details, live in-memory active session counters, and sample metrics.
- **DTO Validation:** Strict validation using `class-validator` and `ValidationPipe`.
- **Environment Driven:** Fully configurable via `.env`.

---

## Getting Started

### 1. Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### 2. Environment Configuration (.env setup)

The application expects an active `.env` file located directly in the root directory of the project.

> **Note:** The `.env` file containing predefined credentials and session secrets is provided alongside this submission via email.

**How to place the `.env` file:**

1. Download the `.env` file .
2. Place it in the root directory of the cloned project:
   ```text
   Dashboard/
   ├── .env          <-- Place the provided .env file here
   ├── package.json
   ├── src/
   ...
   ```
3. Alternatively, you can copy the provided example template:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On Linux/macOS:
     ```bash
     cp .env.example .env
     ```

---

### 3. Build & Run

**Development Mode (Watch):**

```bash
npm run start:dev
```

**Production Mode:**

```bash
npm run build
npm run start:prod
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## API Endpoints & cURL Testing

### 1. Login API

**Endpoint:** `POST /api/auth/login`

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@example.com\",\"password\":\"*********\"}"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com"
  },
  "token": "<SESSION_TOKEN>"
}
```

_(Also returns `Set-Cookie: session_token=...; HttpOnly; SameSite=Lax`)_

---

### 2. Profile API (Protected)

**Endpoint:** `GET /api/auth/me`

**Using Bearer Token:**

```bash
curl -i -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <SESSION_TOKEN>"
```

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com"
  }
}
```

---

### 3. Logout API (Protected)

**Endpoint:** `POST /api/auth/logout`

```bash
curl -i -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <SESSION_TOKEN>"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 4. Invalidation Verification

Re-attempting to call `/api/auth/me` with the logged-out token will return `401 Unauthorized`:

```bash
curl -i -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <SESSION_TOKEN>"
```

**Response (401 Unauthorized):**

```json
{
  "message": "Authentication missing, invalid, or expired",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

## Project Structure

```text
Dashboard/
├── src/
│   ├── auth/
│   │   ├── dto/login.dto.ts
│   │   ├── interfaces/session.interface.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── session.service.ts
│   │   ├── auth.guard.ts
│   │   ├── current-user.decorator.ts
│   │   └── auth.module.ts
│   ├── dashboard/
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.module.ts
│   ├── app.module.ts
│   └── main.ts
├── views/
│   ├── login.hbs
│   └── dashboard.hbs
├── public/
│   ├── css/style.css
│   └── js/app.js
├── .env
├── .env.example
├── package.json
└── README.md
```
