# FlowForge — Implementation Phases

## Phase 0: Project Scaffolding (Day 1)

**Goal**: Empty directory → running dev servers for all packages.

### Step 0.1: Initialize Monorepo Root

Create root `package.json` with npm workspaces:
```json
{
  "name": "flowforge",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w packages/api\" \"npm run dev -w packages/worker\" \"npm run dev -w packages/web\"",
    "build": "npm run build -w packages/shared && npm run build -w packages/api && npm run build -w packages/worker && npm run build -w packages/web",
    "test": "npm run test -w packages/engine && npm run test -w packages/api",
    "test:e2e": "npm run test:e2e -w packages/web",
    "db:migrate": "npx prisma migrate dev --schema=packages/api/prisma/schema.prisma",
    "db:seed": "npx tsx packages/api/prisma/seed.ts"
  }
}
```

Create `tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Step 0.2: Scaffold Each Package

| Package | Purpose | Key Dependencies |
|---------|---------|-----------------|
| `packages/shared` | Types, constants, utils | none (pure TS) |
| `packages/api` | Fastify REST server | fastify, @fastify/cors, @fastify/jwt, @fastify/websocket, prisma, bullmq, zod |
| `packages/engine` | Execution logic | bullmq, uuid, zod |
| `packages/worker` | BullMQ worker process | bullmq, ioredis |
| `packages/web` | React frontend | react, react-dom, reactflow, @tanstack/react-query, zustand, react-router-dom, tailwindcss, lucide-react |

### Step 0.3: Docker Compose for Dependencies

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: flowforge
      POSTGRES_USER: flowforge
      POSTGRES_PASSWORD: flowforge_dev
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redisdata:/data]

volumes:
  pgdata:
  redisdata:
```

### Step 0.4: Verify

- `docker compose up -d` → Postgres + Redis running
- `npm run db:migrate` → Prisma generates client + creates tables
- `npm run dev` → API on :3001, Worker on :3002, Web on :5173

---

## Phase 1: Database Schema + Shared Types (Day 2-3)

**Goal**: Complete data model + shared TypeScript types.

### Step 1.1: Prisma Schema

Full schema with models:
- User (id, email, password, name)
- ApiKey (id, key, name, userId, active)
- Workflow (id, name, description, active, userId)
- Node (id, workflowId, type, config JSONB, positionX, positionY)
- Edge (id, workflowId, sourceNodeId, targetNodeId, sourceHandle, targetHandle)
- WorkflowVersion (id, workflowId, version, definition JSONB)
- Execution (id, workflowId, version, status, triggerType, input, output, startedAt, completedAt)
- NodeExecution (id, executionId, nodeId, status, input, output, error, attempt, startedAt, completedAt)

### Step 1.2: Shared Types (`packages/shared`)

TypeScript types for:
- NodeType (webhook, httpRequest, condition, transform, delay, setVariable, email, database, code, loop)
- ExecutionStatus (pending, running, completed, failed, cancelled)
- NodeExecutionStatus (pending, running, completed, failed, skipped)
- TriggerType (manual, webhook, api)
- WorkflowDefinition, WorkflowNode, WorkflowEdge
- ExecutionContext, NodeResult

### Step 1.3: Migrations + Seed

- Run `npx prisma migrate dev --name init`
- Seed with a sample user + empty workflow

---

## Phase 2: API Server (Day 3-5)

**Goal**: Full REST API with auth, workflow CRUD, execution triggering.

### Step 2.1: Fastify Setup

Register plugins: CORS, JWT, Auth, Body validation.

### Step 2.2: API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Get JWT |
| `/api/workflows` | GET | List user's workflows |
| `/api/workflows` | POST | Create workflow |
| `/api/workflows/:id` | GET | Get workflow with nodes/edges |
| `/api/workflows/:id` | PUT | Update workflow |
| `/api/workflows/:id` | DELETE | Delete workflow |
| `/api/workflows/:id/activate` | POST | Set active + create version |
| `/api/workflows/:id/versions` | GET | List versions |
| `/api/workflows/:id/execute` | POST | Trigger manual execution |
| `/api/executions` | GET | List executions |
| `/api/executions/:id` | GET | Get execution with node results |
| `/api/executions/:id/replay` | POST | Replay from specific node |
| `/api/webhooks/:workflowId` | POST | Trigger via webhook |

### Step 2.3: Validation with Zod

Request/response schemas for all routes.

### Step 2.4: Auth Plugin

JWT-based authenticate decorator for Fastify.

---

## Phase 3: Execution Engine (Day 5-8)

**Goal**: Core engine that builds DAG, executes nodes, handles branching.

### Step 3.1: DAG Builder

- Convert nodes + edges into execution plan
- Topological sort into levels
- Cycle detection
- Parallel execution within levels

### Step 3.2: Node Executor Registry

Each node type implements `NodeExecutor` interface:
```typescript
interface NodeExecutor {
  type: string;
  execute(input: unknown, config: Record<string, unknown>, context: ExecutionContext): Promise<unknown>;
}
```

### Step 3.3: Workflow Executor

- Iterates through DAG levels
- Executes nodes concurrently within each level
- Handles failures + propagates skip states
- Stores results in database

### Step 3.4: Node Implementations

- **WebhookNode**: Receives trigger data
- **HttpRequestNode**: Calls external APIs via fetch
- **ConditionNode**: Evaluates conditions, routes to branches
- **TransformNode**: Maps/transforms data
- **DelayNode**: Pauses execution
- **EmailNode**: Sends mock emails
- **DatabaseNode**: Mock database operations

---

## Phase 4: Worker + BullMQ Integration (Day 8-9)

**Goal**: Worker process that polls queues and executes workflows.

### Step 4.1: Queue Setup

- `workflow-execution` queue: Root workflow jobs
- `node-execution` queue: Individual node jobs

### Step 4.2: Worker Process

- Polls `workflow-execution` queue
- Loads workflow definition from DB
- Delegates to WorkflowExecutor
- Handles job completion/failure

### Step 4.3: Retry Logic

```typescript
interface RetryConfig {
  maxAttempts: number;
  backoff: 'fixed' | 'exponential';
  delayMs: number;
  retryOn: string[];
}
```

Default: 3 attempts, exponential backoff, 1000ms base delay.

---

## Phase 5: Frontend — Visual Editor (Day 9-13)

**Goal**: Full React Flow editor with node palette, canvas, and configuration panel.

### Step 5.1: App Structure

Feature-based folder structure:
- `features/auth/` — Login, Register, useAuth
- `features/workflows/` — List, Editor, Canvas, Sidebar, NodeConfig
- `features/executions/` — List, Detail, Timeline
- `stores/` — Zustand editorStore
- `lib/` — API client, auth helpers

### Step 5.2: Canvas Component

React Flow wrapper with:
- Custom node types
- Background, Controls, MiniMap
- Snap-to-grid
- Drag-to-connect

### Step 5.3: Sidebar

Draggable node palette:
- Webhook, HTTP Request, Condition, Transform, Email, Database, Code, Loop

### Step 5.4: Node Config Panel

Right-side panel showing:
- Node-specific configuration form
- Input/output preview
- Delete node button

### Step 5.5: Zustand Editor Store

```typescript
interface EditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  // actions: setNodes, setEdges, selectNode, addNode, updateNodeConfig, markDirty
}
```

### Step 5.6: React Query Hooks

- `useWorkflow(id)` — GET workflow
- `useSaveWorkflow(id)` — PUT workflow
- `useExecuteWorkflow(id)` — POST execute
- `useExecutions(workflowId)` — GET executions
- `useExecutionDetail(id)` — GET execution + node results
- `useReplayExecution(id)` — POST replay

### Step 5.7: Node Components

Each node renders as a React Flow custom node with:
- Handle (top for input, bottom for output)
- Icon
- Label
- Config preview

---

## Phase 6: Execution Dashboard + Replay (Day 13-15)

**Goal**: See execution history, view node-level results, trigger replay.

### Step 6.1: Execution List Page

- Table: Workflow name, trigger type, status, duration, timestamp
- Status badges (colored dots)
- Click row → detail page

### Step 6.2: Execution Detail Page

Timeline view showing:
```
┌─ Webhook Trigger     ✅  0.2s
├─ Validate Payload    ✅  0.1s
├─ Call Payment API    ❌  30.0s  (timeout)
├─ Send Confirmation   ⏭️  skipped
└─ Update Database     ⏭️  skipped

[🔄 Replay from "Call Payment API"]
```

### Step 6.3: Replay Implementation

1. Copy successful node results from original execution
2. Create new execution record
3. Queue execution from replay point
4. Execute remaining nodes

---

## Phase 7: Webhook Triggers (Day 15-16)

**Goal**: External systems can trigger workflows via HTTP.

### Webhook Endpoint

```
POST /api/webhooks/:workflowId
Body: { any JSON payload }
```

Creates execution with:
- triggerType: "webhook"
- input: webhook payload
- status: "pending"

Queues workflow for execution.

---

## Phase 8: Testing (Day 16-19)

**Goal**: Comprehensive test coverage.

### Unit Tests (Vitest)

**dag-builder.test.ts**:
- Linear execution plan
- Cycle detection
- Parallel branches
- Deadlock detection

**workflow-executor.test.ts**:
- Sequential execution
- Parallel execution
- Failure handling
- Skip propagation

**retry-handler.test.ts**:
- Exponential backoff
- Max attempts
- Error type filtering

### Integration Tests (Vitest + Supertest)

**workflows.test.ts**:
- Create workflow
- Retrieve workflow
- Update workflow
- Delete workflow
- Activate workflow + versioning

**executions.test.ts**:
- Manual execution trigger
- Execution status updates
- Node execution results
- Replay from node

### E2E Tests (Playwright)

**workflow-editor.spec.ts**:
- Login
- Create workflow
- Drag nodes to canvas
- Connect nodes
- Configure nodes
- Save workflow

**execution.spec.ts**:
- Execute workflow
- View execution history
- View execution detail
- Replay failed execution

**auth.spec.ts**:
- Register
- Login
- Logout
- Protected routes

---

## Phase 9: Docker + Deployment Config (Day 19-20)

**Goal**: `docker compose up` runs everything.

### Docker Compose Services

- postgres (PostgreSQL 16)
- redis (Redis 7)
- api (Fastify server)
- worker (BullMQ processor)
- web (React app served by Nginx)

### Dockerfiles

- `Dockerfile.api`: Node 20, install deps, build, run
- `Dockerfile.worker`: Node 20, install deps, build, run
- `Dockerfile.web`: Node 20 build stage → Nginx serve stage

### Nginx Config

- Serve static files
- Proxy `/api` to api service
- SPA fallback

---

## Phase 10: CI/CD with GitHub Actions (Day 20-21)

**Goal**: Automated testing on every push/PR.

### CI Pipeline

1. Checkout code
2. Setup Node 20
3. Install dependencies
4. Run Prisma migrations
5. Run unit + integration tests
6. Install Playwright browsers
7. Run E2E tests

### Triggers

- Push to main
- Pull request to main
