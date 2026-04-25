# سين جيم — Arabic Jeopardy Trivia

Multi-team Arabic trivia game inspired by Jeopardy. Players choose 6 categories, build teams, and play through 36 questions on a board where the category title sits in the middle with 3 questions on each side.

## Architecture

- **Monorepo** (pnpm workspaces) with shared OpenAPI-driven contracts.
- **artifacts/quiz-game** — React + Vite + Tailwind v4 + shadcn/ui. Wouter routing under the artifact base path.
- **artifacts/api-server** — Express + Drizzle ORM + Clerk middleware. Pino logging.
- **lib/api-spec** — Single source of truth (OpenAPI 3). Codegen produces:
  - `lib/api-zod` — Runtime Zod validators (server-side request/response checks).
  - `lib/api-client-react` — React Query hooks for the frontend.
  - `lib/api-client-fetch` — Plain fetch client.
- **lib/db** — Drizzle schema and exports (`usersTable`, `categoriesTable`, `questionsTable`, `promoCodesTable`, `codeRedemptionsTable`, `gamesTable`).
- **PostgreSQL** — Replit-managed; schema synced via `drizzle-kit push`.
- **Clerk** — Auth (email/password + OAuth). Sign-in/up rendered inside the app via `/sign-in` and `/sign-up` routes with custom dark+gold theme.

## Game flow

1. Visitor lands on `Landing` with sign-in / sign-up CTAs.
2. After signup the user becomes a regular user (1 starter round). Admin is restricted to a single hardcoded email (`SOLE_ADMIN_EMAIL` in `auth.ts`); all other accounts are forced back to non-admin on every sync.
3. Signed-in `Home` is a **portal** with three big animated tiles: ابدأ اللعبة → `/play`, المتجر → `/store`, لوحة التحكم → `/admin` (admins only). Header shows live balance (polled every 5s).
4. `/play` is the game setup: team builder (2–4 teams), pick-6-categories grid (cards show optional `imageUrl` background), Start button (consumes 1 round).
5. `Board` renders the active game from the server: scoreboard sits **at the top** with retro 7-segment digital counters (`DigitalScore`) per team, color-coded headers, +100/−100 buttons. Below it the 2×3 grid; each cell shows the category in the middle column with 3 question buttons on each side. Clicking a cell opens question modal with reveal-answer flip. Score and used-question state persist via `PATCH /game/active`.
6. `Store` fetches products from `GET /products` (admin-editable). Each product card shows name, description, rounds, formatted price, optional badge, and a Payhip link. Code-redemption form below — each promo code is single-use per user.
7. `Admin` (admins only) — 4 tabs:
   - **المحتوى**: categories sidebar (with thumbnail + edit dialog for name & `imageUrl`), questions table, AI generation dialog (topic → 6 questions, optionally creates a new category).
   - **المستخدمون**: edit any user's `roundsBalance` and admin flag (changes appear on user's UI within ~5s via polling).
   - **الأكواد**: batch-generate promo codes with rounds value & max uses.
   - **المنتجات**: full CRUD for store products (name, description, rounds, priceCents, currency, payhipUrl, badge, sort, active).

## Backend endpoints (all under `/api`, JSON)

Public: none (besides `/health`).

Auth required:
- `GET /me`, `GET /categories`
- `GET /game/active`, `POST /game/start`, `PATCH /game/active`, `DELETE /game/active`
- `POST /codes/redeem`

Admin only:
- `POST /admin/categories`, `PATCH/DELETE /admin/categories/{id}`
- `GET/POST /admin/questions`, `PATCH/DELETE /admin/questions/{id}`
- `GET/PATCH /admin/users[/{id}]`
- `GET/POST/DELETE /admin/codes[/{id}]`
- `GET/POST /admin/products`, `PATCH/DELETE /admin/products/{id}`
- `POST /admin/ai/generate-questions` — body `{ topic, categoryId?, createCategory? }`. Uses OpenAI (`gpt-5.4`, JSON response_format) to generate exactly 6 Arabic questions across 100/200/300/400/500/600 tiers.

Public:
- `GET /products` — active products only, sorted.

## Required env vars

- `DATABASE_URL` (auto)
- `SESSION_SECRET` (auto)
- `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` (provisioned via setupClerkWhitelabelAuth)
- `ADMIN_EMAILS` (optional, comma-separated emails to auto-promote to admin on first login)
- `AI_INTEGRATIONS_OPENAI_*` (provisioned via OpenAI integration) — required for the AI question generator.

## Seeding

`artifacts/api-server/src/lib/seed.ts` runs on startup:
- If `categories` is empty: inserts 6 Arabic categories × 6 questions.
- If `products` is empty: inserts 3 default packages (1/5/10 rounds at $0.99/$3.99/$6.99 with placeholder Payhip URLs).

## Question repetition prevention

`usersTable.seenQuestionIds` (jsonb int[]) tracks which question ids a user has already encountered. `POST /game/start` picks 1 question per (category, point-tier) preferring unseen ids, and only resets the seen-set for a category if the user has truly exhausted all of its questions for that tier. Used questions get added to `seenQuestionIds` when the game ends (`DELETE /game/active`).

## Database capacity

The Replit-managed Postgres instance comfortably stores tens of thousands of categories/questions/users/codes — practical limits are dictated by your project's storage quota, not schema design. Rough sizing:
- One question row ≈ 0.5 KB (text + answer + image URL). 100,000 questions ≈ ~50 MB.
- One user row ≈ 0.3 KB plus the `seenQuestionIds` jsonb (8 bytes/id). A user with 5,000 played questions adds ~40 KB.
- Promo codes ≈ 0.2 KB each. 1,000,000 codes ≈ ~200 MB.
For most use-cases (a few thousand questions, thousands of users, tens of thousands of codes) total storage stays well under 500 MB.

## Known follow-ups

- Replace placeholder Payhip URLs in the seeded products via the **المنتجات** admin tab with real product links.
- Optional: Payhip webhook → auto-generate promo code and email to buyer.
