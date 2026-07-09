# REST API Documentation - v1

This document outlines the REST API endpoints provided by the backend foundation.

## Base URLs
- **Development**: `http://localhost:5000`
- **Prefix**: `/api`

---

## Health Check

### Health Check Status
Returns the operational status of the service.

* **URL**: `/api/health`
* **Method**: `GET`
* **Auth Required**: No
* **Success Response (200 OK)**:
  ```json
  {
    "status": "OK",
    "timestamp": "2026-07-08T23:55:00.000Z"
  }
  ```

---

## Authentication

All endpoints in this section are prefixed with `/api/v1/auth`.

### Register User
Registers a new user inside the platform.

* **URL**: `/register`
* **Method**: `POST`
* **Auth Required**: No
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Rajesh Patel",
    "email": "rajesh@example.com",
    "password": "password123",
    "phone": "+919876543210",
    "company": "Patel Agro Farms",
    "role": "Farm Owner"
  }
  ```
  *Note: `company` and `role` are optional. `role` defaults to `"Operator"`. Permitted roles are: `Admin`, `Farm Owner`, `Manager`, `Operator`, `Mechanic`, `Viewer`.*
* **Success Response (201 Created)**:
  *Sets HTTP-Only cookie `token`*
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Rajesh Patel",
        "email": "rajesh@example.com",
        "phone": "+919876543210",
        "company": "Patel Agro Farms",
        "role": "Farm Owner",
        "createdAt": "2026-07-08T23:55:00.000Z",
        "updatedAt": "2026-07-08T23:55:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Response (400 Bad Request / Validation Failed)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      {
        "field": "email",
        "message": "Please enter a valid email address"
      }
    ]
  }
  ```

### Login User
Authenticates user credentials and returns a session.

* **URL**: `/login`
* **Method**: `POST`
* **Auth Required**: No
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "email": "rajesh@example.com",
    "password": "password123"
  }
  ```
* **Success Response (200 OK)**:
  *Sets HTTP-Only cookie `token`*
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Rajesh Patel",
        "email": "rajesh@example.com",
        "phone": "+919876543210",
        "company": "Patel Agro Farms",
        "role": "Farm Owner",
        "createdAt": "2026-07-08T23:55:00.000Z",
        "updatedAt": "2026-07-08T23:55:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

### Logout User
Clears the user session cookie.

* **URL**: `/logout`
* **Method**: `POST`
* **Auth Required**: Yes (Bearer Token or Cookie must be set)
* **Success Response (200 OK)**:
  *Clears cookie `token`*
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### Get Current User Profile (Me)
Retrieves profile data of the currently logged-in user.

* **URL**: `/me`
* **Method**: `GET`
* **Auth Required**: Yes (Cookie `token` or Header `Authorization: Bearer <token>`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "data": {
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "Rajesh Patel",
        "email": "rajesh@example.com",
        "phone": "+919876543210",
        "company": "Patel Agro Farms",
        "role": "Farm Owner",
        "createdAt": "2026-07-08T23:55:00.000Z",
        "updatedAt": "2026-07-08T23:55:00.000Z"
      }
    }
  }
  ```
* **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Session expired or invalid token"
  }
  ```
