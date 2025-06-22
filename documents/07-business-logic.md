# Business Logic & Legal Workflow

## Overview

Legal Case Pro implements a comprehensive business logic layer that models legal practice workflows and processes. This document outlines the core business rules, workflow states, and implementation patterns that drive the application's functionality.

## Core Business Domains

### Client Management

The client domain represents individuals or organizations that engage legal services.

#### Business Rules

1. **Client Classification**:
   - Clients are categorized as `INDIVIDUAL` or `CORPORATE`
   - Each client has a status (`ACTIVE`, `INACTIVE`, or `PROSPECT`)
   - Priority levels (`HIGH`, `MEDIUM`, `LOW`) help attorneys prioritize client matters

2. **Client Relationships**:
   - A client can have multiple cases
   - Clients have a primary contact person (for corporate clients)
   - Client information includes contact details, billing information, and relationship history

3. **Validation Rules**:
   - Client names must be unique in the system
   - Corporate clients require company name
   - Valid email and phone formats are enforced
   - Client creation requires minimum required fields (name, contact info, type)

### Case Management

Cases represent legal matters handled by the firm.

#### Case Workflow States

Cases follow a defined lifecycle through these states:

1. **INTAKE** - Initial case assessment and information gathering
2. **DISCOVERY** - Collection and analysis of evidence and information
3. **REVIEW** - Legal analysis and strategy development
4. **PREPARATION** - Preparing documents and arguments
5. **TRIAL** - Active court proceedings
6. **SETTLEMENT** - Negotiation and settlement discussions
7. **APPEAL** - Appeals process following initial resolution
8. **CLOSED** - Case concluded
9. **ON_HOLD** - Temporarily paused cases

#### Business Rules

1. **Case Creation**:
   - Each case must be associated with a client
   - Cases must have a title, case number, and type
   - At least one attorney must be assigned to a case

2. **Case Assignment**:
   - Cases can be assigned to one or more attorneys
   - Primary attorney is responsible for oversight
   - Case assignments can be modified based on workload or specialization

3. **Case Progression**:
   - Status transitions follow a logical sequence (e.g., cannot jump from INTAKE to CLOSED)
   - Certain status changes require approval from partners
   - Status history is maintained for audit purposes

4. **Case Deadlines**:
   - Cases have filing deadlines, court dates, and other time-sensitive milestones
   - Deadline notifications are automatically generated
   - Past-due deadlines trigger escalation processes

### Document Management

Legal documents are central to case processing and require careful tracking.

#### Business Rules

1. **Document Classification**:
   - Documents are categorized by type (`CONTRACT`, `PLEADING`, `EVIDENCE`, `CORRESPONDENCE`, etc.)
   - Documents can be associated with specific cases or clients
   - Version history is maintained for document changes

2. **Document Access Control**:
   - Document access follows role-based permissions
   - Sensitive documents may have additional access restrictions
   - Document viewing and downloading activities are logged

3. **Document Workflow**:
   - Documents can have states (draft, review, final)
   - Document review processes can include approval workflows
   - Document templates standardize creation of common legal documents

### Time Tracking & Billing

Accurate time tracking is essential for legal practice management.

#### Business Rules

1. **Time Entry**:
   - Time entries must be associated with a case or administrative matter
   - Minimum time increment is 0.1 hour (6 minutes)
   - Time entries require description, date, hours, and billing status
   - Time entries can be marked as billable or non-billable

2. **Billing Rates**:
   - Rates vary by attorney role/seniority
   - Clients may have negotiated special rates
   - Different matter types may have different billing structures

3. **Invoice Generation**:
   - Invoices compile billable time entries for a specified period
   - Invoices can be customized with specific terms and descriptions
   - Invoice approval workflow requires partner review

## Implementation Patterns

### Service Layer

The application implements a service layer that encapsulates business logic separately from controllers and data access:

```typescript
// Example service layer pattern
export class CaseService {
  constructor(private db: PrismaClient) {}

  async createCase(data: CreateCaseDTO): Promise<Case> {
    // Validation logic
    this.validateCaseData(data);
    
    // Business rule: generate case number
    const caseNumber = await this.generateCaseNumber(data.type);
    
    // Create case with generated fields
    const newCase = await this.db.case.create({
      data: {
        ...data,
        caseNumber,
        status: 'INTAKE', // Default initial status
        createdAt: new Date(),
      },
      include: {
        client: true,
        assignedAttorneys: true,
      },
    });
    
    // Post-creation business logic
    await this.generateDefaultTasksForCase(newCase.id);
    
    return newCase;
  }

  async updateCaseStatus(caseId: string, newStatus: CaseStatus, userId: string): Promise<Case> {
    // Get current case
    const currentCase = await this.db.case.findUnique({ 
      where: { id: caseId },
      include: { statusHistory: true }
    });
    
    if (!currentCase) throw new Error('Case not found');
    
    // Business rule: validate status transition
    this.validateStatusTransition(currentCase.status, newStatus);
    
    // Business rule: check authorization
    await this.validateStatusChangeAuthorization(newStatus, userId);
    
    // Update case and record status history
    return this.db.$transaction([
      this.db.caseStatusHistory.create({
        data: {
          caseId,
          previousStatus: currentCase.status,
          newStatus,
          changedById: userId,
          changedAt: new Date(),
        },
      }),
      this.db.case.update({
        where: { id: caseId },
        data: { 
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
          client: true,
          assignedAttorneys: true,
          statusHistory: true,
        },
      }),
    ]).then(results => results[1]);
  }
  
  // Additional helper methods...
}
```

### Domain Events

The application uses domain events to handle complex workflows and side effects:

```typescript
// Domain event pattern example
interface DomainEvent {
  eventType: string;
  payload: any;
  timestamp: Date;
}

class CaseStatusChangedEvent implements DomainEvent {
  eventType = 'CASE_STATUS_CHANGED';
  timestamp = new Date();
  
  constructor(
    public payload: {
      caseId: string;
      previousStatus: CaseStatus;
      newStatus: CaseStatus;
      changedById: string;
    }
  ) {}
}

class DomainEventPublisher {
  private handlers: Map<string, Function[]> = new Map();
  
  subscribe(eventType: string, handler: Function) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }
  
  publish(event: DomainEvent) {
    const handlers = this.handlers.get(event.eventType) || [];
    for (const handler of handlers) {
      handler(event);
    }
  }
}

// Usage
const eventPublisher = new DomainEventPublisher();

// Subscribe to events
eventPublisher.subscribe('CASE_STATUS_CHANGED', (event: CaseStatusChangedEvent) => {
  // Send notifications to stakeholders
  notifyStatusChange(event.payload);
});

eventPublisher.subscribe('CASE_STATUS_CHANGED', (event: CaseStatusChangedEvent) => {
  // Update reporting metrics
  updateCaseStatusMetrics(event.payload);
});

// In service layer:
async updateCaseStatus(caseId: string, newStatus: CaseStatus, userId: string) {
  // Business logic...
  
  // Publish domain event
  eventPublisher.publish(new CaseStatusChangedEvent({
    caseId,
    previousStatus: currentCase.status,
    newStatus,
    changedById: userId,
  }));
}
```

## Legal Workflows

### Client Intake Process

1. **Initial Contact**
   - Record client information from initial inquiry
   - Conflict check against existing clients
   - Schedule initial consultation

2. **Client Evaluation**
   - Assess case merit and firm capability
   - Determine appropriate attorney assignment 
   - Evaluate potential fee arrangements

3. **Engagement**
   - Generate engagement letter
   - Collect retainer payment
   - Convert prospect to active client
   - Create initial case record

### Case Management Workflow

1. **Case Initiation**
   - Create case record
   - Assign attorney team
   - Define scope and objectives
   - Establish case strategy

2. **Discovery Phase**
   - Document collection and review
   - Deposition scheduling
   - Evidence management
   - Expert witness coordination

3. **Case Strategy Development**
   - Legal research on relevant precedents
   - Strategy document preparation
   - Risk assessment
   - Settlement evaluation

4. **Resolution Path**
   - Trial preparation
   - Settlement negotiation
   - Alternative dispute resolution
   - Appeals process management

### Document Workflow

1. **Document Creation**
   - Template selection
   - Document drafting
   - Version control
   - Metadata tagging

2. **Review Process**
   - Internal attorney review
   - Revision tracking
   - Client approval process
   - Final verification

3. **Filing and Service**
   - Court filing preparation
   - Electronic filing
   - Service of process tracking
   - Deadline calculation and tracking

## Business Logic Validation

The application implements multiple layers of validation:

1. **Frontend Validation**:
   - Form input validation for immediate user feedback
   - Business rule enforcement before API calls
   - UI restrictions based on permissions

2. **API Validation**:
   - Request payload schema validation
   - Business rule enforcement at API level
   - Authorization checks before processing

3. **Service Layer Validation**:
   - Complex business rules enforced in service methods
   - Cross-entity validation logic
   - Transaction management for data integrity

4. **Database Constraints**:
   - Foreign key relationships
   - Unique constraints
   - Check constraints for value validation

## Business Metrics and Reporting

The application tracks key business metrics:

1. **Time and Billing Metrics**:
   - Billable hours by attorney
   - Collection rates
   - Outstanding receivables
   - Realization rates

2. **Case Metrics**:
   - Case load by attorney
   - Case resolution time
   - Success rates by case type
   - Client satisfaction scores

3. **Operational Metrics**:
   - Document processing time
   - Task completion rates
   - Deadline compliance
   - User activity and productivity
