# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Sincronia — a couples relationship SaaS PWA.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)
- **Auth**: JWT + bcrypt

## Project: Sincronia

Sincronia is a couples relationship SaaS PWA for the Brazilian market. Key features:
- JWT authentication (register/login)
- Couple invitation & pairing system (invite link, 24h expiry, match animation)
- Daily mood check-in with 10 moods (Claymorphism UI)
- Shared couple dashboard with Relationship Health Score ring
- AI date suggestions (GPT-5.2, localized for Brazil)
- Conflict mediation assistant (CNV-based, 1st person reframing)
- AI chat (SSE streaming)
- Premium gating + PIX payment simulation
- PWA-ready

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/           # Express 5 API server
│   └── sincronia/            # React + Vite PWA frontend
├── lib/
│   ├── api-spec/             # OpenAPI spec + Orval codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas from OpenAPI
│   ├── db/                   # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server-side helpers
│   └── integrations-openai-ai-react/   # OpenAI React hooks
├── scripts/                  # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `users` — id, name, email, password_hash, avatar_url, couple_id, is_pro, pro_expires_at
- `couples` — id, cover_photo_url, anniversary_date
- `invites` — id, token, inviter_id, couple_id, used, expires_at
- `moods` — id, user_id, couple_id, mood, note
- `subscriptions` — id, user_id, plan, payment_id, pix_code, amount, status, expires_at
- `conversations` — id, user_id, title, context
- `messages` — id, conversation_id, role, content

## API Routes

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — authenticate
- `GET /api/auth/me` — current user
- `POST /api/couples/invite` — generate invite link
- `POST /api/couples/join` — join couple via token
- `GET/PATCH /api/couples/profile` — couple profile
- `POST /api/moods` — daily mood check-in
- `GET /api/moods` — mood history
- `GET /api/moods/today` — today's mood sync
- `GET /api/dashboard` — full dashboard data
- `POST /api/ai/date-suggestions` — AI date ideas
- `POST /api/ai/mediation` — conflict mediation AI
- `GET /api/ai/rhs` — Relationship Health Score
- `GET /api/subscriptions/status` — subscription info
- `POST /api/subscriptions/upgrade` — PIX upgrade
- `GET /api/openai/conversations` — list chat conversations
- `POST /api/openai/conversations` — create conversation
- `GET /api/openai/conversations/:id` — conversation + messages
- `POST /api/openai/conversations/:id/messages` — send message (SSE stream)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client + Zod schemas
- `pnpm --filter @workspace/db run push` — apply DB schema changes

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server. Depends on: `@workspace/db`, `@workspace/api-zod`, `@workspace/integrations-openai-ai-server`

### `artifacts/sincronia` (`@workspace/sincronia`)
React + Vite frontend (PWA). Claymorphism design. All pages fully implemented.

### `lib/db` (`@workspace/db`)
Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)
OpenAPI 3.1 spec + Orval codegen config.

### `lib/integrations-openai-ai-server`
Server-side OpenAI integration (chat, image, audio, batch).

### `lib/integrations-openai-ai-react`
React hooks for OpenAI voice/chat.
