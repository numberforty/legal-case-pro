# Authentication & Authorization

## Overview

Legal Case Pro implements a comprehensive authentication and authorization system to secure the application and provide appropriate access based on user roles. This document outlines the authentication flow, user roles, permissions, and implementation details.

## Authentication Flow

### Login Process

1. **User Credentials Entry**:
   - User enters email and password on the login page
   - Client-side validation ensures fields are populated correctly

2. **Authentication Request**:
   - Frontend sends credentials to `/api/auth/login` endpoint
   - Server validates credentials against the database
   - Password comparison uses bcrypt for secure verification

3. **Token Generation**:
   - After successful validation, server generates a JWT token
   - Token contains user ID, email, and role information
   - Token is signed with a secure server secret

4. **Token Storage**:
   - Token is set as an HTTP-only cookie (`auth-token`)
   - Cookie is secure and not accessible to JavaScript
   - Additional user information is stored in localStorage for UI purposes

5. **Redirection**:
   - User is redirected to the dashboard or intended destination

### Token Verification

1. **Middleware Check**:
   - All requests to protected routes pass through middleware
   - Middleware extracts the JWT token from cookies
   - Token is verified using the server secret
   - Expired or invalid tokens trigger redirection to login

2. **Edge Authentication**:
   - Next.js Edge middleware (`middleware.ts`) handles route protection
   - Public routes are accessible without authentication
   - Protected routes require valid authentication
   - Login page redirects to dashboard if already authenticated

### Logout Process

1. **API Call**:
   - User clicks logout button
   - Frontend calls `/api/auth/logout` endpoint

2. **Token Removal**:
   - Server removes the auth token cookie
   - Client clears any user data from localStorage
   - User redirected to login page

## User Roles and Permissions

Legal Case Pro implements a role-based access control (RBAC) system with the following roles:

### User Roles

| Role | Description | Access Level |
|------|-------------|-------------|
| ADMIN | System administrator | Full system access |
| PARTNER | Senior attorney/partner | High-level access to all cases and financial data |
| ATTORNEY | Standard attorney | Access to assigned cases and limited financial data |
| PARALEGAL | Legal assistant | Limited case access and no financial data |
| ASSISTANT | Administrative assistant | Basic access to assigned tasks only |

### Permission Matrix

| Feature/Action | ADMIN | PARTNER | ATTORNEY | PARALEGAL | ASSISTANT |
|----------------|-------|---------|----------|-----------|-----------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add/Edit Client | ✅ | ✅ | ✅ | ❌ | ❌ |
| View All Clients | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Assigned Clients | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add/Edit Case | ✅ | ✅ | ✅ | ❌ | ❌ |
| View All Cases | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Assigned Cases | ✅ | ✅ | ✅ | ✅ | ✅ |
| Document Management | ✅ | ✅ | ✅ | ✅ | ❌ |
| Time Tracking | ✅ | ✅ | ✅ | ✅ | ✅ |
| Financial Reports | ✅ | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

### Access Patterns

1. **Global Access**: Admins and Partners can access all resources
2. **Assignment-Based Access**: Attorneys, Paralegals, and Assistants can access only resources assigned to them
3. **Feature-Based Restrictions**: Certain features like financial reports are restricted by role

## Implementation Details

### Authentication Technologies

- **JWT (JSON Web Tokens)**: For secure, stateless authentication
- **bcryptjs**: For password hashing and verification
- **HTTP-only Cookies**: For secure token storage
- **Next.js Middleware**: For route protection
- **React Context**: For frontend auth state management

### Key Files

- `src/contexts/AuthContext.tsx`: React context for authentication state
- `src/middleware.ts`: Next.js middleware for route protection
- `src/lib/auth.ts`: Authentication utility functions
- `src/lib/edge-auth.ts`: Edge middleware authentication functions
- `src/components/ProtectedRoute.tsx`: Component-level route protection
- `src/app/login/page.tsx`: Login page
- `src/app/login/login-button.tsx`: Login form handler
- `src/app/api/auth/*`: Authentication API endpoints

### Password Security

- Passwords are hashed using bcrypt with appropriate salt rounds
- Plain text passwords are never stored or logged
- Password requirements include minimum length and complexity

### JWT Configuration

- Tokens include minimal necessary claims (user ID, role, email)
- Short expiration time (24 hours) requires regular re-authentication
- Token refresh mechanism for continuous sessions

## Authorization Strategy

### Frontend Authorization

1. **UI Adaptation**:
   - Menu items and UI elements conditionally render based on user role
   - Action buttons are disabled or hidden when user lacks permission

2. **Route Guards**:
   - React components check user permissions before rendering sensitive content
   - Unauthorized access attempts redirect to dashboard with error message

### Backend Authorization

1. **Middleware Checks**:
   - API routes have role-based middleware guards
   - Request validation includes permission checking
   - User ID is compared against resource ownership for assignment-based permissions

2. **Data Filtering**:
   - Database queries filter results based on user role and permissions
   - Higher-privileged roles see all data, while others see only assigned resources

## Security Considerations

### Security Measures

- **CSRF Protection**: Using secure same-site cookies
- **XSS Prevention**: HTTP-only cookies prevent token theft via JavaScript
- **Rate Limiting**: Prevention of brute force attacks
- **Secure Headers**: HTTP security headers for additional protection
- **Audit Logging**: Important security events are logged
- **Session Management**: Inactive sessions expire automatically

### Security Best Practices

- Regular security audits and penetration testing
- Keeping dependencies updated for security patches
- Following OWASP security guidelines
- Implementing proper error handling to prevent information leakage

## Testing Authentication

The authentication system is tested through:

1. Unit tests for auth utility functions
2. Integration tests for auth API endpoints
3. End-to-end tests for complete login flows
4. Negative testing for invalid credentials and token tampering
