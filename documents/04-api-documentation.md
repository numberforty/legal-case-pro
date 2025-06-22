# API Documentation

## Overview

Legal Case Pro's API is built using Next.js API routes, which provide a serverless architecture for handling API requests. This document details all available endpoints, their request/response formats, authentication requirements, and examples.

## Base URL

In development: `http://localhost:3000/api`
In production: `https://{your-domain}/api`

## Authentication

Most API endpoints require authentication via JWT token. The token is typically provided as an HTTP-only cookie named `auth-token`.

### Authentication Headers

For certain operations, especially when using the API programmatically, include:

```
Cookie: auth-token=<your_jwt_token>
```

## API Response Format

All API responses follow a standard format:

```json
{
  "success": true|false,
  "message": "Optional status message",
  "data": {
    // Response data object varies by endpoint
  },
  "error": {
    // Error details (only when success: false)
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| AUTH_REQUIRED | Authentication required |
| AUTH_FAILED | Invalid credentials or token |
| FORBIDDEN | User lacks permission |
| NOT_FOUND | Resource not found |
| VALIDATION_ERROR | Invalid input data |
| SERVER_ERROR | Internal server error |

## API Endpoints

### Authentication

#### POST /api/auth/login

Authenticate a user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "user_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ATTORNEY"
    },
    "token": "jwt_token_string"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Invalid credentials
- 400: Missing required fields

#### GET /api/auth/me

Get current authenticated user info.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ATTORNEY"
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated

#### POST /api/auth/logout

Log out the current user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Status Codes:**
- 200: Success

### Clients

#### GET /api/clients

Get a list of clients.

**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search term
- status: Filter by status (ACTIVE, INACTIVE, PROSPECT)
- sort: Sort field
- order: Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client_id",
        "name": "Client Name",
        "email": "client@example.com",
        "phone": "+1 (555) 123-4567",
        "company": "Company Name",
        "type": "CORPORATE",
        "status": "ACTIVE",
        "priority": "HIGH"
      }
    ],
    "pagination": {
      "total": 100,
      "pages": 10,
      "page": 1,
      "limit": 10
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 403: Insufficient permissions

#### GET /api/clients/[id]

Get a specific client by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "client": {
      "id": "client_id",
      "name": "Client Name",
      "email": "client@example.com",
      "phone": "+1 (555) 123-4567",
      "company": "Company Name",
      "address": "123 Main St, Anytown, USA",
      "type": "CORPORATE",
      "status": "ACTIVE",
      "priority": "HIGH",
      "notes": "Important client notes",
      "joinDate": "2025-01-15T00:00:00.000Z",
      "lastContact": "2025-06-01T00:00:00.000Z",
      "createdAt": "2025-01-15T00:00:00.000Z",
      "updatedAt": "2025-06-01T00:00:00.000Z"
    }
  }
}
```

**Status Codes:**
- 200: Success
- 404: Client not found

#### POST /api/clients

Create a new client.

**Request Body:**
```json
{
  "name": "New Client",
  "email": "newclient@example.com",
  "phone": "+1 (555) 987-6543",
  "company": "New Company Inc.",
  "address": "456 Business Ave, Commerce City, USA",
  "type": "CORPORATE",
  "status": "ACTIVE",
  "priority": "MEDIUM",
  "notes": "New client from referral"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client": {
      "id": "new_client_id",
      "name": "New Client",
      "email": "newclient@example.com",
      "type": "CORPORATE",
      "status": "ACTIVE",
      "createdAt": "2025-06-21T00:00:00.000Z"
    }
  }
}
```

**Status Codes:**
- 201: Created
- 400: Validation error

#### PUT /api/clients/[id]

Update an existing client.

**Request Body:**
```json
{
  "name": "Updated Client Name",
  "phone": "+1 (555) 111-2222",
  "status": "INACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "client": {
      "id": "client_id",
      "name": "Updated Client Name",
      "phone": "+1 (555) 111-2222",
      "status": "INACTIVE",
      "updatedAt": "2025-06-21T00:00:00.000Z"
    }
  }
}
```

**Status Codes:**
- 200: Success
- 404: Client not found
- 400: Validation error

### Cases

#### GET /api/cases

Get a list of cases.

**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search term
- status: Filter by status
- type: Filter by case type
- clientId: Filter by client
- assignedToId: Filter by assigned user

**Response:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "case_id",
        "title": "Case Title",
        "caseNumber": "LC-2025-001",
        "type": "CORPORATE",
        "status": "ACTIVE",
        "priority": "HIGH",
        "progress": 65,
        "deadline": "2025-07-15T00:00:00.000Z",
        "clientId": "client_id",
        "clientName": "Client Name",
        "assignedToId": "user_id",
        "assignedToName": "John Doe"
      }
    ],
    "pagination": {
      "total": 120,
      "pages": 12,
      "page": 1,
      "limit": 10
    }
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated

### Similar endpoints exist for:

- GET /api/cases/[id]
- POST /api/cases
- PUT /api/cases/[id]

### Tasks

#### GET /api/tasks

Get a list of tasks.

**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search term
- status: Filter by task status
- priority: Filter by priority
- caseId: Filter by case
- assignedToId: Filter by assigned user
- dueDate: Filter by due date

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_id",
        "title": "Task Title",
        "status": "PENDING",
        "priority": "HIGH",
        "dueDate": "2025-06-25T00:00:00.000Z",
        "caseId": "case_id",
        "caseTitle": "Case Title",
        "assignedToId": "user_id",
        "assignedToName": "John Doe"
      }
    ],
    "pagination": {
      "total": 75,
      "pages": 8,
      "page": 1,
      "limit": 10
    }
  }
}
```

### Similar endpoints exist for:

- GET /api/tasks/[id]
- POST /api/tasks
- PUT /api/tasks/[id]
- DELETE /api/tasks/[id]

### Documents

#### GET /api/documents

Get a list of documents.

**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search term
- category: Filter by document category
- caseId: Filter by case

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "document_id",
        "name": "Document Name",
        "fileName": "file_name.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "category": "CONTRACT",
        "uploadedAt": "2025-06-10T00:00:00.000Z",
        "caseId": "case_id",
        "caseTitle": "Case Title"
      }
    ],
    "pagination": {
      "total": 45,
      "pages": 5,
      "page": 1,
      "limit": 10
    }
  }
}
```

#### POST /api/documents/upload

Upload a new document.

**Request Body (multipart/form-data):**
- file: Document file
- name: Document name
- category: Document category
- caseId: Associated case ID

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": "document_id",
      "name": "Document Name",
      "fileName": "file_name.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "category": "CONTRACT",
      "uploadedAt": "2025-06-21T00:00:00.000Z"
    }
  }
}
```

### Time Entries

#### GET /api/time-entries

Get a list of time entries.

**Query Parameters:**
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search term
- caseId: Filter by case
- userId: Filter by user
- startDate: Filter by start date
- endDate: Filter by end date
- billable: Filter by billable status (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "timeEntries": [
      {
        "id": "entry_id",
        "description": "Document preparation and filing",
        "hours": 2.5,
        "hourlyRate": 450,
        "isBillable": true,
        "date": "2025-06-15T00:00:00.000Z",
        "caseId": "case_id",
        "caseTitle": "Case Title",
        "userId": "user_id",
        "userName": "John Doe"
      }
    ],
    "pagination": {
      "total": 150,
      "pages": 15,
      "page": 1,
      "limit": 10
    }
  }
}
```

### Dashboard

#### GET /api/dashboard/analytics

Get dashboard analytics data.

**Response:**
```json
{
  "success": true,
  "data": {
    "dashboard": {
      "summary": {
        "totalClients": 45,
        "totalCases": 78,
        "activeCases": 32,
        "totalTasks": 124,
        "pendingTasks": 56,
        "totalRevenue": 256000,
        "recentRevenue": 78500
      },
      "casesByStatus": [
        { "status": "ACTIVE", "count": 32 },
        { "status": "REVIEW", "count": 15 },
        { "status": "DISCOVERY", "count": 10 },
        { "status": "TRIAL", "count": 8 },
        { "status": "SETTLEMENT", "count": 5 },
        { "status": "CLOSED", "count": 5 },
        { "status": "ON_HOLD", "count": 3 }
      ],
      "recentActivity": [
        // Recent activity data
      ]
    }
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 10 requests per minute
- GET endpoints: 60 requests per minute
- POST/PUT/DELETE endpoints: 30 requests per minute

When rate limits are exceeded, the API returns status code 429 with a message indicating when requests can resume.

## Versioning

The current API version is v1. All endpoints are prefixed with `/api` but do not include explicit version numbers in the URL. When breaking changes are introduced, a new API version will be released with endpoints prefixed as `/api/v2/`.

## API Client

The frontend application uses a unified API client (`src/lib/api.ts`) to interact with these endpoints. This client handles:

- Authentication token management
- Request formatting
- Error handling and parsing
- Type safety with TypeScript
- Centralized API configuration
