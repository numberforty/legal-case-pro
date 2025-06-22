# Database Schema Documentation

## Overview

Legal Case Pro uses PostgreSQL as its primary database with Prisma ORM for database access. The schema is designed to model the complex relationships between legal entities such as users, clients, cases, documents, tasks, and time entries.

## Entity Relationship Diagram

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │     │ Client  │     │  Case   │     │Document │
├─────────┤     ├─────────┤     ├─────────┤     ├─────────┤
│ id      │     │ id      │     │ id      │     │ id      │
│ email   │     │ name    │     │ title   │     │ name    │
│ password│     │ email   │     │ caseNum │     │ fileName│
│ firstName│    │ phone   │     │ desc    │     │ fileSize│
│ lastName│     │ company │     │ type    │     │ mimeType│
│ role    │     │ type    │     │ status  │     │ filePath│
│ isActive│     │ status  │     │ priority│     │ category│
└────┬────┘     │ priority│     │ value   │     │ caseId  │
     │          │ notes   │     │ progress│     └─────────┘
     │          └────┬────┘     │ deadline│
     │               │          │ courtDate│
     │               │          │ opposing │
     │               │          │ nextAction│
┌────┴────┐     ┌────┴────┐     │ clientId │
│  Task   │     │TimeEntry│     │ assignedTo│
├─────────┤     ├─────────┤     └─────────┘
│ id      │     │ id      │
│ title   │     │ desc    │
│ desc    │     │ hours   │
│ status  │     │ rate    │
│ priority│     │ billable│
│ dueDate │     │ date    │
│ completed│    │ caseId  │
│ caseId  │     │ userId  │
│ assignedTo│   └─────────┘
└─────────┘
```

## Database Tables

### User

Represents the legal professionals using the system.

| Column     | Type      | Constraints           | Description                               |
|------------|-----------|------------------------|-------------------------------------------|
| id         | String    | @id @default(cuid())   | Unique identifier                         |
| email      | String    | @unique               | User's email address (used for login)     |
| password   | String    |                        | Hashed password                           |
| firstName  | String    |                        | User's first name                         |
| lastName   | String    |                        | User's last name                          |
| role       | UserRole  | @default(ATTORNEY)     | User role: ADMIN, PARTNER, ATTORNEY, etc. |
| isActive   | Boolean   | @default(true)         | Account status                            |
| createdAt  | DateTime  | @default(now())        | Account creation timestamp                |
| updatedAt  | DateTime  | @updatedAt            | Last update timestamp                     |

**Relationships:**
- One-to-many with Case (as assignedTo)
- One-to-many with Task (as assignedTo)
- One-to-many with TimeEntry

**Business Rules:**
- Email must be unique
- Password is stored with bcrypt hash
- User role determines access levels in the application

### Client

Represents individuals or organizations that are clients of the legal practice.

| Column      | Type         | Constraints           | Description                             |
|-------------|--------------|------------------------|-----------------------------------------|
| id          | String       | @id @default(cuid())   | Unique identifier                       |
| name        | String       |                        | Client name                             |
| email       | String       | @unique               | Client email address                    |
| phone       | String?      |                        | Optional contact number                 |
| company     | String?      |                        | Optional company name (for corporate)   |
| address     | String?      |                        | Optional physical address               |
| type        | ClientType   |                        | Type of legal service needed            |
| status      | ClientStatus | @default(ACTIVE)       | Active, Inactive, Prospect              |
| priority    | Priority     | @default(MEDIUM)       | Client priority level                   |
| notes       | String?      |                        | Additional notes                        |
| joinDate    | DateTime     | @default(now())        | When client relationship began          |
| lastContact | DateTime?    |                        | Last client interaction date            |
| createdAt   | DateTime     | @default(now())        | Record creation timestamp               |
| updatedAt   | DateTime     | @updatedAt            | Record update timestamp                 |

**Relationships:**
- One-to-many with Case

**Business Rules:**
- Email must be unique
- A client can have multiple cases

### Case

Represents legal cases/matters handled by the firm.

| Column         | Type        | Constraints           | Description                              |
|---------------|-------------|------------------------|------------------------------------------|
| id             | String      | @id @default(cuid())   | Unique identifier                        |
| title          | String      |                        | Case title                               |
| caseNumber     | String      | @unique               | Unique case reference number             |
| description    | String?     |                        | Case description                         |
| type           | CaseType    |                        | Type of legal case                       |
| status         | CaseStatus  | @default(ACTIVE)       | Current status in legal process          |
| priority       | Priority    | @default(MEDIUM)       | Case priority level                      |
| estimatedValue | Float?      |                        | Estimated monetary value                 |
| progress       | Int         | @default(0)            | Percentage progress (0-100)              |
| deadline       | DateTime?   |                        | Case deadline                            |
| courtDate      | DateTime?   |                        | Court appearance date if applicable      |
| opposing       | String?     |                        | Opposing party information               |
| nextAction     | String?     |                        | Next required action                     |
| createdAt      | DateTime    | @default(now())        | Record creation timestamp                |
| updatedAt      | DateTime    | @updatedAt            | Record update timestamp                  |
| clientId       | String      | Foreign key            | Associated client                        |
| assignedToId   | String      | Foreign key            | User assigned to the case                |

**Relationships:**
- Many-to-one with Client
- Many-to-one with User (assignedTo)
- One-to-many with Document
- One-to-many with Task
- One-to-many with TimeEntry

**Business Rules:**
- Case number must be unique
- Each case must be associated with exactly one client
- Each case must be assigned to a specific user

### Document

Represents legal documents associated with cases.

| Column      | Type            | Constraints           | Description                            |
|-------------|-----------------|------------------------|-----------------------------------------|
| id          | String          | @id @default(cuid())   | Unique identifier                      |
| name        | String          |                        | Document name/title                    |
| fileName    | String          |                        | Actual file name                       |
| fileSize    | Int             |                        | Size in bytes                          |
| mimeType    | String          |                        | File MIME type                         |
| filePath    | String          |                        | Path to stored file                    |
| category    | DocumentCategory| @default(GENERAL)      | Document category                      |
| uploadedAt  | DateTime        | @default(now())        | Upload timestamp                       |
| caseId      | String          | Foreign key            | Associated case                        |
| uploadedById| String?         |                        | User who uploaded (optional)           |

**Relationships:**
- Many-to-one with Case

**Business Rules:**
- All documents must be associated with a specific case
- Document storage path is constructed securely to prevent access abuse

### TimeEntry

Represents billable or non-billable time spent on cases.

| Column      | Type     | Constraints           | Description                             |
|-------------|----------|------------------------|-----------------------------------------|
| id          | String   | @id @default(cuid())   | Unique identifier                       |
| description | String   |                        | Description of work performed           |
| hours       | Float    |                        | Time spent in decimal hours             |
| hourlyRate  | Float?   |                        | Optional billing rate                   |
| isBillable  | Boolean  | @default(true)         | Whether the time is billable to client  |
| date        | DateTime | @default(now())        | Date work was performed                 |
| createdAt   | DateTime | @default(now())        | Record creation timestamp               |
| caseId      | String   | Foreign key            | Associated case                         |
| userId      | String   | Foreign key            | User who performed the work             |

**Relationships:**
- Many-to-one with Case
- Many-to-one with User

**Business Rules:**
- Hours must be positive value
- Each entry must be associated with both a case and a user

### Task

Represents work items that need to be completed for cases.

| Column      | Type      | Constraints           | Description                              |
|-------------|-----------|------------------------|------------------------------------------|
| id          | String    | @id @default(cuid())   | Unique identifier                        |
| title       | String    |                        | Task title                               |
| description | String?   |                        | Optional detailed description            |
| status      | TaskStatus| @default(PENDING)      | Current status                           |
| priority    | Priority  | @default(MEDIUM)       | Task priority level                      |
| dueDate     | DateTime? |                        | Optional deadline                        |
| completedAt | DateTime? |                        | When task was completed (if applicable)  |
| createdAt   | DateTime  | @default(now())        | Record creation timestamp                |
| updatedAt   | DateTime  | @updatedAt            | Record update timestamp                  |
| caseId      | String    | Foreign key            | Associated case                          |
| assignedToId| String    | Foreign key            | User assigned to complete the task       |

**Relationships:**
- Many-to-one with Case
- Many-to-one with User (assignedTo)

**Business Rules:**
- Each task must be associated with a specific case and user
- Completed tasks should have completedAt timestamp set

## Enumerations

### UserRole
- `ADMIN`: System administrator with all permissions
- `PARTNER`: Senior attorney/partner with high-level access
- `ATTORNEY`: Standard attorney with case management access
- `PARALEGAL`: Legal assistant with limited permissions
- `ASSISTANT`: Administrative assistant with minimal permissions

### ClientType
- `CORPORATE`: Business/corporate client
- `FAMILY`: Family law client
- `CRIMINAL`: Criminal defense client
- `CIVIL`: Civil litigation client
- `IP`: Intellectual property client
- `EMPLOYMENT`: Employment law client
- `OTHER`: Other client types

### ClientStatus
- `ACTIVE`: Current client
- `INACTIVE`: Former client
- `PROSPECT`: Potential client

### CaseType
- `CORPORATE`: Corporate legal matters
- `FAMILY`: Family law matters
- `CRIMINAL`: Criminal defense matters
- `CIVIL`: Civil litigation
- `IP`: Intellectual property
- `EMPLOYMENT`: Employment law matters
- `OTHER`: Other case types

### CaseStatus
- `ACTIVE`: Currently active case
- `REVIEW`: Under review
- `DISCOVERY`: In discovery phase
- `TRIAL`: In trial phase
- `SETTLEMENT`: In settlement negotiations
- `CLOSED`: Case closed/resolved
- `ON_HOLD`: Case temporarily suspended

### Priority
- `LOW`: Low priority
- `MEDIUM`: Medium priority (default)
- `HIGH`: High priority
- `URGENT`: Urgent/critical priority

### DocumentCategory
- `CONTRACT`: Contracts and agreements
- `MOTION`: Court motions
- `EVIDENCE`: Evidence documents
- `CORRESPONDENCE`: Letters and communications
- `COURT_FILING`: Documents filed with court
- `RESEARCH`: Legal research documents
- `GENERAL`: General documents

### TaskStatus
- `PENDING`: Not started
- `IN_PROGRESS`: Currently being worked on
- `COMPLETED`: Finished
- `CANCELLED`: No longer needed

## Database Migrations and Maintenance

The database schema is maintained through Prisma migrations. When schema changes are required:

1. Update the schema.prisma file
2. Generate a migration: `npx prisma migrate dev --name [migration_name]`
3. Apply the migration: `npx prisma migrate deploy`

Development data can be seeded using the seed script:
```
npm run db:seed
```
