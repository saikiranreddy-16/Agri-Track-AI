# AgriTrack AI - Backend Foundation (Phase 2A)

This is the production-ready Node.js + Express + MongoDB backend foundation for the AgriTrack platform.

## Features
- **Express Server**: Configured with Helmet (security headers), CORS (with cookie support), Morgan (request logs), Compression (gzip responses), and express-rate-limit (brute-force prevention).
- **MongoDB Connection**: Reusable Mongoose database helper hook.
- **Authentication**: JWT authentication with bcrypt password hashing. Token is returned in JSON responses and stored in HTTP-Only, Secure cookies for browser client protection.
- **Role-Based Access**: Custom guards supporting `Admin`, `Farm Owner`, `Manager`, `Operator`, `Mechanic`, and `Viewer`.
- **Validation**: Strict validation checks utilizing `express-validator` with consistent errors output formats.
- **Centralized Error Handler**: Consistent error formatting (JSON responses) and error outputs logged directly to `logs/error.log`.
- **API Versioning**: Auth APIs mounted on `/api/v1/auth`.

---

## Folder Structure
```
backend/
├── config/
│   ├── db.js                # MongoDB Mongoose connection
│   └── cloudinary.js        # File uploads placeholder
├── controllers/
│   └── authController.js    # Register, login, logout, me logic
├── docs/
│   ├── api.md               # API endpoint specifications
│   └── database.md          # Database schema details
├── logs/
│   ├── error.log            # Server runtime error stack traces
│   └── server.log           # HTTP access logs (Morgan)
├── middleware/
│   ├── authMiddleware.js    # JWT authorization guards
│   ├── errorMiddleware.js   # 404 & centralized error formatter
│   └── validateMiddleware.js# Express-validator results checker
├── models/
│   └── userModel.js         # Mongoose User Schema
├── routes/
│   └── authRoutes.js        # Authentication endpoints mappings
├── services/
│   └── (placeholder)
├── uploads/
│   └── (placeholder for media assets)
├── utils/
│   ├── generateToken.js     # JWT signer and cookie configuration
│   └── responseHandler.js   # Success and error standardized responders
├── validators/
│   └── authValidator.js     # Field validation chains
├── app.js                   # Application-wide middleware configurations
├── server.js                # Server entry point
├── package.json             # Scripts & dependencies
└── .env.example             # Documented environment template
```

---

## Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB installed locally (running on `mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

---

## Installation & Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   *For Windows Command Prompt:*
   ```cmd
   copy .env.example .env
   ```

   *Standard Dev Configurations:*
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/gps_db
   JWT_SECRET=gps_platform_secret_key_2026_development_only
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

---

## Running the Server

- **Development Mode** (with Nodemon auto-restart):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

Once running, you should see console logs confirming:
- The server is running on the configured port.
- MongoDB has connected successfully.

---

## Testing the API

You can test the endpoints using any API client (like Postman or curl). For example, from a PowerShell terminal:

1. **Verify Health**:
   ```powershell
   Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/health"
   ```

2. **Register a User**:
   ```powershell
   Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/v1/auth/register" -ContentType "application/json" -Body '{"name":"Rajesh Patel","email":"rajesh@example.com","password":"password123","phone":"+919876543210","company":"Patel Farms","role":"Farm Owner"}'
   ```

3. **Log in**:
   ```powershell
   $loginRes = Invoke-WebRequest -Method Post -Uri "http://localhost:5000/api/v1/auth/login" -ContentType "application/json" -Body '{"email":"rajesh@example.com","password":"password123"}' -SessionVariable session
   ```

4. **Access Protected Route** (using the session variable to pass cookies):
   ```powershell
   Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/v1/auth/me" -WebSession $session
   ```
