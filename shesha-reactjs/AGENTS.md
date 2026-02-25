# AGENTS.md - AI Coding Agent Guide

> This file contains essential information for AI coding agents working on the Shesha ReactJS project.

## Project Overview

**@shesha-io/reactjs** is the React frontend application and UI library for the [Shesha Framework](https://www.shesha.io/) - an open-source Low-Code development framework built on top of ASP.NET Core, ABP.io, React, and Next.js.

The framework enables rapid development of business applications through:
- **Form Builder**: Drag-and-drop form designer with 40+ built-in components
- **Dynamic CRUD APIs**: Auto-generated APIs from domain entities
- **App Themer**: Zero-effort branding and theming
- **Administration Panel**: Built-in user management, roles, permissions, audit logs

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | ^18.3.1 |
| Framework | Next.js | ^14.2.4 |
| Language | TypeScript | ^5.9.2 |
| UI Library | Ant Design | ^5.27.6 |
| State Management | Redux Toolkit | ^2.9.0 |
| Build Tool | Rollup | ^4.49.0 |
| Testing | Jest + React Testing Library | ^30.2.0 |
| Linting | ESLint | ^9.39.2 |

### Key Dependencies
- `@reduxjs/toolkit` - State management
- `@microsoft/signalr` - Real-time communication
- `axios` - HTTP client
- `react-beautiful-dnd` - Drag and drop
- `@monaco-editor/react` - Code editor
- `jodit-react` - Rich text editor
- `react-chartjs-2` + `chart.js` - Charts
- `@react-awesome-query-builder/antd` - Query builder

## Project Structure

```
src/
├── apis/                    # API client definitions
├── app/                     # Next.js App Router
│   ├── (main)/             # Main layout group
│   ├── configuration-studio/ # Configuration studio page
│   ├── login/              # Login page
│   ├── no-auth/            # Public pages
│   ├── app-provider.tsx    # Root app provider
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable UI components (130+)
│   ├── antd/              # Ant Design wrappers
│   ├── configurableForm/  # Main form component
│   ├── dataTable/         # Data table components
│   └── ...
├── configuration-studio/   # Configuration studio module
├── designer-components/    # Form designer components (100+)
│   ├── _common/           # Shared designer utilities
│   ├── _settings/         # Settings components
│   ├── button/            # Button component
│   ├── dataTable/         # Data table designer
│   └── ...
├── enums/                  # TypeScript enums
├── form-factory/          # Form factory utilities
├── generic-pages/         # Built-in pages (dynamic, designer, settings)
├── hooks/                 # Custom React hooks (25+)
├── icons/                 # Custom icon components
├── interfaces/            # TypeScript interfaces (60+)
├── providers/             # React context providers (50+)
│   ├── auth/             # Authentication
│   ├── form/             # Form state management
│   ├── sheshaApplication/# Main app provider
│   ├── theme/            # Theme management
│   └── ...
├── publicJsApis/          # Public JavaScript APIs exposed to forms
├── shesha-constants/      # Application constants
├── styles/                # Global styles
├── typings/               # TypeScript type declarations
└── utils/                 # Utility functions (40+)
```

## Build System

### NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build library for production (ESLint → Rollup → tsc-alias) |
| `npm run start` | Watch mode for library development |
| `npm run dev` | Start Next.js development server |
| `npm run build-next` | Build Next.js application |
| `npm run start-next` | Start production Next.js server |
| `npm test` | Run Jest tests once (CI mode) |
| `npm run test:watch` | Run Jest tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint-fix` | Run ESLint with auto-fix |
| `npm run type-check` | Run strict TypeScript type checking |

### Build Configuration

**Library Build (Rollup)**:
- Entry: `src/index.tsx` + `src/providers/index.ts`
- Output: `dist/index.js` (CJS) + `dist/index.es.js` (ESM)
- Type declarations: `dist/index.d.ts`
- Plugins: TypeScript, PostCSS, SVGR, Terser, JSON
- Config: `rollup.config.mjs`

**Development Server (Next.js)**:
- Custom server: `server.js`
- Port: 3000 (configurable via `PORT` env)
- Standalone output mode
- Bundle analyzer: Set `ANALYZE=true`

## TypeScript Configuration

The project uses **project references** for efficient builds:

- `tsconfig.json` - Base configuration with project references
- `tsconfig.base.json` - Shared compiler options
- `tsconfig.rollup.json` - Library build (excludes `app/`)
- `tsconfig.next.json` - Next.js build
- `tsconfig.test.json` - Test configuration
- `tsconfig.strictNulls.json` - Strict null checks

**Path Mapping**:
```json
"@/*": ["./src/*"]
```

## Code Style Guidelines

### ESLint Configuration

Located in `eslint.config.mjs`. The project uses:

**Plugins**:
- `@typescript-eslint` - TypeScript rules
- `react` + `react-hooks` - React rules
- `@stylistic` - Code formatting
- `jsdoc` - JSDoc validation

**Strict Folders** (enhanced type checking):
- `src/configuration-studio`
- `src/providers/*/`
- `src/hooks`
- `src/form-factory`
- `src/designer-components/_settings/utils/background`

**Key Rules**:
- `explicit-function-return-type` - Required return types
- `no-explicit-any` - No `any` type in strict folders
- `no-unused-vars` - Unused variables are errors
- `react-hooks/exhaustive-deps` - Hook dependency checks
- `max-len: 300` - Line length limit

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for JSX, flexible for TS
- **Semicolons**: Required
- **Braces**: 1tbs style (same line)
- **Trailing commas**: Always multiline
- **Arrow functions**: Always use parentheses

```typescript
// Good
const myFunction = (props: IProps): JSX.Element => {
  const { value } = props;
  return <div>{value}</div>;
};

// Member delimiter style
interface IMyInterface {
  prop1: string;
  prop2: number;
}
```

## Testing

### Jest Configuration

- Config: `jest.config.js`
- Environment: `jsdom`
- Test pattern: `(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$`
- Setup: `@testing-library/jest-dom`

### Test Locations

Tests are co-located with source code in `__tests__` folders:

```
src/providers/form/__tests__/
src/providers/form/utils/__tests__/
src/providers/auth/__tests__/
src/providers/sidebarMenu/__tests__/
...
```

### Running Tests

```bash
npm test              # CI mode (once)
npm run test:watch    # Watch mode
```

## State Management Architecture

The project uses a **provider pattern** with React Context + Redux Toolkit:

### Key Providers (Hierarchy)

```
GlobalStateProvider
└── ShaApplicationProvider (backendUrl, router)
    ├── EntityCrudActions
    ├── UrlActions
    ├── EntityActions
    ├── StandardApis
    └── StoredFilesProvider
```

### Form State

- `ShaFormProvider` - Provides form instance
- `useShaForm()` hook - Creates/manages form state
- Form state is in `src/providers/form/store/`

### Adding New Providers

1. Create folder in `src/providers/myProvider/`
2. Export from `src/providers/myProvider/index.ts`
3. Add to `src/providers/index.ts` barrel export
4. Add to `src/index.tsx` if public API

## Component Development

### Form Components

Form designer components live in `src/designer-components/`:

```typescript
// Component structure
myComponent/
├── index.tsx           # Main component
├── settingsForm.json   # Designer settings form
├── interfaces.ts       # TypeScript interfaces
└── migrations/         # Version migrations
```

### Component Registration

Components are registered through the metadata system. See `src/providers/form/hooks.ts` for `useFormDesignerComponents()`.

### Public JavaScript APIs

Forms can execute JavaScript. Available APIs are in `src/publicJsApis/`:
- `httpClient` - HTTP requests
- `metadata` - Entity metadata
- `dataTableContextApi` - Data table operations
- `userApi` - Current user info
- `webStorageApi` - Local/session storage

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `BACKEND_URL` | Shesha backend API URL | `http://localhost:21021` |
| `NEXT_APP_ENV` | App environment | `dev` |
| `ANALYZE` | Enable bundle analyzer | `false` |
| `PORT` | Server port | `3000` |
| `SHA_LIGHT_BUILD` | Skip strict linting | `false` |

## Git Workflow

### Commit Convention

Uses [Commitizen](http://commitizen.github.io/cz-cli/) with conventional changelog:

```bash
npm run commit  # Interactive commit prompt
```

### Version Bumping

```bash
npm run changelog:patch  # Patch version
npm run changelog:minor  # Minor version
npm run changelog:major  # Major version
```

### Pre-commit Hooks

- Husky configured in `.husky/`
- lint-staged runs `eslint --quiet --fix` on staged files

## Dependencies Notes

### Peer Dependencies

These must be provided by the consuming application:
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `axios` ^1.13.2
- `antd` ^5.x
- `lodash` ^4.17.20
- `@microsoft/signalr` ^8.0.0

### Resolutions/Overrides

- `immer` locked to 9.0.21
- `jodit-react` locked to 4.1.2
- `rc-resize-observer` locked to 1.4.0

## Common Tasks

### Adding a New Component

1. Create component in `src/designer-components/myComponent/`
2. Define `index.tsx` with component logic
3. Create `settingsForm.json` for designer properties
4. Add interfaces in `interfaces.ts`
5. Register in component index
6. Export from `src/designer-components/index.ts` if needed

### Adding a New Provider

1. Create folder `src/providers/myProvider/`
2. Create context, provider, and hooks
3. Export from `src/providers/myProvider/index.ts`
4. Add to `src/providers/index.ts` barrel
5. Add to provider hierarchy in `AppProvider` if needed

### Adding a New Hook

1. Create file `src/hooks/useMyHook.ts`
2. Export from `src/hooks/index.ts`
3. Add JSDoc comments
4. Add tests in `src/hooks/__tests__/` if applicable

## Important Constraints

1. **No `any` type** in strict folders - use proper types
2. **Return types required** for all exported functions in strict folders
3. **No direct `nanoid` import** - use `@/utils/uuid`
4. **No direct `message`/`notification` from antd** - use `App.useApp()`
5. **No `console.log`** in production (stripped by Next.js compiler)
6. **Node.js >= 20** and **npm >= 10** required

## Documentation

- Main docs: https://docs.shesha.io
- Tutorial site: https://tutorial.shesha.dev
- MkDocs config: `mkdocs.yml`
- ReadTheDocs: `.readthedocs.yaml`

## License

GPL-3.0 - See [LICENSE.md](./LICENSE.md)

---

*Last updated: 2026-02-19*
