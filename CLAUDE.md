# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shesha Framework is an open-source Low-Code development framework for .NET developers. It combines a React/Next.js frontend library (`shesha-reactjs`) with a .NET Core backend (`shesha-core`) to provide drag-and-drop form builders, dynamic CRUD APIs, and admin functionality.

## Repository Layout

```
shesha-core/              # .NET backend (ASP.NET Core 8, NHibernate, ABP framework)
shesha-reactjs/           # React UI library (React 18, Ant Design 5, Next.js)
shesha-starter/           # Template for new Shesha projects
shesha-functional-tests/  # Integration test suite (backend + admin/public portals)
```

## Build & Development Commands

### Frontend (shesha-reactjs/)

```bash
cd shesha-reactjs
npm install
npm run dev              # Next.js dev server with hot-reload
npm run build            # Rollup build → dist/ (CJS + ESM + types)
npm run build-next       # Next.js production build
npm test                 # Jest (CI mode, single-threaded)
npm run test:watch       # Jest watch mode
npm run lint             # ESLint check
npm run lint-fix         # ESLint auto-fix
npm run type-check       # TypeScript strict null checks (tsconfig.strictNulls.json)
```

### Backend (shesha-core/)

```bash
cd shesha-core
dotnet build
dotnet test
dotnet run --project src/Shesha.Web.Host --urls "http://localhost:21021;https://localhost:44362"
```

Solution file: `shesha-core/Shesha.sln`

## Architecture

### Backend Modules (shesha-core/src/)

- **Shesha.Framework** — Core framework logic, base classes, configuration items
- **Shesha.Application** — Application services layer
- **Shesha.Core** — Core domain entities
- **Shesha.Web.Host** — API host entry point
- **Shesha.Web.Core** — Web-specific core (authentication, etc.)
- **Shesha.Web.FormsDesigner** — Form builder backend
- **Shesha.NHibernate** — ORM integration (NHibernate)
- **Shesha.FluentMigrator** — Database migrations
- **Shesha.GraphQL** — GraphQL endpoint support
- **Shesha.Scheduler** — Background jobs (Hangfire)
- **Shesha.Testing** — Test utilities and base classes

Backend uses ABP framework patterns with Domain-Driven Design. Warnings are treated as errors (`Directory.Build.props`), with suppressed warnings: CS1591, 612, 618, 809, AsyncFixer01.

### Frontend Structure (shesha-reactjs/src/)

- **providers/** — React Context providers (state management pattern)
- **components/** — 40+ pre-built form components
- **designer-components/** — Form builder drag-and-drop components
- **hooks/** — Custom React hooks
- **apis/** — API client integration (auto-generated, excluded from linting)
- **app/** and **app-components/** — Next.js app router pages/components
- **utils/** — Utility functions
- **publicJsApis/** — Public JavaScript APIs exposed to form configurations

The frontend is published as an npm library (`@shesha-io/reactjs`) via Rollup, producing CJS, ESM, and type definitions in `dist/`.

## Code Style & Conventions

### Frontend

- **Prettier**: single quotes, 2-space indent, 120 char width, trailing commas (es5), semicolons
- **ESLint** (v9 flat config): TypeScript strict rules, React Hooks enforcement
- **Naming**: camelCase, UPPER_CASE, or PascalCase for variables (no leading/trailing underscores)
- **Unused vars**: prefix with `_` (e.g., `_unusedParam`)
- **Restricted imports**:
  - Use `@/utils/uuid` instead of `nanoid` or `nanoid/non-secure`
  - Use `App.useApp()` for `message` and `notification` instead of importing from `antd`
  - Do not import from `@/utils/publicUtils`
- **No console.log**: only `console.warn` and `console.error` allowed
- **Path alias**: `@/*` maps to `./src/*`
- **Max line length**: 300 characters (ESLint), 120 (Prettier)

### Backend

- C# with .NET 8, NHibernate ORM
- Warnings treated as errors in builds
- Release builds auto-generate NuGet packages

## Git Hooks

Pre-commit hook (`.husky/pre-commit`) runs `lint-staged` on:
- `shesha-reactjs/`
- `shesha-functional-tests/adminportal/`
- `shesha-functional-tests/publicportal/`

## CI/CD

Azure Pipelines (`shesha-io.shesha-framework-test.yml`):
- Triggers on `main`, `releases/*` branches and `release-*` tags
- Builds backend (.NET), frontend (Node 21), and packages NuGet artifacts
- Node builds use `--max_old_space_size=8192`

## Testing

- **Frontend**: Jest with ts-jest, jsdom environment. Tests in `__tests__/` dirs or `*.test.ts(x)` files
- **Backend**: xUnit-based tests in `shesha-core/test/Shesha.Tests/`
- **Functional tests**: Separate solution at `shesha-functional-tests/backend/`
