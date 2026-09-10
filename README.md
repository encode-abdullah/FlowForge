# FlowForge

A visual distributed workflow engine where users construct workflows by connecting nodes in a graph editor, and a backend execution engine runs them as distributed jobs.

## Tech Stack

- **Frontend:** React, TypeScript, React Flow, Tailwind CSS, Zustand, React Query
- **Backend:** Node.js, TypeScript, Fastify, Prisma
- **Database:** PostgreSQL
- **Queue:** Redis, BullMQ
- **Infrastructure:** Docker, GitHub Actions
- **Testing:** Vitest, Supertest, Playwright

## Key Features

- Visual workflow editor with drag-and-drop nodes
- 10+ node types (HTTP, Condition, Transform, Delay, Email, Database, Code, Loop)
- DAG-based concurrent execution engine
- Conditional branching with runtime DAG pruning
- Retries with exponential backoff
- Workflow replay from any failed node
- Webhook triggers for external integrations
- JWT authentication
- Full execution history and audit trail

## Getting Started

```bash
git clone https://github.com/encode-abdullah/FlowForge.git
cd flowforge
docker compose up -d
npm install
npm run db:migrate
npm run dev
```

## Testing

```bash
npm run test        # Unit + Integration
npm run test:e2e    # Playwright E2E
```

## Project Structure

```
flowforge/
├── packages/
│   ├── shared/       # Shared types and utilities
│   ├── api/          # Fastify REST server
│   ├── engine/       # Workflow execution logic
│   ├── worker/       # BullMQ worker process
│   └── web/          # React frontend
├── docker/
├── docker-compose.yml
└── Documentation/
    ├── prd.md
    ├── architecture.prd
    ├── phases.md
    ├── rules.md
    └── memory.prd
```

## License

MIT
