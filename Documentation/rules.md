# FlowForge — Development Rules & Conventions

## 1. Code Style

### TypeScript

- **Strict mode** always enabled
- **No `any`** — use `unknown` and type-narrow
- **Interface over type** for object shapes (unless union/intersection needed)
- **Named exports** only (no default exports)
- **Explicit return types** on public functions
- **Prefer `const`** — use `let` only when reassignment is necessary
- **No enums** — use `as const` objects with derived union types

```typescript
// Good
const NODE_TYPES = {
  webhook: 'webhook',
  httpRequest: 'httpRequest',
  condition: 'condition',
} as const;

type NodeType = keyof typeof NODE_TYPES;

// Bad
enum NodeType {
  Webhook = 'webhook',
  HttpRequest = 'httpRequest',
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `workflow.service.ts` |
| Classes | PascalCase | `WorkflowExecutor` |
| Interfaces | PascalCase | `ExecutionContext` |
| Functions | camelCase | `buildDag()` |
| Variables | camelCase | `executionPlan` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Database columns | snake_case | `created_at` |
| API routes | kebab-case | `/api/workflows/:id/execute` |
| React components | PascalCase | `WorkflowEditorPage` |
| React hooks | camelCase, use prefix | `useWorkflow()` |
| CSS classes | kebab-case | `node-card` |

### File Organization

- **One component per file**
- **One route handler per file**
- **Services contain business logic, routes are thin**
- **Shared types go in `packages/shared`**
- **Co-locate tests with source** (not in separate test folder)

---

## 2. Project Structure Rules

### Monorepo

- **npm workspaces** for package management
- **Shared `tsconfig.base.json`** extended by each package
- **Each package has its own `package.json`** with scoped dependencies
- **No circular dependencies** between packages
- **Dependency direction**: `shared ← engine ← worker`, `shared ← api`, `shared ← web`

### Package Responsibilities

| Package | Contains | Does NOT contain |
|---------|----------|-----------------|
| `shared` | Types, constants, pure utility functions | Business logic, API calls |
| `api` | Fastify routes, plugins, Prisma schema | Execution logic (use engine) |
| `engine` | DAG builder, node executors, retry logic | Database access, queue access |
| `worker` | BullMQ processors | Business logic (delegate to engine) |
| `web` | React components, hooks, stores | Server-side logic |

---

## 3. Database Rules

### Prisma

- **One schema file** at `packages/api/prisma/schema.prisma`
- **Migrations** named descriptively (`init`, `add-webhook-support`)
- **Never use `$queryRaw`** unless performance-critical
- **Always use transactions** for multi-table operations
- **Index foreign keys** and frequently-queried columns
- **Use `cuid()`** for primary keys (not auto-increment)
- **JSONB for flexible config** (node config, workflow snapshots)

### Naming

- Table names: **plural** (`workflows`, `nodes`, `edges`)
- Column names: **snake_case** (`created_at`, `source_node_id`)
- Relation names: **PascalCase** (`WorkflowNode`, `NodeExecution`)
- Index names: descriptive (`executions_workflow_id_idx`)

---

## 4. API Rules

### Fastify

- **Route modules** in `packages/api/src/routes/`
- **Service layer** for business logic (never in routes)
- **Zod validation** on all request bodies/params/query
- **Auth via preHandler** hook (`app.authenticate`)
- **Consistent error responses**: `{ error: string, details?: any }`
- **HTTP status codes**: 200 (ok), 201 (created), 400 (bad request), 401 (unauthorized), 404 (not found), 500 (internal)

### Route Structure

```typescript
// Always this pattern:
export async function workflowRoutes(app: FastifyInstance) {
  // Schemas
  const createSchema = z.object({ ... });

  // Route
  app.post('/', {
    preHandler: [app.authenticate],
    schema: { body: createSchema },
  }, async (request, reply) => {
    const result = await workflowService.create(request.body, request.user.id);
    return reply.status(201).send(result);
  });
}
```

---

## 5. Frontend Rules

### React

- **Functional components only** (no class components)
- **Hooks for state** (useState, useEffect, custom hooks)
- **React Query** for all server state
- **Zustand** for UI-only state (editor selection, sidebar open/close)
- **No prop drilling** — use context or stores
- **TypeScript on all props** — use `interface` for component props

### Component Structure

```typescript
// Always this pattern:
interface CanvasProps {
  workflow: Workflow;
  onNodeSelect: (nodeId: string | null) => void;
}

export function Canvas({ workflow, onNodeSelect }: CanvasProps) {
  // hooks
  // handlers
  // render
}
```

### Styling

- **Tailwind CSS** utility classes
- **No inline styles** (except React Flow positioning)
- **Component-level CSS** only if Tailwind is insufficient
- **Responsive design** where appropriate

### State Management

| State Type | Tool | Example |
|-----------|------|---------|
| Server data | React Query | Workflows, executions |
| Editor state | Zustand | Selected node, dirty flag |
| Form state | React Hook Form (stretch) | Node config form |
| UI state | React useState | Modal open, sidebar tab |

---

## 6. Testing Rules

### Unit Tests (Vitest)

- **One test file per source file**: `dag-builder.ts` → `dag-builder.test.ts`
- **Describe blocks** group related tests
- **Test names** describe behavior: `should detect cycles in workflow graph`
- **Arrange-Act-Assert** pattern
- **Mock external dependencies** (database, network, queues)
- **No snapshot tests** (brittle)

### Integration Tests

- **Test API routes** with Fastify's `app.inject()`
- **Use real database** (test database, reset between tests)
- **Test full request/response cycle**
- **Verify side effects** (database state, queue jobs)

### E2E Tests (Playwright)

- **One spec file per user flow**: `workflow-editor.spec.ts`
- **Use data-testid** selectors (not CSS classes)
- **Test critical paths only** (not every UI variation)
- **Screen captures on failure** (Playwright config)
- **Independent tests** (no test depends on another)

---

## 7. Git Rules

### Branches

- `main` — production-ready code
- `develop` — integration branch (stretch goal)
- `feature/*` — feature branches
- `fix/*` — bug fix branches

### Commits

- **Conventional commits**: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`
- **One logical change per commit**
- **Reference issue numbers** when applicable
- **No committed secrets** (use .env)

### .gitignore

```
node_modules/
dist/
.env
.env.local
*.log
coverage/
playwright-report/
test-results/
.DS_Store
```

---

## 8. Docker Rules

### Images

- **Multi-stage builds** for smaller images
- **Alpine base** for production
- **Non-root user** in production containers
- **Health checks** on all services

### Docker Compose

- **Named volumes** for data persistence
- **Environment variables** via `.env` file
- **Depends on** with health checks
- **Restart policies** for production

---

## 9. Security Rules

### Authentication

- **JWT tokens** with short expiration (15 min access, 7 day refresh)
- **bcrypt** for password hashing (12 rounds)
- **No passwords in logs**
- **No secrets in code** (use environment variables)

### Input Validation

- **Validate all inputs** with Zod before processing
- **Sanitize HTML** if rendering user content
- **Parameterized queries** (Prisma handles this)
- **Rate limiting** on auth endpoints

### Secrets Management

- **`.env` file** for local development (git-ignored)
- **Environment variables** for production
- **No secrets in code** or commit messages
- **Rotate secrets** regularly

---

## 10. Documentation Rules

### README.md

Required sections:
1. Project overview
2. Tech stack
3. Getting started (setup instructions)
4. Project structure
5. API documentation
6. Testing instructions
7. Deployment instructions

### Code Comments

- **No comments** unless asked
- **JSDoc** on public APIs if needed
- **TODO comments** with issue references
- **Explain WHY, not WHAT** (code should be self-documenting)

### Documentation Files

| File | Purpose |
|------|---------|
| `prd.md` | Product requirements |
| `architecture.prd` | System architecture |
| `phases.md` | Implementation phases |
| `rules.md` | This file — conventions |
| `memory.prd` | Full implementation plan |
