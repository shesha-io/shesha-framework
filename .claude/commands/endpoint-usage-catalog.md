# Endpoint Usage Catalog

Generate a comprehensive catalog of all backend API endpoints **actually referenced** by the frontend of a Shesha-based application. Analyzes three sources: (1) hard-coded TypeScript/React source, (2) form configurations stored in the database, and (3) entity bindings that imply CRUD endpoint usage. For each endpoint, identifies which pages or forms reference it and the nature of the reference (coded, form config property, embedded JavaScript, entity binding, data-source component).

This skill is designed to work on **any** Shesha-based application, not just the framework repository itself.

Arguments: `$ARGUMENTS`
- `--url <base_url>` — Backend base URL (default: `http://localhost:21021`)
- `--user <username>` — Auth username (default: `admin`)
- `--password <password>` — Auth password (default: `123qwe`)
- `--frontend-dir <path>` — Path to the React/Next.js frontend source directory (default: auto-detect)
- `--backend-dir <path>` — Path to the .NET backend source directory (default: auto-detect)
- `--output <path>` — Output catalog file path (default: `endpoint-usage-catalog.md`)
- `--skip-live` — Skip querying the backend API for form configurations (source-code only)
- `--skip-code` — Skip scanning TypeScript/React source (live API + form configs only)
- `--skip-backend` — Skip scanning .NET backend controllers (frontend + forms only)

## Instructions

### Step 0: Parse Arguments and Detect Project Layout

Parse `$ARGUMENTS` for the flags above. Set defaults:
- `BASE_URL` = `http://localhost:21021`
- `AUTH_USER` = `admin`
- `AUTH_PASSWORD` = `123qwe`
- `OUTPUT_PATH` = `endpoint-usage-catalog.md`

**Auto-detect project directories** if not explicitly provided:

For the **frontend directory**, search for these patterns from the working directory:
1. A directory containing `src/providers/` and `src/apis/` and a `package.json` with `@shesha-io/reactjs` dependency — this is a Shesha app's frontend.
2. `shesha-reactjs/src/` — the framework library itself.
3. Any `adminportal/` or `publicportal/` directory with a `next.config.js`.
4. A `src/` directory with React/Next.js structure.

For the **backend directory**, search for:
1. A `.sln` file containing Shesha references.
2. Directories containing `*AppService.cs` and `*Controller.cs` files.
3. `shesha-core/src/` — the framework backend.

Report which directories were detected and confirm with the user before proceeding.

Initialize tracking structures:
- `coded_endpoints[]` — endpoints found in TypeScript/React source
- `form_config_endpoints[]` — endpoints from form configuration properties
- `js_snippet_endpoints[]` — endpoints from embedded JavaScript in forms
- `entity_bindings{}` — entity type → list of forms
- `datasource_components[]` — entity/URL bindings from data-source components
- `backend_services[]` — all backend controllers and app services

### Step 1: Scan Coded Frontend for API References (unless --skip-code)

#### 1A: Identify the API infrastructure

Search the frontend `src/` directory for:
1. **API definition files** — Glob for `src/apis/*.ts` or `src/apis/*.tsx`. Each file typically defines endpoint URLs as constants or in hook definitions. Read each file and extract every `/api/` URL pattern.
2. **HTTP client hooks** — Search for files defining `useGet`, `useMutate`, `usePost`, `useDelete` hooks. Read them to understand how URLs are constructed.
3. **Constants files** — Grep for `ENDPOINT`, `API_URL`, `_PATH`, `_URL` constant definitions that contain `/api/` patterns.

For each API file found, extract:
- The endpoint URL (e.g., `/api/services/app/Session/GetCurrentLoginInfo`)
- The HTTP method (GET, POST, PUT, DELETE)
- The source file path

#### 1B: Scan providers for API calls

Grep the entire `src/providers/` directory for these patterns:
- String literals containing `/api/`
- Calls to `useGet(`, `useMutate(`, `usePost(`, `useDelete(`, `http.get(`, `http.post(`, `http.put(`, `http.delete(`
- URL construction patterns like `` `${baseUrl}/api/...` `` or `path: '/api/...'`

For each match, record the endpoint URL, HTTP method, and source file.

#### 1C: Scan components and designer-components

Grep `src/components/` and `src/designer-components/` for:
- `/api/` string literals
- `apiUrl`, `endpoint`, `dataSourceUrl` property values
- `fetch(` or `axios` calls with URL arguments

#### 1D: Scan app pages and generic-pages

Grep `src/app/` and `src/generic-pages/` for:
- Any `/api/` references
- Page-level data fetching patterns

#### 1E: Scan utils and other source files

Grep `src/utils/`, `src/hooks/`, `src/interfaces/`, and `src/shesha-constants/` for `/api/` patterns.

#### 1F: Compile coded endpoint list

Deduplicate all findings. For each unique endpoint, record:
- **Endpoint URL** (normalized — remove query strings for grouping)
- **HTTP method** (if determinable)
- **Source file(s)** that reference it
- **Context** — how it's used (hook definition, direct call, constant, etc.)

### Step 2: Retrieve and Analyze Form Configurations (unless --skip-live)

#### 2A: Authenticate

```bash
curl -s "$BASE_URL/api/TokenAuth/Authenticate" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"userNameOrEmailAddress\":\"$AUTH_USER\",\"password\":\"$AUTH_PASSWORD\"}"
```

Extract `accessToken` from `result.accessToken`. If auth fails, warn the user and offer credentials or continue with `--skip-live`.

#### 2B: Fetch all form configurations

```bash
curl -s "$BASE_URL/api/services/Shesha/FormConfiguration/GetAll?maxResultCount=10000" \
  -H "Authorization: Bearer $TOKEN"
```

This returns all form configurations with their full `markup` JSON. Save the response for analysis.

Report total form count and how many have markup (non-empty `markup` field).

#### 2C: Extract entity bindings (modelType)

For each form, check the `modelType` field. If non-empty, this form is **bound to an entity**, which means it auto-generates CRUD API calls:
- `Get` (read) — when loading a record
- `Create` (create) — when submitting a new record
- `Update` (update) — when submitting changes to an existing record
- `Delete` (delete) — when a delete action is triggered

Record each `modelType` → form mapping.

#### 2D: Deep-parse form markup for explicit API endpoints

For each form, parse the `markup` JSON and recursively search ALL values for API references. Specifically extract:

**URL property values** — These are form component properties that directly specify API endpoints:
- `getUrl` — data loading endpoint
- `postUrl` — create endpoint
- `putUrl` — update endpoint
- `deleteUrl` — delete endpoint
- `apiUrl` — generic API URL
- `dataSourceUrl` — data source endpoint
- `sourceUrl` — alternative data source URL
- `actionUrl` — action endpoint
- `customUrl` — custom endpoint
- `path` — sometimes contains API paths

For each, record the URL, the form name, and the property name.

**Action configurations** — Look for `actionConfiguration` objects with:
- `actionOwner`: the component or system that handles the action
- `actionName`: the action type (e.g., `API Call`, `Execute Script`, `Submit`, `Navigate`)

For `API Call` actions, extract the URL from `actionArguments`.

**Autocomplete/EntityPicker URLs** — Components of type `autocomplete`, `entityPicker`, or `entityReference` may have explicit `dataSourceUrl` or `apiUrl` properties containing API endpoints.

**DataSource components** — Components of type `dataList`, `datatableContext`, `dataTable`, or `childDataTable` with `entityType` properties. These imply CRUD API calls to the dynamic entity endpoint for that entity type.

#### 2E: Extract JavaScript snippets with API calls

Recursively search form markup for all string values in these keys:
- `expression`, `executeExpression`, `onExecute`
- `customJsCode`, `actionScript`, `jsCode`, `code`
- `onChangeCustom`, `onBlurCustom`, `onFocusCustom`
- `customVisibility`, `customEnabled`
- `onBeforeDataLoad`, `onAfterDataLoad`, `onPrepareSubmitData`
- `onBeforeSubmit`, `onSubmitSuccess`, `onSubmitFailed`
- `onValuesUpdate`
- `customFilter`, `filter`, `content`

For each string value found, check if it contains API call patterns:
- `/api/` string literals
- `http.get(`, `http.post(`, `http.put(`, `http.delete(`, `http.patch(`
- `fetch(` calls
- `axios` calls
- `const PATH = "...api..."` patterns

Extract the full JavaScript snippet (first 500 characters) and all API endpoints found within it. For each endpoint in JS, use regex:
- `/api/[^\s"'\`\}\)]+` to match API paths
- Also look for `const PATH = "..."` pattern and extract the URL from it

Record for each: the form name, the markup key (e.g., `expression`), the JS snippet preview, and the endpoint(s) called.

### Step 3: Catalog Backend API Surface (unless --skip-backend)

#### 3A: Scan controllers

Glob for `*Controller.cs` in the backend source directory. For each controller:
- Extract the class name
- Find `[Route]` attributes for base path
- Find all public methods with `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, `[HttpDelete]` attributes
- Determine the full endpoint URL pattern

#### 3B: Scan application services

Glob for `*AppService.cs` in the backend source directory. For each service:
- Extract the class name (the ABP convention auto-generates endpoints at `/api/services/app/{ServiceName}/{MethodName}`)
- List all public async methods (these become API endpoints)
- Note the base class (e.g., `DynamicCrudAppService`, `SheshaCrudServiceBase`, `SheshaAppServiceBase`)

Services inheriting from CRUD base classes automatically expose:
- `Get`, `GetAll`, `Create`, `Update`, `Delete` (and `CreateGql`, `UpdateGql` for GraphQL variants)

#### 3C: Enumerate Swagger services (if backend is running)

If `--skip-live` is not set, fetch the Swagger UI page to discover all registered service endpoints:

```bash
curl -s "$BASE_URL/swagger/index.html" | grep -oE '"swagger/[^"]*\.json"'
```

This lists all per-service Swagger JSON files. The service names in the URLs correspond to API service names.

### Step 4: Cross-Reference and Classify

#### 4A: Normalize endpoints

For grouping purposes, normalize endpoint URLs:
- Remove query string parameters
- Replace template parameters (`${id}`, `{{param}}`, `{param}`) with `{param}`
- Group variations of the same base endpoint

#### 4B: Classify reference types

For each unique endpoint, classify ALL sources that reference it:

| Reference Type | Description |
|---------------|-------------|
| `coded-frontend` | Hard-coded in TypeScript/React source files |
| `form-config-property` | Set as a URL property on a form component (`getUrl`, `apiUrl`, etc.) |
| `embedded-javascript` | Called from a JavaScript snippet within a form configuration |
| `entity-binding` | Implicitly referenced via a form's `modelType` (CRUD operations) |
| `datasource-component` | Referenced via a `datatableContext`, `entityPicker`, or `autocomplete` component's entity type |
| `action-configuration` | Referenced in a button/action's `actionConfiguration` (API Call action) |
| `autocomplete-datasource` | Explicit URL on an autocomplete component |

#### 4C: Identify unreferenced backend endpoints

Compare the backend API surface (Step 3) against all referenced endpoints (Steps 1-2). Flag endpoints that exist on the backend but are NOT referenced by any frontend code or form configuration. These may be:
- Internal/framework endpoints not meant for direct use
- Deprecated endpoints
- Endpoints used by external integrations
- Endpoints that should be disabled

### Step 5: Generate the Catalog Report

Write the catalog to `$OUTPUT_PATH` with this structure:

```markdown
# Comprehensive Endpoint Usage Catalog — {Application Name}

> Generated: {date}
> Branch: {git branch}
> Frontend: {frontend directory path}
> Backend: {backend directory path}
> Backend URL: {BASE_URL or "not queried"}
> Form configurations analyzed: {count}

---

## Methodology

{Describe the three sources analyzed and counts}

## Reference Type Legend

| Type | Description |
|------|-------------|
| coded-frontend | Hard-coded in TypeScript/React source |
| form-config-property | URL property on a form component |
| embedded-javascript | JS snippet in form configuration |
| entity-binding | Implicit via form modelType |
| datasource-component | Entity binding on data-source component |
| action-configuration | Button/action API Call configuration |
| autocomplete-datasource | Explicit URL on autocomplete component |

---

## Section A — Endpoints Referenced by Coded Frontend

{Group by category: Authentication, Forms, Entities, Metadata, Permissions, Settings, Files, etc.}

For each category, a table:

| Endpoint | Method | Source File(s) | Purpose |
|----------|--------|---------------|---------|

---

## Section B — Endpoints Referenced by Form Configurations

{Group by domain: User Management, Roles, Notifications, Scheduler, Settings, etc.}

For each domain:

| Endpoint | Method | Form(s) | Reference Type |
|----------|--------|---------|----------------|

---

## Section C — Entity Bindings (Implicit CRUD Endpoints)

| Entity Type | Bound Form(s) | Implied CRUD Endpoint Pattern |
|-------------|---------------|-------------------------------|

---

## Section D — Embedded JavaScript API Calls

| Endpoint | HTTP Method | Form(s) | JS Pattern |
|----------|------------|---------|------------|

---

## Section E — Data-Source Components

### datatableContext Components

| Entity Type | Form(s) |
|-------------|---------|

### entityPicker Components

| Entity Type | Form(s) |
|-------------|---------|

### autocomplete Components (with explicit URLs)

| URL | Form(s) |
|-----|---------|

---

## Section F — Full Backend API Surface

### Controllers
| Controller | Route Base | Key Endpoints |
|-----------|-----------|---------------|

### Application Services
| Service | Key Endpoints | Referenced by Frontend? |
|---------|--------------|-------------|

---

## Section G — Cross-Reference Matrix

| # | Endpoint | Coded Frontend | Form Config | Embedded JS | Entity Binding |
|---|----------|---------------|-------------|-------------|----------------|

---

## Section H — Unreferenced Backend Endpoints

Endpoints that exist on the backend but are not referenced by any frontend code or form:

| Endpoint | Service | Notes |
|----------|---------|-------|

---

## External URLs in Form Configs

{Flag any absolute URLs (https://...) found in form configs that point to external services}

| URL | Form | Context |
|-----|------|---------|

---

## Key Statistics

| Metric | Count |
|--------|-------|
| Total form configurations analyzed | ... |
| Forms with entity bindings | ... |
| Unique entity types bound to forms | ... |
| Unique API endpoints from coded frontend | ... |
| Unique API endpoints from form configs | ... |
| JavaScript snippets with API calls | ... |
| Total unique endpoints referenced | ... |
| Backend services available (not all referenced) | ... |
| Unreferenced backend endpoints | ... |
```

### Step 6: Print Summary

Print a concise summary to the console:

```
Endpoint Usage Catalog generated: {OUTPUT_PATH}

Sources analyzed:
  - Frontend source files:   {count} files with API references
  - Form configurations:     {count} forms ({count} with entity bindings)
  - Backend services:        {count} controllers + app services

Endpoint references found:
  - From coded frontend:     {count} unique endpoints
  - From form config props:  {count} unique endpoints
  - From embedded JS:        {count} unique endpoints across {count} snippets
  - From entity bindings:    {count} entity types ({count} implied CRUD endpoint groups)
  - From data-source comps:  {count} entity/URL bindings

Cross-reference:
  - Total unique endpoints referenced:  {count}
  - Backend endpoints unreferenced:     {count}
  - External URLs found in forms:       {count}

Potential issues:
  - {list any hard-coded external URLs}
  - {list any deprecated endpoint patterns}
  - {list any endpoints referenced but not found on backend}
```

### Appendix: How Shesha Forms Reference Endpoints

This section explains the mechanisms for future reference:

1. **Entity binding (modelType)** — When a form's `modelType` is set to an entity type (e.g., `Shesha.Core.Person`), the form framework auto-resolves CRUD API endpoints from entity metadata. The metadata is fetched from `/api/services/app/Metadata/Get?container={entityType}` and contains `apiEndpoints` with `create`, `read`, `update`, `delete` entries. Form submission, data loading, and deletion all route through these auto-resolved endpoints.

2. **Form component URL properties** — Components like `subForm`, `autocomplete`, `entityPicker`, and `datatableContext` can have explicit `getUrl`, `apiUrl`, or `dataSourceUrl` properties that point to specific backend endpoints.

3. **Action configurations** — Button and toolbar components use `actionConfiguration` objects. The `API Call` action type allows specifying an arbitrary URL, HTTP method, and parameters. The `Execute Script` action type runs JavaScript that can call any endpoint via the `http` object.

4. **Embedded JavaScript** — Form lifecycle hooks (`onBeforeSubmit`, `onSubmitSuccess`, `expression`, etc.) contain JavaScript code that runs in the browser. This code has access to an `http` object (axios wrapper) that can call any backend endpoint. These are the hardest references to discover because they're embedded as string values in JSON form markup.

5. **Data-source components** — `datatableContext` components bind to an entity type and automatically query the entity's `GetAll` endpoint for listing data. `entityPicker` components use the entity's autocomplete endpoint.
