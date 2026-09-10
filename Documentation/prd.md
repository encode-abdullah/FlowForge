# FlowForge — Product Requirements Document (PRD)

## 1. Product Overview

**FlowForge** is a visual distributed workflow engine that allows users to construct workflows by connecting nodes in a visual graph editor, with a backend that actually executes those workflows as distributed jobs.

### 1.1 Problem Statement

Existing workflow automation tools (Zapier, n8n) are either:
- **Closed-source** and expensive
- **Complex to self-host** and maintain
- **Lacking transparency** in execution logic

FlowForge provides a **transparent, self-hosted, developer-friendly** workflow engine that demonstrates real backend engineering principles.

### 1.2 Target Users

- Developers building automation workflows
- Teams needing self-hosted workflow orchestration
- Portfolio demonstration for engineering candidates

### 1.3 Success Metrics

- Visual editor loads in < 2 seconds
- Workflow execution starts within 500ms of trigger
- 99.9% execution success rate for valid workflows
- Full test coverage (>80%)

---

## 2. Core Features

### 2.1 Visual Workflow Editor

**Description**: Users construct workflows by dragging and dropping nodes onto a canvas and connecting them.

**Requirements**:
- React Flow-based canvas
- Drag-and-drop node palette
- Node configuration panel
- Zoom, pan, minimap
- Snap-to-grid
- Undo/redo (stretch goal)

**Node Types**:
| Node | Purpose | Config |
|------|---------|--------|
| Webhook | Trigger workflow from HTTP request | path |
| HTTP Request | Call external API | url, method, headers, body |
| Condition | If/else branching | variable, operator, value |
| Transform | Data mapping | expression/mapping |
| Delay | Wait N seconds | duration |
| Set Variable | Store values | key, value expression |
| Email | Send notification (mock) | to, subject, body |
| Database | Mock DB operation | operation, query |
| Code | Run custom JS | code string |
| Loop | Iterate over array | array variable, body |

### 2.2 Workflow Persistence

**Description**: Workflows are saved to PostgreSQL with full node/edge graph structure.

**Requirements**:
- CRUD operations for workflows
- Node positions preserved
- Edge connections preserved
- Auto-save on editor changes

### 2.3 Workflow Versioning

**Description**: Every activation creates a versioned snapshot of the workflow.

**Requirements**:
- Version number auto-increments
- Full definition snapshot (nodes + edges JSONB)
- Version history viewable
- Can execute any version

### 2.4 Execution Engine

**Description**: Backend actually executes workflows as distributed jobs.

**Requirements**:
- DAG-based execution (topological sort)
- Concurrent node execution within levels
- Conditional branching (runtime DAG pruning)
- Node-level retry with exponential backoff
- Node-level timeouts
- Failure propagation (skip dependent nodes)
- Execution status tracking

### 2.5 Job Queues

**Description**: BullMQ manages workflow execution jobs.

**Requirements**:
- `workflow-execution` queue for root jobs
- Worker concurrency configuration
- Job priority support
- Job cancellation

### 2.6 Execution History

**Description**: Full audit trail of every workflow execution.

**Requirements**:
- Execution list with status, duration, trigger type
- Node-level execution results
- Input/output for each node
- Error messages and stack traces
- Timestamp for start/end of each node

### 2.7 Workflow Replay

**Description**: Failed workflows can be replayed from any node.

**Requirements**:
- Replay from failed node
- Replay from any specific node
- Successful nodes skipped (reuse cached results)
- New execution record linked to original
- Full replay history

### 2.8 Webhook Triggers

**Description**: External systems trigger workflows via HTTP.

**Requirements**:
- POST endpoint per active workflow
- Payload passed as workflow input
- Async execution (return execution ID immediately)

### 2.9 Authentication

**Description**: JWT-based auth protects workflows and executions.

**Requirements**:
- Register with email/password
- Login returns JWT
- Protected API routes
- Workflows scoped to user
- bcrypt password hashing

---

## 3. Non-Functional Requirements

### 3.1 Performance

- API response time < 200ms (p95)
- Workflow execution start < 500ms
- Visual editor renders 50+ nodes without lag

### 3.2 Reliability

- Worker crash recovery via BullMQ job persistence
- Execution state survives API restarts
- Database transactions for critical operations

### 3.3 Scalability (Design Considerations)

- Stateless API servers (horizontal scaling)
- Multiple worker instances via BullMQ
- Redis for distributed locking
- PostgreSQL for persistent state

### 3.4 Security

- JWT tokens with expiration
- Password hashing (bcrypt)
- Input validation (Zod)
- CORS configuration
- Rate limiting (stretch goal)

### 3.5 Observability

- Structured logging (pino via Fastify)
- Execution audit trail
- Error tracking

---

## 4. API Specification

### 4.1 Authentication

```
POST /api/auth/register
  Body: { email: string, password: string, name?: string }
  Response: { user: User, token: string }

POST /api/auth/login
  Body: { email: string, password: string }
  Response: { user: User, token: string }
```

### 4.2 Workflows

```
GET    /api/workflows
  Response: Workflow[]

POST   /api/workflows
  Body: { name: string, description?: string }
  Response: Workflow

GET    /api/workflows/:id
  Response: Workflow (with nodes + edges)

PUT    /api/workflows/:id
  Body: { name?, description?, nodes?, edges? }
  Response: Workflow

DELETE /api/workflows/:id
  Response: { success: true }

POST   /api/workflows/:id/activate
  Response: { version: number }

GET    /api/workflows/:id/versions
  Response: WorkflowVersion[]

POST   /api/workflows/:id/execute
  Body: { input?: any }
  Response: { executionId: string }
```

### 4.3 Executions

```
GET    /api/executions
  Query: ?workflowId=string&status=string
  Response: Execution[]

GET    /api/executions/:id
  Response: Execution (with nodeExecutions)

POST   /api/executions/:id/replay
  Body: { fromNodeId?: string }
  Response: { executionId: string }
```

### 4.4 Webhooks

```
POST   /api/webhooks/:workflowId
  Body: { any JSON }
  Response: { executionId: string, status: "queued" }
```

---

## 5. Data Model

### 5.1 Entity Relationship

```
User 1──N Workflow
Workflow 1──N Node
Workflow 1──N Edge
Workflow 1──N WorkflowVersion
Workflow 1──N Execution
Execution 1──N NodeExecution
Node 1──N NodeExecution
```

### 5.2 Field Definitions

**Workflow**:
- id: cuid (PK)
- name: string
- description: string (optional)
- active: boolean (default false)
- userId: string (FK → User)
- createdAt: DateTime
- updatedAt: DateTime

**Node**:
- id: cuid (PK)
- workflowId: string (FK → Workflow)
- type: string (NodeType enum)
- config: JSONB
- positionX: float
- positionY: float

**Edge**:
- id: cuid (PK)
- workflowId: string (FK → Workflow)
- sourceNodeId: string (FK → Node)
- targetNodeId: string (FK → Node)
- sourceHandle: string (default "output")
- targetHandle: string (default "input")

**WorkflowVersion**:
- id: cuid (PK)
- workflowId: string (FK → Workflow)
- version: integer
- definition: JSONB (full snapshot)
- createdAt: DateTime

**Execution**:
- id: cuid (PK)
- workflowId: string (FK → Workflow)
- version: integer
- status: string (ExecutionStatus enum)
- triggerType: string (TriggerType enum)
- input: JSONB (optional)
- output: JSONB (optional)
- startedAt: DateTime (optional)
- completedAt: DateTime (optional)
- createdAt: DateTime

**NodeExecution**:
- id: cuid (PK)
- executionId: string (FK → Execution)
- nodeId: string (FK → Node)
- status: string (NodeExecutionStatus enum)
- input: JSONB (optional)
- output: JSONB (optional)
- error: string (optional)
- attempt: integer (default 1)
- startedAt: DateTime (optional)
- completedAt: DateTime (optional)

---

## 6. UI/UX Requirements

### 6.1 Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/password login form |
| Register | `/register` | Registration form |
| Workflow List | `/workflows` | Grid/list of user's workflows |
| Workflow Editor | `/workflows/:id` | Visual editor with React Flow |
| Execution List | `/workflows/:id/executions` | Execution history table |
| Execution Detail | `/executions/:id` | Timeline view + replay button |

### 6.2 Editor Layout

```
┌─────────────────────────────────────────────────────┐
│  Header: Workflow Name    [Save] [Execute] [History] │
├──────┬──────────────────────────────────┬───────────┤
│      │                                  │           │
│ Node │        React Flow Canvas         │   Node    │
│ Palette│                                │  Config   │
│      │                                  │  Panel    │
│      │                                  │           │
├──────┴──────────────────────────────────┴───────────┤
│  Footer: Execution status / Last saved              │
└─────────────────────────────────────────────────────┘
```

### 6.3 Node Visual Design

Each node renders as a card with:
- Icon (left)
- Title (bold)
- Subtitle (config preview, gray)
- Input handle (top center)
- Output handle (bottom center)
- Selected state: blue border
- Error state: red border
- Completed state: green checkmark

---

## 7. Testing Strategy

### 7.1 Unit Tests

- DAG builder (cycle detection, topological sort, parallel levels)
- Retry handler (exponential backoff, max attempts)
- Node executors (HTTP, condition, transform)
- Zod schemas (validation rules)

### 7.2 Integration Tests

- API routes (CRUD, auth, execution)
- Database operations (Prisma)
- Queue operations (BullMQ)

### 7.3 E2E Tests (Playwright)

- User registration + login
- Workflow creation + editing
- Node drag-and-drop
- Workflow execution
- Execution history viewing
- Replay functionality

### 7.4 Coverage Targets

- Unit tests: >90%
- Integration tests: >80%
- E2E tests: critical paths covered
