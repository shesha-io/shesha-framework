# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shesha is an open-source Low-Code development framework for .NET developers. It combines ASP.NET Core, ABP.io, React, and Next.js with drag-and-drop form building capabilities to reduce code requirements by 80%+ for typical business applications.

## Repository Structure

```
shesha-framework/
├── shesha-core/              # .NET backend framework (main solution)
├── shesha-reactjs/           # React/TypeScript component library (@shesha-io/reactjs)
├── shesha-starter/           # Starter template for new projects
├── shesha-functional-tests/  # Functional test suite
```

## Build Commands

### Backend (.NET 8.0)

```bash
# Build the framework
dotnet build shesha-core/Shesha.sln --configuration Release

# Run backend tests (requires Docker for Testcontainers)
cd shesha-core/test/Shesha.Tests
dotnet test Shesha.Tests.csproj --configuration Release
```

### Frontend (Node.js 20+, npm 10+)

```bash
# Install dependencies
cd shesha-reactjs
npm install

# Build the library (includes lint check)
npm run build

# Run tests
npm test

# Run single test file
npm test -- --testPathPattern="path/to/test"

# Watch mode for development
npm run start

# Lint
npm run lint
npm run lint-fix

# Type check (strict null checks)
npm run type-check
```

### Starter Application

```bash
# Frontend development
cd shesha-starter/frontend
npm install
npm run dev

# Production build
npm run build
npm run start
```

## Architecture

### Backend Layered Architecture

1. **Domain Layer** (`Shesha.Core`) - Domain entities, interfaces, business logic
2. **Framework Layer** (`Shesha.Framework`) - Dynamic CRUD, metadata, configuration studio, JSON logic engine
3. **Application Layer** (`Shesha.Application`) - Application services, DTOs, CRUD app services
4. **Web Layer** (`Shesha.Web.Host`, `Shesha.Web.Core`) - API controllers, authorization, Swagger

### ABP Module System

Modules inherit from `SheshaModule` with lifecycle hooks:
- `PreInitialize()` - Register services
- `Initialize()` - Configure services
- `InitializeConfigurationAsync()` - Async initialization

Key modules: `Shesha.NHibernate` (ORM), `Shesha.GraphQL`, `Shesha.Scheduler` (HangFire), `Shesha.FluentMigrator`

### Frontend Architecture

**Provider Pattern** - Context providers for state management:
- `SheshaApplicationProvider` - App-level configuration
- `FormDesignerProvider` - Form builder context
- `DataContextProvider` - Data management (appContext, pageContext, formContext)

**Key Directories** (`shesha-reactjs/src/`):
- `components/` - 40+ UI components (dataTable, autocomplete, modal, etc.)
- `designer-components/` - Form builder components
- `providers/` - Context providers
- `hooks/` - Custom React hooks (useGet, useMutate, useFormExpression, etc.)
- `apis/` - API integration layer

### Dynamic CRUD Pattern

Backend automatically generates CRUD APIs from domain entities via `DynamicCrudAppService`. Enable through entity configuration - no boilerplate code needed.

### DataContext (v0.44+)

Replaces GlobalState to prevent unnecessary re-renders:
- `appContext` - App-wide data
- `pageContext` - Page-scoped data
- `formContext` - Form-scoped data

## Testing

### Backend Tests
- Framework: xUnit with Testcontainers
- **Requires Docker daemon running**
- Tests run against SQL Server/PostgreSQL in containers

### Frontend Tests
- Framework: Jest with React Testing Library
- Config: `jest.config.js`
- Test files: `*.test.ts` or `*.spec.tsx` in `src/`

## Key Patterns

### Form Configuration
- Default values set via `onAfterDataLoad` scripts (not DefaultValue property)
- Scripts execute in dependency order
- Direct write access to `data` and `context` without SetFieldValue

### Commits
Use conventional commits via Commitizen: `npm run commit`

## Database Support

- Primary: SQL Server, PostgreSQL (via NHibernate)
- Additional: MongoDB (Shesha.MongoRepository), PostGIS for geographic data
- Migrations: FluentMigrator
