# Postman Testing Guide - Ahsaanullah Backend

## Base URL
```
http://localhost:5000
```

---

## 1. USER ROUTES

### 1.1 User Signup
**Endpoint:** `POST /api/auth/user/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67890abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-01-30T...",
    "updatedAt": "2026-01-30T..."
  }
}
```

---

### 1.2 User Login
**Endpoint:** `POST /api/auth/user/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67890abc...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2026-01-30T...",
    "updatedAt": "2026-01-30T..."
  }
}
```

---

### 1.3 User Dashboard (Protected)
**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <your_token_from_login>
Content-Type: application/json
```

**Request Body:** (Empty)

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Access granted to profile",
  "user": {
    "id": "67890abc...",
    "role": "user"
  }
}
```

---

## 2. ADMIN ROUTES

### 2.1 Admin Login
**Endpoint:** `POST /api/auth/admin/login`

**Request Body:**
```json
{
  "email": "ahsaanullah",
  "password": "abdulrehman"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "ahsaanullah",
    "role": "admin"
  }
}
```

---

### 2.2 Admin Dashboard (Protected)
**Endpoint:** `GET /api/auth/admin/dashboard`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Welcome to admin dashboard",
  "user": {
    "email": "ahsaanullah",
    "role": "admin"
  }
}
```

---

## 3. HOSTEL OWNER ROUTES

### 3.1 Hostel Owner Signup
**Endpoint:** `POST /api/auth/hostel-owner/signup`

**Request Body:**
```json
{
  "name": "Ahmed Khan",
  "email": "ahmed@hostel.com",
  "password": "secure123",
  "hostelName": "Prime Hostel",
  "hostelAddress": "123 Main Street, Karachi",
  "hostelPhone": "+92-300-1234567"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Hostel owner registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67890xyz...",
    "name": "Ahmed Khan",
    "email": "ahmed@hostel.com",
    "role": "hostel_owner",
    "hostelName": "Prime Hostel",
    "hostelAddress": "123 Main Street, Karachi",
    "hostelPhone": "+92-300-1234567",
    "isActive": true,
    "createdAt": "2026-01-30T...",
    "updatedAt": "2026-01-30T..."
  }
}
```

---

### 3.2 Hostel Owner Login
**Endpoint:** `POST /api/auth/hostel-owner/login`

**Request Body:**
```json
{
  "email": "ahmed@hostel.com",
  "password": "secure123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67890xyz...",
    "name": "Ahmed Khan",
    "email": "ahmed@hostel.com",
    "role": "hostel_owner",
    "hostelName": "Prime Hostel",
    "hostelAddress": "123 Main Street, Karachi",
    "hostelPhone": "+92-300-1234567",
    "isActive": true
  }
}
```

---

### 3.3 Hostel Owner Dashboard (Protected)
**Endpoint:** `GET /api/auth/hostel-owner/dashboard`

**Headers:**
```
Authorization: Bearer <hostel_owner_token>
Content-Type: application/json
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Welcome to hostel owner dashboard",
  "user": {
    "id": "67890xyz...",
    "role": "hostel_owner"
  }
}
```

---

## Error Cases & Responses

### Missing Required Fields
**Response (400):**
```json
{
  "success": false,
  "message": "Please provide name, email, and password"
}
```

### Email Already Registered
**Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Invalid Credentials
**Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Missing/Invalid Token
**Response (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Unauthorized Role
**Response (403):**
```json
{
  "success": false,
  "message": "Only regular users can access this route"
}
```

---

## Testing Steps in Postman

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Test User Signup:**
   - Create new request: POST `http://localhost:5000/api/auth/user/signup`
   - Set Body to JSON
   - Paste the user signup body
   - Send and copy the token from response

3. **Test User Login:**
   - Create new request: POST `http://localhost:5000/api/auth/user/login`
   - Use different email/password combinations
   - Copy the token

4. **Test Protected Route:**
   - Create new request: GET `http://localhost:5000/api/auth/profile`
   - Go to Headers tab
   - Add: `Authorization: Bearer <paste_your_token_here>`
   - Send

5. **Repeat for Admin and Hostel Owner routes**

---

## Quick Test Data

### Users to Test
```
User 1:
- email: user1@test.com
- password: pass123456

User 2:
- email: user2@test.com
- password: pass123456

Admin (Fixed):
- email: ahsaanullah
- password: abdulrehman

Hostel Owner:
- email: owner1@hostel.com
- password: owner123456
- hostelName: City Hostel
- hostelAddress: 456 Park Ave, Lahore
- hostelPhone: +92-300-9876543
```

---

## Notes
- Tokens are valid for 7 days (configured in .env as JWT_EXPIRE=7d)
- Passwords are hashed using bcryptjs
- All passwords are hidden in responses
- Ensure MongoDB is running before testing
- Use `Bearer` prefix when adding token to Authorization header
