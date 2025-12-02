# ResumeAI API Documentation

## Overview

ResumeAI is a comprehensive resume analysis platform that uses AI to evaluate resumes against job descriptions. The API provides endpoints for user authentication, resume upload, and resume management with role-based access control.

**Base URL:** `http://localhost:4000` (development) or your deployed server URL

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **CANDIDATE**: Can upload and view their own resumes
- **RECRUITER**: Can view all resumes with filtering capabilities
- **ADMIN**: Full access to all features

## API Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/api/user/register`

Creates a new user account or logs in existing user.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "photoUrl": "string (optional)",
  "role": "CANDIDATE|RECRUITER|ADMIN (optional, defaults to CANDIDATE)"
}
```

**Response (201 Created):**
```json
{
  "message": "Registered",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "photoUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "token": "jwt_token_string"
}
```

**Response (200 OK - Existing User):**
```json
{
  "message": "Welcome Back",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "photoUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "token": "jwt_token_string"
}
```

#### 2. Login User
**POST** `/api/user/login`

Authenticates user credentials.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "Logged in",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "photoUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "token": "jwt_token_string"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

#### 3. Get Current User
**GET** `/api/user/me`

Retrieves current authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "photoUrl": "string",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### Resume Management Endpoints

#### 4. Upload Resume
**POST** `/api/resume/`

Uploads a PDF resume and performs AI analysis against a job description.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
- `file`: PDF file (required)
- `job_desc`: Job description text (required)
- `resume_name`: Name for the resume (required)
- `user`: User ID (optional, for ADMIN/RECRUITER to upload on behalf of others)

**Response (200 OK):**
```json
{
  "message": "Your analysis is ready",
  "data": {
    "_id": "string",
    "user": "user_id",
    "resume_name": "string",
    "job_desc": "string",
    "score": 85,
    "feedback": "string",
    "resume_text": "extracted_text",
    "createdAt": "date",
    "updatedAt": "date"
  },
  "ai_raw": "raw_ai_response"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "PDF file is required under field \"file\""
}
```

#### 5. Get User's Resumes
**GET** `/api/resume/mine`

Retrieves all resumes for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "count": 5,
  "data": [
    {
      "_id": "string",
      "user": "user_id",
      "resume_name": "string",
      "job_desc": "string",
      "score": 85,
      "feedback": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

#### 6. Get All Resumes (Admin/Recruiter)
**GET** `/api/resume/`

Retrieves all resumes with filtering and pagination (ADMIN/RECRUITER only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `user`: Filter by user ID
- `minScore`: Minimum score filter
- `maxScore`: Maximum score filter

**Response (200 OK):**
```json
{
  "total": 150,
  "page": 1,
  "pages": 8,
  "data": [
    {
      "_id": "string",
      "user": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      },
      "resume_name": "string",
      "job_desc": "string",
      "score": 85,
      "feedback": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

#### 7. Get Resume by ID
**GET** `/api/resume/:id`

Retrieves a specific resume by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Resume ID

**Response (200 OK):**
```json
{
  "data": {
    "_id": "string",
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string"
    },
    "resume_name": "string",
    "job_desc": "string",
    "score": 85,
    "feedback": "string",
    "resume_text": "extracted_text",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Resume not found"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "Forbidden"
}
```

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, min 6 chars, hashed),
  photoUrl: String,
  role: String (enum: ADMIN, RECRUITER, CANDIDATE),
  createdAt: Date,
  updatedAt: Date
}
```

### Resume Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'user', required),
  resume_name: String (required),
  job_desc: String (required),
  score: Number (0-100),
  feedback: String,
  resume_text: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All API endpoints return errors in the following format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (optional)"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid credentials
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## File Upload

- **Supported Format**: PDF only
- **Maximum Size**: 2MB (configured in Express)
- **Field Name**: `file`
- **Storage**: Files are stored in `/uploads` directory
- **Access**: Uploaded files are served statically at `/uploads/:filename`

## AI Analysis

The resume analysis uses Cohere AI to:
1. Extract text from uploaded PDF
2. Compare resume content with job description
3. Generate a match score (0-100)
4. Provide feedback on the match

**Note**: Requires `COHERE_API_KEY` environment variable

## Environment Variables

Required environment variables:
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)
- `COHERE_API_KEY`: API key for Cohere AI
- `PORT`: Server port (default: 4000)
- `CLIENT_ORIGIN`: Frontend origin for CORS (default: http://localhost:5173)
- `MONGODB_URI`: MongoDB connection string

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production use.

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- CORS configuration
- Input validation
- File upload restrictions

## Testing the API

You can test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands

Example curl for login:
```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## Deployment Notes

- Ensure MongoDB is running and accessible
- Set all required environment variables
- Configure CORS origin for your frontend domain
- Set up file storage with proper permissions
- Consider adding SSL/TLS for production

---

**Last Updated:** Generated from codebase analysis
**Version:** 1.0.0
