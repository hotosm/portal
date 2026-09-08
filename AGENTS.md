<!-- markdownlint-disable MD013 MD025 -->

# AGENTS.md

Guidance for AI coding agents in **Portal**.
Human maintainers are accountable for all merged changes.

---

## Project

Portal is HOT's unified front door: it aggregates projects and imagery from
the other HOT tools (Tasking Manager, Drone TM, OpenAerialMap, Export Tool)
behind one API and one UI, with HOT SSO for auth.

Because it is an aggregator, **most backend work is about talking to other
services' APIs safely** - timeouts, partial failures, and response shapes you
do not control.

**Stack:** Python 3.12 / FastAPI (async) / SQLAlchemy 2 + GeoAlchemy2 /
Alembic / PostgreSQL + PostGIS / asyncpg / `hotosm-auth` / React 19 +
TypeScript + Vite + Tailwind / Biome / uv / pnpm

---

## Required Reading Order

1. `ARCHITECTURE.md` - system architecture, key decisions, API conventions,
   and the full endpoint list. Read this first.
2. `README.md` - setup and development guidance.
3. `CONTRIBUTING.md` - contribution workflow and AI tool usage policy.
4. The router and service you are touching under `backend/app/`.

---

## Structure

```text
backend/app/api/        # FastAPI routers (base path /api)
backend/app/services/   # upstream integrations and business logic
backend/app/schemas/    # Pydantic request/response models
backend/app/models/     # SQLAlchemy models
backend/app/db/         # session and database setup
backend/app/core/       # config, auth, shared plumbing
backend/app/tests/      # pytest suite (pytest-asyncio)
backend/alembic/        # migrations
frontend/src/           # React 19 app
frontend/web-components/ # shared web components
frontend/messages/      # inlang translation messages
scripts/                # operational scripts
```

---

## Commands

Everything is exposed through the Makefile - run `make help` for the full
list.

```bash
make install         # install all dependencies
make dev             # full dev environment (Traefik via hot-dev-env if present,
                     # and brings up ../login if it exists)
make dev-standalone  # Portal only, http://localhost:5173
make dev-down        # stop the dev environment
make test            # backend and frontend tests
make test-backend    # pytest
make test-backend-cov # pytest with coverage
make test-frontend   # frontend tests
make lint            # lint frontend and backend
make lint-fix        # autofix
make migrate         # apply migrations
make migrate-create MSG="description"  # new migration
make db-shell        # psql shell
make health          # check service health
```

`make db-reset` deletes all data - never run it as part of a task unless the
user explicitly asked for it.

---

## Decisions Already Made

See `ARCHITECTURE.md § Key Decisions` for the reasoning. In short:

- **FastAPI, async throughout.** Nothing may block the event loop; upstream
  calls use async clients.
- **PostgreSQL + PostGIS**, accessed via SQLAlchemy 2 with `asyncpg`.
- **Monorepo** for atomic frontend/backend commits and one CI pipeline.
- **Biome replaces ESLint + Prettier**; **Ruff** replaces flake8/black;
  **uv** and **pnpm** are the package managers. Do not reintroduce the tools
  they replaced.
- **Auth is `hotosm-auth` against HOT SSO**, pinned exactly. Do not hand-roll
  auth or change the pin as a side effect.
- **API conventions are fixed**: base path `/api`, `/health` liveness,
  `/ready` readiness (includes a DB check). Upstream tools each get their own
  router namespace (`/api/tasking-manager/...`, `/api/drone-tasking-manager/...`,
  `/api/open-aerial-map/...`).
- **HTML from upstream is sanitised** (`nh3`, `beautifulsoup4`). Never render
  upstream HTML unsanitised.

---

## Where AI Help Is Welcome

- Tests for existing behaviour, including upstream failure cases
- Pydantic schemas and typing fixes
- Frontend components and styling
- Documentation
- Tightly scoped bug fixes with a reproducing test

## Where AI Must Not Act Unsupervised

- Authentication and session handling (`backend/app/core/`, `hotosm-auth`)
- Alembic migrations
- HTML sanitisation and any rendering of upstream content
- Object storage / `boto3` usage and credential handling
- Upstream integration contracts in `backend/app/services/` - a wrong
  assumption here shows up as broken data in the UI, not as an error
- CI workflows and deployment configuration

---

## Coding Standards

- Type hints on public functions; Ruff-clean; Biome-clean on the frontend.
- Async all the way down: no sync I/O in a request handler, and every upstream
  call needs a timeout and a defined behaviour on failure.
- Validate and shape upstream responses through `schemas/` rather than passing
  raw JSON through.
- TypeScript: no `any` to silence the compiler.
- Add user-facing strings to `frontend/messages/` rather than hardcoding them.

---

## Testing Standards

- New behaviour needs a `pytest` test under `backend/app/tests/`.
- Upstream calls are mocked (`respx` is already a dependency) - tests must not
  hit real HOT services.
- Cover the failure path, not just the happy path: upstream down, slow, or
  returning an unexpected shape.
- Never weaken or skip a failing test to make a change pass.

---

## Anti-Patterns

- Calling an upstream service without a timeout
- Editing applied migrations
- Committing secrets; `.env.example` and `.env.test.example` are the references
- Broad reformat-the-world diffs mixed into a behavioural change
- Running `make db-reset` unasked

---

## Workflow

1. Read `ARCHITECTURE.md` and the relevant router/service before changing code.
2. Keep the diff scoped to the task; raise anything else separately.
3. Run `make test` and `make lint`; state exactly what you ran.
4. Report what you changed and what you did not verify.

When uncertain, ask instead of assuming.

---

## Responsible AI Contribution Policy

- Org guidance for AI-assisted contributions: <https://responsibleai.guide>
- Declare the AI assistance level (0-5) in the PR template honestly. Never
  lower the declared level to get a PR reviewed.
- If nobody has read the result, that is level 5: open the PR as a draft.
- Do not work on issues labelled `good first issue` - they exist for humans.
- A human is accountable for every merged change.
