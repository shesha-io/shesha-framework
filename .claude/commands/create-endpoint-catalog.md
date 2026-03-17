---
name: create-endpoint-catalog
description: Generate a comprehensive, security-annotated catalog of every HTTP endpoint exposed by a Shesha framework application. Covers both auto-generated CRUD endpoints and hand-coded application services. Cross-references live API configuration, source code attributes, and Swagger documentation to produce a single authoritative inventory.
argument-hint: "[--url <base_url>] [--skip-swagger] [--skip-code] [--skip-live]"
allowed-tools: Bash, Read, Grep, Glob, Write, Edit, Agent, WebFetch
model: opus
---

# Endpoint Catalog

Generate a comprehensive, security-annotated catalog of every HTTP endpoint exposed by a Shesha framework application. Covers both auto-generated CRUD endpoints and hand-coded application services. Cross-references live API configuration, source code attributes, and Swagger documentation to produce a single authoritative inventory.

Arguments: `$ARGUMENTS`
- `--url <base_url>` — Backend base URL (default: `http://localhost:21021`)
- `--user <username>` — Auth username (default: `admin`)
- `--password <password>` — Auth password (default: `123qwe`)
- `--output <path>` — Output catalog file path (default: `endpoint-catalog-report.md`)
- `--skip-swagger` — Skip Swagger verification pass
- `--skip-code` — Skip source code analysis (live API only)
- `--skip-live` — Skip live API queries (source code only)
- `--entity-filter <pattern>` — Only catalog entities matching this pattern (e.g., `Shesha.Domain.*`)
- `--service-filter <pattern>` — Only catalog services matching this pattern

## Instructions

### Step 0: Parse Arguments and Initialize

Parse `$ARGUMENTS` for the flags above. Set defaults:
- `BASE_URL` = `http://localhost:21021`
- `AUTH_USER` = `admin`
- `AUTH_PASSWORD` = `123qwe`
- `OUTPUT_PATH` = `endpoint-catalog-report.md`

Initialize tracking structures:
- `endpoints[]` — master list of all discovered endpoints
- `permissionedObjects{}` — map of object name → PermissionedObject config
- `entityConfigs{}` — map of entity fullClassName → ModelConfiguration
- `specifications{}` — map of entity type → list of specifications
- `codeAttributes{}` — map of controller/service → code-level auth attributes

Read the endpoint permissions API reference from the project root: `endpoint-permissions-api-reference.md`. This documents all the API endpoints you will call in Steps 2-4 and the data structures they return.

### Step 1: Authenticate (unless --skip-live)

```bash
curl -s "$BASE_URL/api/TokenAuth/Authenticate" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"userNameOrEmailAddress\":\"$AUTH_USER\",\"password\":\"$AUTH_PASSWORD\"}"
```

Extract `accessToken` from `result.accessToken`. If auth fails, warn the user and offer to continue with `--skip-live`.

Store `TOKEN` for all subsequent API calls. All curl commands below should include `-H "Authorization: Bearer $TOKEN"`.

### Step 2: Collect All Live API Data (unless --skip-live)

Run the following data collection calls. These can be parallelized.

#### 2A: Enumerate All HTTP Endpoints via API

```bash
curl -s "$BASE_URL/api/services/app/Api/Endpoints?term=&maxResultCount=10000" \
  -H "Authorization: Bearer $TOKEN"
```

This returns `AutocompleteItemDto[]` with `value` (URL) and `displayText`. Parse every endpoint into the master list with its URL.

**Important:** This endpoint filters out disabled endpoints. To get the complete picture including disabled ones, also query the Swagger JSON in Step 3.

#### 2B: Fetch All PermissionedObject Records

Fetch **all types** to get the complete picture. Run these queries:

```bash
# App service endpoints (service-level)
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?type=Shesha.WebApi&showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"

# App service endpoints (action-level)
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?type=Shesha.WebApi.Action&showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"

# Entity-level permissions
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?type=Shesha.Entity&showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"

# Entity action permissions
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?type=Shesha.Entity.Action&showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"

# Dynamic CRUD service permissions
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?type=Shesha.WebCrudApi&showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"

# Dynamic CRUD action permissions
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?type=Shesha.WebCrudApi.Action&showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"

# Form permissions
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?type=Shesha.Form&showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"
```

For each returned `PermissionedObjectDto`, store:
- `object` — the permission object name (e.g., `Shesha.EntitiesAppService@GetAll`)
- `access` — configured access level (1-5)
- `actualAccess` — resolved access after inheritance
- `permissions` — required permission names (array of strings, e.g., `["pages.roles", "pages.users"]`). These are the permissions configured directly on this object.
- `actualPermissions` — resolved permission names after inheritance. If `permissions` is empty but a parent has permissions, `actualPermissions` will contain the parent's permissions.
- `hardcoded` — whether registered from code attributes
- `hidden` — whether hidden from the UI tree
- `type` — object type

**Important:** When `access=4` (RequiresPermissions), the `permissions`/`actualPermissions` arrays contain the specific permission names that grant access. Multiple permissions use **OR logic** (`requireAll=false` is hardcoded) — a user with ANY one of the listed permissions is granted access. Record these permission names for every endpoint; they are essential for the catalog output.

#### 2C: Fetch All Entity Configurations and Model Configs

```bash
# Get all entity configs
curl -s "$BASE_URL/api/services/app/EntityConfig/GetMainDataList?maxResultCount=10000&sorting=className" \
  -H "Authorization: Bearer $TOKEN"
```

For each entity with `generateAppService == true`, fetch the full model configuration to get per-action permissions:

```bash
curl -s "$BASE_URL/api/ModelConfigurations/{id}" \
  -H "Authorization: Bearer $TOKEN"
```

From the ModelConfiguration response, extract:
- `generateAppService` — whether CRUD APIs are generated
- `permission` — entity-level permission (overall)
- `permissionGet` — GET action permission
- `permissionCreate` — CREATE action permission
- `permissionUpdate` — UPDATE action permission
- `permissionDelete` — DELETE action permission

Each permission field is a `PermissionedObjectDto` with `access`, `actualAccess`, `permissions`, etc.

**Optimization:** If `--entity-filter` is set, only fetch model configs for matching entities.

#### 2D: Fetch Security Settings

```bash
curl -s "$BASE_URL/api/services/app/Settings/GetValue?module=Shesha&name=Shesha.Security" \
  -H "Authorization: Bearer $TOKEN"
```

Extract `defaultEndpointAccess` — this is the fallback for `Inherited` endpoints handled by `ApiAuthorizationHelper` ONLY. It does NOT apply to CRUD-named methods (see Step 4D and the critical classification rule in Step 5B).

#### 2E: Fetch Specifications for Each Entity

For each entity that has `generateAppService == true`, query available specifications:

```bash
curl -s "$BASE_URL/api/services/app/Metadata/Specifications?entityType={fullClassName}" \
  -H "Authorization: Bearer $TOKEN"
```

This returns `SpecificationDto[]` with:
- `name` — fully qualified specification class name
- `friendlyName` — display name
- `description` — what it filters

These are **non-global** (client-selectable) specifications. For global specifications, you must check source code (Step 4).

#### 2F: Fetch All Permission Definitions and Role Assignments

Collect the full permission inventory so that permissioned endpoints can be cross-referenced with which roles have access.

**Step 1 — Get all permission definitions:**

```bash
curl -s "$BASE_URL/api/services/app/PermissionDefinition/GetAll?maxResultCount=10000" \
  -H "Authorization: Bearer $TOKEN"
```

This returns all defined permissions with:
- `name` — permission identifier string (e.g., `pages.roles`, `pages.users`, `Shesha.Administration`)
- `displayName` — human-readable name
- `description` — what the permission grants
- `parent` — parent permission (permissions form a hierarchy)
- `isDbPermission` — whether defined in DB (vs. code)

Store as `permissionDefinitions{}` — map of permission name → definition.

**Step 2 — Get all roles and their assigned permissions:**

```bash
# Get all roles
curl -s "$BASE_URL/api/services/app/ShaRole/GetAll?maxResultCount=1000" \
  -H "Authorization: Bearer $TOKEN"
```

For each role, fetch its assigned permissions:

```bash
curl -s "$BASE_URL/api/services/app/ShaRoleAppointedPersons/GetPermissions?roleId={roleId}" \
  -H "Authorization: Bearer $TOKEN"
```

If the above endpoint is not available, try the standard ABP role permissions endpoint:

```bash
curl -s "$BASE_URL/api/services/app/Role/GetRoleForEdit?Id={roleId}" \
  -H "Authorization: Bearer $TOKEN"
```

This returns the role with `grantedPermissionNames[]`.

Store as `rolePermissions{}` — map of role name → list of granted permission names.

**Step 3 — Build the reverse mapping:**

Create `permissionToRoles{}` — map of permission name → list of role names that grant it. This allows the catalog to show, for each permissioned endpoint, which roles can access it.

### Step 3: Verify Against Swagger (unless --skip-swagger or --skip-live)

Fetch the main Swagger JSON:

```bash
curl -s "$BASE_URL/swagger/v1/swagger.json" \
  -H "Authorization: Bearer $TOKEN"
```

If that returns 404, try:
```bash
curl -s "$BASE_URL/swagger/v1/swagger.json"
```

**Known issue:** Swagger JSON generation may return HTTP 500 or 0 bytes on large Shesha applications due to memory/timeout constraints during OpenAPI document generation. If Swagger is unavailable, skip this step and note it in the catalog. The PermissionedObject API data (Step 2B) and source code analysis (Step 4) are more authoritative for security classification anyway.

Parse the OpenAPI document to:
1. **Enumerate all paths** — each path+method is an endpoint
2. **Extract metadata** — operation descriptions, parameter schemas, tags
3. **Cross-reference** — match each Swagger path to the PermissionedObject and EntityConfig data collected in Step 2
4. **Identify gaps** — endpoints in Swagger but NOT in PermissionedObject records (these rely on defaults)
5. **Identify disabled** — PermissionedObject records with `Disable` access that should NOT appear in Swagger (verify the `SwaggerDocumentFilter` is working)

**Note:** Swagger may expose per-service documents at `/swagger/service:{ServiceName}/swagger.json`. The main document should aggregate all of them.

**Swagger path → PermissionedObject mapping rules:**
- App service endpoints follow pattern: `/api/services/{module}/{ServiceName}/{ActionName}`
  - PermissionedObject name: `{Namespace}.{ServiceName}@{ActionName}` (type: `Shesha.WebApi.Action`)
- Dynamic CRUD endpoints follow pattern: `/api/dynamic/{module}/{EntityName}/Crud/{Action}`
  - PermissionedObject name: `{Namespace}.{EntityName}@{CrudAction}` (type: `Shesha.Entity.Action`)
- Controller endpoints follow pattern: `/api/{ControllerName}/{ActionName}`
  - PermissionedObject name: `{Namespace}.{ControllerName}@{ActionName}` (type: `Shesha.WebApi.Action`)

### Step 4: Source Code Analysis (unless --skip-code)

Analyze the backend source code for authorization attributes and specification registrations.

#### 4A: Scan Controllers and App Services for Auth Attributes AND Base Classes

For each `*Controller.cs` and `*AppService.cs` file in the backend source tree:

1. **Read the file** and check for:
   - Class-level: `[Authorize]`, `[AbpAuthorize(...)]`, `[AbpMvcAuthorize(...)]`, `[SheshaAuthorize(...)]`, `[AllowAnonymous]`, `[AbpAllowAnonymous]`
   - Method-level: same attributes per public method
   - **Base class**: Whether the class extends `AbpCrudAppService`, `AsyncCrudAppService`, `SheshaCrudServiceBase`, `DynamicCrudAppService`, or any class in the CRUD hierarchy. This is CRITICAL for classification — see Step 5B.

   **Extract specific permission names from code attributes:**
   - `[AbpAuthorize("PermissionName")]` — single permission
   - `[AbpAuthorize("Perm1", "Perm2")]` — multiple permissions (OR logic)
   - `[AbpMvcAuthorize("PermissionName")]` — same as AbpAuthorize
   - `[SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, "PermissionName")]` — explicit access level + permission

   For each class and method, record:
   - `codePermissions[]` — the permission name strings from the attribute arguments
   - `codeAccessLevel` — the access level (Anonymous, Authenticated, RequiresPermissions, etc.)

   These are the **bootstrap-time** values that populate the DB. At runtime, the DB `permissions`/`actualPermissions` fields are what's checked (see Phase 2 below), but the code values are the authoritative source when `hardcoded=true`.

   Build a set `crudServiceClasses{}` of all class names that extend AbpCrudAppService (directly or transitively). Search for patterns like:
   - `: AbpCrudAppService<`
   - `: AsyncCrudAppService<`
   - `: SheshaCrudServiceBase<`
   - `: DynamicCrudAppService<`
   - `: AbpAsyncCrudAppService<`

   The Shesha CRUD hierarchy is: `DynamicCrudAppService` → `SheshaCrudServiceBase` → `AbpAsyncCrudAppService` → `AbpCrudAppService`

2. **Understand how code attributes relate to runtime enforcement:**

   Code attributes have TWO effects that operate at DIFFERENT times:

   **At bootstrap time (application startup):** `ApiPermissionedObjectProvider` reads these attributes and writes their values into the PermissionedObject database table. This sets the initial DB config.
   - `[AllowAnonymous]` → DB record with `access=5`, `hardcoded=true`
   - `[AbpAuthorize("perm")]` → DB record with `access=4, permissions=["perm"]`, `hardcoded=true`
   - `[AbpMvcAuthorize]` → same as AbpAuthorize, `hardcoded=true`
   - `[SheshaAuthorize(access)]` → DB record with specified access, `hardcoded=false`
   - No attribute → DB record with `access=2` (Inherited), `hardcoded=false`

   When `hardcoded=true`, the bootstrapper RESETS DB values on every restart (admin changes are lost).
   When `hardcoded=false`, admin changes to the DB survive restarts.

   **At runtime (per-request):** Only TWO things are checked:
   - `[AllowAnonymous]`/`[AbpAllowAnonymous]` — checked by `SheshaAuthorizationFilter` and `ApiAuthorizationHelper` BEFORE any DB lookup. **This is the ONLY code attribute that has a runtime effect. It bypasses all DB config.**
   - `[SheshaAuthorize]`/`[AbpAuthorize]` — **NOT checked at runtime.** These attributes are only used at bootstrap time to populate the DB. At runtime, only the DB value matters via `ObjectPermissionChecker`.

3. **For each method**, determine the effective enforcement using the decision tree in `<command-base-dir>/references/endpoint-catalog-enforcement-rules.md` (section "The Definitive Precedence Model"). The key rules are:
   - If `[AllowAnonymous]` present → **Anonymous (code override)** — DB settings are IRRELEVANT
   - Otherwise → **DB value is what's enforced at runtime**, regardless of what other code attributes say
   - If no DB record exists → a default with `Access=Inherited` is created, then resolved via parent chain or `DefaultEndpointAccess` fallback (for non-CRUD) or accidental auth-only (for entity CRUD)

#### 4B: Check for Permission Check Calls in Dynamic Entity Methods

Read `EntitiesAppService.cs` (the dynamic entities gateway). For each public method, check whether it calls `CheckPermissionAsync()`:

- Methods WITH `CheckPermissionAsync()`: entity-level permissions enforced
- Methods WITHOUT: **authorization gap** — flag in the catalog with a recommendation

Known gap methods (verify current state):
- `ExportToExcelAsync` — data export without auth check
- `SpecificationsAsync` — specification listing without auth check
- `ReorderAsync` — write operation without auth check

#### 4C: Discover Global Specifications

Search the source code for specification classes:

```
Grep for: `\[GlobalSpecification\]` across the backend source tree
Grep for: `class.*:.*ShaSpecification<` to find all specification classes
```

For each specification found:
- Note the entity type it applies to (generic argument of `ShaSpecification<T>`)
- Check for `[GlobalSpecification]` attribute — if present, it applies to ALL queries automatically
- Check for `[Display(Name = "...")]` attribute for the friendly name
- Read the `BuildExpression()` method to understand what it filters

Also check for:
- `[ApplySpecifications(typeof(...))]` attributes on controller methods — these force specific specs on certain endpoints
- `[DisableSpecifications]` attributes — these bypass all specs for that endpoint

#### 4D: Map CRUD Method Authorization Coverage

Read `PermissionedObjectManager.CrudMethods` dictionary. Identify:
- Which method names are mapped (these get entity-level permission checks via `EntityCrudAuthorizationHelper`)
- Which method names are NOT mapped (these fall through to `ApiAuthorizationHelper` and get service-level checks instead)

Currently mapped: `GetAll`, `QueryAll`, `Get`, `Query`, `Create`, `CreateGql`, `Update`, `UpdateGql`, `Delete`

Flag any CRUD-like methods in `DynamicCrudAppService` or `EntitiesAppService` that are NOT in this mapping.

**CRITICAL — CrudMethods affects ALL app services, not just CRUD services:**

`ApiAuthorizationHelper` checks the `CrudMethods` dictionary for EVERY app service method, not just methods on `AbpCrudAppService` subclasses. If the method name (after removing `Async` suffix) matches a CrudMethods key, `ApiAuthorizationHelper` SKIPS the method entirely (it assumes `EntityCrudAuthorizationHelper` will handle it).

This means for `Inherited` endpoints:
- **Method name IN CrudMethods** (e.g., `GetAll`, `Get`, `Create`, `Update`, `Delete`):
  - `ApiAuthorizationHelper` SKIPS → `DefaultEndpointAccess` is NOT applied
  - `EntityCrudAuthorizationHelper` handles it IF the service extends `AbpCrudAppService<>` (with `replaceInherited=NULL`)
  - If the service does NOT extend `AbpCrudAppService<>`, BOTH helpers skip → standard ABP authorization applies (requires authentication by default)
  - **Either way: NOT anonymous, even if DefaultEndpointAccess=AllowAnonymous**
- **Method name NOT IN CrudMethods** (e.g., `ExportToExcel`, `Reorder`, `ActivateMembership`):
  - `ApiAuthorizationHelper` handles it → `DefaultEndpointAccess` IS applied as `replaceInherited`
  - If `DefaultEndpointAccess=5`, the endpoint is anonymous

The CrudMethods match is **exact** — `GetAll` matches but `GetAllMembershipPayments` does NOT.

Build a set `crudMethodNames` from this dictionary for use in Step 5B classification.

### Step 5: Merge and Classify All Endpoints

Combine data from Steps 2-4 into a unified catalog. For each endpoint, determine:

#### 5A: Endpoint Identity
- **HTTP Method** (GET, POST, PUT, DELETE)
- **URL** (full path)
- **Description** — from Swagger `summary`/`description`, or method XML docs
- **Group** — logical grouping (see Step 6 grouping rules)
- **DB Record** — whether a PermissionedObject record exists in the database for this endpoint. Values:
  - `Yes` — a record exists (from Step 2B data). The endpoint's authorization is explicitly configured.
  - `No` — no record found. The endpoint relies on defaults: either `DefaultEndpointAccess` fallback (non-CRUD) or accidental auth-only behavior (CRUD). This is a key indicator of unconfigured security.
  - `Auto-created` — no explicit record existed, but `ObjectPermissionChecker` auto-creates a default with `Access=Inherited` at runtime. This is functionally the same as "No" for security purposes.

  To determine this: check if the endpoint's PermissionedObject name (e.g., `Shesha.FormConfigurationAppService@GetAll`) appears in the Step 2B data. If not, it has no explicit DB record.

#### 5B: Authorization Classification

**IMPORTANT:** Follow the 6-step decision tree in `<command-base-dir>/references/endpoint-catalog-enforcement-rules.md` (section "The Definitive Precedence Model") to determine the correct classification for each endpoint. Do NOT guess — walk through each step.

Key principles:
1. **`[AllowAnonymous]` is the ONLY code attribute that enforces at runtime.** All other code attributes (`[SheshaAuthorize]`, `[AbpAuthorize]`) only set initial DB values at bootstrap time. At runtime, the DB value is what's checked (via `ObjectPermissionChecker`).
2. **`DefaultEndpointAccess` ONLY applies to non-CRUD-named methods.** `ApiAuthorizationHelper` skips any method whose name (exact match, after removing `Async` suffix) is in the `CrudMethods` dictionary. For those methods, `DefaultEndpointAccess` is irrelevant. See the classification decision tree below.

**CRITICAL — Classification decision tree for `Inherited` (actualAccess=2) endpoints:**

For every `Inherited` endpoint, you MUST determine which authorization helper handles it:

```
Is the method name (after @) an EXACT match in CrudMethods?
(GetAll, QueryAll, Get, Query, Create, CreateGql, Update, UpdateGql, Delete)

  YES → ApiAuthorizationHelper SKIPS this method.
  │     DefaultEndpointAccess does NOT apply.
  │
  │     Does the service extend AbpCrudAppService<> (directly or transitively)?
  │       YES → EntityCrudAuthorizationHelper handles it
  │             replaceInherited = NULL → Inherited stays
  │             → Classify as: Authenticated (CRUD method bypass)
  │       NO  → BOTH helpers skip → standard ABP auth applies
  │             → Classify as: Authenticated (CRUD method bypass)
  │
  │     Either way: NOT anonymous. Requires authentication.
  │
  NO  → ApiAuthorizationHelper handles it.
        replaceInherited = DefaultEndpointAccess
        → Classify as: {Resolved via DefaultEndpointAccess}
        (e.g., if DefaultEndpointAccess=5, classify as Anonymous (default fallback))
```

Classify each endpoint into one of these authorization categories:

| Category | When to use | What's actually enforced at runtime |
|----------|-------------|-------------------------------------|
| `Anonymous (code override)` | `[AllowAnonymous]` on class or method | Filter exits before DB check — nothing can restrict this |
| `Anonymous (DB, hardcoded)` | DB `actualAccess=5` AND `hardcoded=true` | DB value, but resets to anonymous on every restart |
| `Anonymous (DB, configurable)` | DB `actualAccess=5` AND `hardcoded=false` | DB value; admin can change it and it persists |
| `Anonymous (default fallback)` | `actualAccess=2` + non-CRUD method name + DefaultEndpointAccess=5 | DefaultEndpointAccess setting via replaceInherited |
| `Authenticated (DB, hardcoded)` | DB `actualAccess=3` AND `hardcoded=true` | DB value, resets on restart |
| `Authenticated (DB, configurable)` | DB `actualAccess=3` AND `hardcoded=false` | DB value; admin can change it |
| `Authenticated (inherited, resolved)` | DB `actualAccess=2` but parent resolves to 3 | Parent's access level via inheritance chain |
| `Authenticated (CRUD method bypass)` | `actualAccess=2` + method name IN CrudMethods dict (exact match) | ApiAuthorizationHelper skips; EntityCrudAuthorizationHelper or ABP default requires auth |
| `Authenticated (accidental)` | Dynamic entity CRUD with `actualAccess=2`, no parent, replaceInherited=null | Inherited falls through ObjectPermissionChecker: anonymous=denied(401), any logged-in=allowed |
| `Permissioned (DB)` | DB `actualAccess=4` with non-empty permissions | ShaPermissionChecker with OR logic |
| `Permissioned (DB, empty = deny-all)` | DB `actualAccess=4` with empty permissions | Blocks everyone including admins |
| `Disabled (DB)` | DB `actualAccess=1` | Returns 404, hidden from Swagger |
| `{Resolved via DefaultEndpointAccess}` | Non-CRUD method, DB `actualAccess=2`, no parent resolves | Whatever DefaultEndpointAccess is set to |
| `Unknown` | No code attribute, no DB record, endpoint not handled by Shesha helpers | Investigate — may have no enforcement |

#### 5C: Enforcement Method

Record HOW authorization is enforced:

| Enforcement | Description |
|-------------|-------------|
| `Code attribute` | `[AllowAnonymous]`, `[SheshaAuthorize]`, `[AbpAuthorize]` on class/method |
| `DB config (PermissionedObject)` | Via `ObjectPermissionChecker` → `PermissionedObjectManager` |
| `DB config (ModelConfiguration)` | Via entity model configuration (for CRUD endpoints) |
| `CheckPermissionAsync()` | Explicit permission check call in method body |
| `EntityCrudAuthorizationHelper` | Global filter for mapped CRUD methods on `AbpCrudAppService` subclasses |
| `ApiAuthorizationHelper` | Global filter for non-CRUD app service/controller methods |
| `DefaultEndpointAccess fallback` | No explicit config — uses SecuritySettings.DefaultEndpointAccess |
| `None` | No enforcement detected — **security gap** |

#### 5D: Data Restriction (Specifications)

For entity-related endpoints, record:
- **Global specifications** that automatically restrict ALL queries (from Step 4C)
- **Available specifications** that can be applied per-request (from Step 2E)
- Whether the endpoint has `[DisableSpecifications]` (bypasses all specs)
- Whether the endpoint has `[ApplySpecifications(typeof(...))]` (forces specific specs)

#### 5E: Required Permissions and Role Access

For each endpoint, document the specific permissions and roles that control access:

| Field | Source | Description |
|-------|--------|-------------|
| **Code Permissions** | Source code `[AbpAuthorize("...")]` attributes (Step 4A) | Permission names defined in code. These are the bootstrap-time values. When `hardcoded=true`, these are authoritative and reset on every restart. |
| **DB Permissions** | `PermissionedObjectDto.permissions` (Step 2B) | Permission names currently configured in the database. When `hardcoded=false`, these are authoritative (admin changes persist). |
| **Effective Permissions** | `PermissionedObjectDto.actualPermissions` (Step 2B) | Resolved permissions after inheritance. This is what's actually checked at runtime. |
| **Granted To Roles** | `permissionToRoles{}` reverse map (Step 2F) | Which roles have been granted each effective permission. |
| **Permission Source** | Comparison of code vs DB | `Code (hardcoded)` if `hardcoded=true`, `DB (configurable)` if `hardcoded=false`, `Inherited` if permissions come from parent object. |

**Determining the effective permissions for an endpoint:**

1. If `actualAccess != RequiresPermissions (4)` → no specific permissions apply (access is determined by access level alone)
2. If `actualAccess == RequiresPermissions (4)`:
   - Use `actualPermissions` array as the effective permissions
   - If `actualPermissions` is empty → **deny-all** (no one can access, including admins)
   - If `actualPermissions` has values → any user with ANY one of these permissions is granted access (OR logic)
3. Cross-reference each effective permission against `permissionToRoles{}` to list which roles can access the endpoint
4. If `hardcoded=true` and DB permissions differ from code permissions, note the discrepancy (DB will be reset on next restart)

**For entity CRUD endpoints (ModelConfiguration permissions):**
- Use `permissionGet`, `permissionCreate`, `permissionUpdate`, `permissionDelete` from the ModelConfiguration response (Step 2C)
- Each has its own `access`, `permissions`, and `actualPermissions` fields
- These are checked via `EntityCrudAuthorizationHelper` at the entity action level

#### 5F: Recommendation

For each endpoint, generate a recommendation:

| Condition | Recommendation |
|-----------|----------------|
| `Anonymous (default)` + sensitive data | **CRITICAL**: Configure PermissionedObject with `AnyAuthenticated` or stronger |
| `Anonymous (code)` + not auth/password-reset | **HIGH**: Review if anonymous access is intentional |
| `Authenticated` + admin/config operation | **HIGH**: Add `RequiresPermissions` with specific permission |
| `Permissioned (DB, empty)` | **WARN**: Empty permissions = deny-all. Add specific permissions or change access level |
| No PermissionedObject record for entity | **HIGH**: Enable EntityPermissionedObjectProvider or manually configure |
| CRUD-like method not in CrudMethods mapping | **HIGH**: Method bypasses entity-level permissions |
| Method missing `CheckPermissionAsync()` | **CRITICAL**: Add permission check before data access |
| No global specifications + sensitive entity | **MEDIUM**: Consider row-level security via global specification |
| `[AllowAnonymous]` + DB has restrictive config | **WARN**: Code override makes DB config ineffective |
| Endpoint OK | OK — no changes needed |

#### 5F: Justification

For each recommendation, include a justification explaining:
- Why the current state is a concern (or why it's acceptable)
- What the security impact is if exploited
- Reference to the enforcement mechanism that applies (or doesn't)

### Step 5G: Cross-Reference Frontend Usage (if referenced-endpoint-catalog.md exists)

Check if `referenced-endpoint-catalog.md` exists in the project root. If it does, parse it to build a frontend reference lookup for every endpoint in the catalog. If it does **not** exist, ask the user:

> `referenced-endpoint-catalog.md` was not found. Would you like me to generate it first using the `/endpoint-usage-catalog` command? This will analyze the frontend codebase and form configurations to identify which endpoints are referenced by the UI, then continue with the catalog generation.

- If the user says **yes**: invoke the `endpoint-usage-catalog` skill, wait for it to complete, then continue this step with the newly generated file.
- If the user says **no**: skip this step entirely and generate the catalog without the Frontend Ref column.

**Parsing the referenced-endpoint-catalog.md:**

The file contains multiple sections with different reference types. Parse each to build a map of `endpoint URL → { sources[], forms[] }`:

1. **Section A — Coded Frontend**: Endpoints hard-coded in TypeScript/React source files. Extract the endpoint URL and source file(s).
2. **Section B — Form Config Values**: Endpoints configured as URL properties in form components. Extract the endpoint URL and form name(s).
3. **Section C — Entity Bindings**: Entity types bound to forms via `modelType`. For each entity, ALL CRUD actions (`Get`, `GetAll`, `Create`, `Update`, `Delete`) are implicitly referenced. Generate the dynamic CRUD URL pattern `/api/dynamic/{Module}/{Entity}/Crud/{Action}` for each.
4. **Section D — Embedded JavaScript**: API calls in JavaScript snippets inside form configurations. Extract endpoint URL and form name(s).
5. **Section E — Data-Source Components**: `datatableContext`, `entityPicker`, and `autocomplete` components. Autocomplete components with explicit URLs should be extracted. Entity-bound components imply CRUD references (same as Section C).

**Building the lookup:**

For each endpoint found, normalize the URL (lowercase, strip query params and trailing slashes) and store:
- `sources` — reference type(s): `coded`, `form-config`, `JS`, `entity-binding`, `form-autocomplete`
- `forms` — the form name(s) or source file(s) that reference it

**Applying to the catalog:**

For every endpoint row in the catalog, look up the normalized URL in the reference map. Construct a label:
- If found: `**{sources} ({forms})**` — e.g., `**coded (apis/formConfiguration.ts)**`, `**form-config+JS (role-details, user-details)**`
- If not found: `--`

For Section 6 (Application Services) tables that use `Action` instead of `URL`, reconstruct the full URL from the section heading context: `### 6.X ServiceName (module)` → `/api/services/{module}/{ServiceName}/{Action}`.

### Step 6: Generate the Catalog Report

Write the catalog to `$OUTPUT_PATH` in this format. Group endpoints logically:

```markdown
# Endpoint Catalog — {Application Name}

**Generated:** {date}
**Branch:** {git branch}
**Backend URL:** {BASE_URL}
**DefaultEndpointAccess:** {value and name}
**Total endpoints:** {count}

---

## Security Configuration Summary

### DefaultEndpointAccess
- **Value:** {value} ({name})
- **Impact:** {explain what this means for unconfigured endpoints}

### PermissionedObject Coverage

| Object Type | Total Records | Inherited | Authenticated | Permissioned | Anonymous | Disabled |
|------------|--------------|-----------|---------------|--------------|-----------|----------|
| Shesha.WebApi | ... | ... | ... | ... | ... | ... |
| Shesha.WebApi.Action | ... | ... | ... | ... | ... | ... |
| Shesha.Entity | ... | ... | ... | ... | ... | ... |
| Shesha.Entity.Action | ... | ... | ... | ... | ... | ... |
| Shesha.WebCrudApi | ... | ... | ... | ... | ... | ... |
| Shesha.WebCrudApi.Action | ... | ... | ... | ... | ... | ... |
| Shesha.Form | ... | ... | ... | ... | ... | ... |

### Specification Coverage

| Entity | Global Specs | Available Specs | Notes |
|--------|-------------|-----------------|-------|
| ... | ... | ... | ... |

---

## 1. Authentication Endpoints

Endpoints for login, token management, and password reset.

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| POST | /api/TokenAuth/Authenticate | User login | Anonymous (code) | Yes (hardcoded) | — | — | Code: [AllowAnonymous] | OK | **coded (apis/tokenAuth.ts)** |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## 2. Framework & Admin Endpoints

System administration, diagnostics, and framework operations.

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## 3. Security & Permission Management

Endpoints for managing roles, permissions, and endpoint security.

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## 4. Configuration Management

Entity configs, model configs, form configs, settings.

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## 5. Dynamic Entity CRUD — {Module Name}

Auto-generated CRUD endpoints for domain entities. Repeat this section per module.

### 5.1 {Entity Name} ({fullClassName})

**CRUD API Generated:** Yes/No
**Entity-level Permission:** {access level}
**Specifications:** {list global specs}, {count} available client specs

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| GET | /api/dynamic/{module}/{Entity}/Crud/Get?id={id} | Get single entity | ... | ... | ... | ... | ... | ... | ... |
| GET | /api/dynamic/{module}/{Entity}/Crud/GetAll | List/query entities | ... | ... | ... | ... | ... | ... | ... |
| POST | /api/dynamic/{module}/{Entity}/Crud/Create | Create entity | ... | ... | ... | ... | ... | ... | ... |
| PUT | /api/dynamic/{module}/{Entity}/Crud/Update | Update entity | ... | ... | ... | ... | ... | ... | ... |
| DELETE | /api/dynamic/{module}/{Entity}/Crud/Delete?id={id} | Delete entity | ... | ... | ... | ... | ... | ... | ... |

---

## 6. Application Services — {Module Name}

Hand-coded application service endpoints. Repeat per module.

### 6.1 {ServiceName}

**Source:** `{file path}`
**Class-level Auth:** {attribute or "None"}
**PermissionedObject:** {service-level access}

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## 7. Generic Entity Gateway (EntitiesAppService)

The dynamic entity gateway at `/api/services/Shesha/Entities/`. These endpoints accept an `entityType` parameter and delegate to entity-specific services.

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| GET | /api/services/Shesha/Entities/Get | Get entity by type+id | {per-entity} | Yes | {entity-level perms} | {roles} | CheckPermissionAsync() | ... | ... |
| GET | /api/services/Shesha/Entities/GetAll | List entities by type | {per-entity} | Yes | {entity-level perms} | {roles} | CheckPermissionAsync() | ... | ... |
| POST | /api/services/Shesha/Entities/ExportToExcel | Export entity data | **No auth check** | Yes | — | — | None | CRITICAL: Add CheckPermissionAsync() | ... |
| GET | /api/services/Shesha/Entities/Specifications | List specs for entity | **No auth check** | Yes | — | — | None | HIGH: Add auth check | ... |
| PUT | /api/services/Shesha/Entities/Reorder | Reorder entities | **No auth check** | Yes | — | — | None | CRITICAL: Add CheckPermissionAsync() | ... |

---

## 8. Controllers

MVC controllers with explicit HTTP endpoints.

| HTTP | URL | Description | Auth Level | DB Record | Required Permissions | Granted To Roles | Enforcement | Recommendation | Frontend Ref |
|------|-----|-------------|------------|-----------|---------------------|-----------------|-------------|----------------|-------------|
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## Enforcement Caveats

Document these known enforcement gaps that affect interpretation of the catalog:

1. **Code-level `[AllowAnonymous]` overrides DB config** — If a method has `[AllowAnonymous]`, the PermissionedObject database settings are IGNORED. The `SheshaAuthorizationFilter` exits before checking the DB.

2. **Entity CRUD endpoints don't use DefaultEndpointAccess** — `EntityCrudAuthorizationHelper` does NOT pass `replaceInherited` to `ObjectPermissionChecker`. Entity CRUD with `Inherited` access accidentally blocks anonymous but allows any authenticated user, regardless of the `DefaultEndpointAccess` setting.

3. **Multiple permissions use OR logic** — The `requireAll` flag is hardcoded to `false`. If an endpoint requires permissions `["A", "B"]`, a user with EITHER permission gains access.

4. **Unmapped CRUD methods bypass entity permissions** — Methods not in `PermissionedObjectManager.CrudMethods` dictionary (e.g., `ExportToExcel`, `Reorder`) are checked by `ApiAuthorizationHelper` at the service level, not `EntityCrudAuthorizationHelper` at the entity level.

5. **Swagger hides disabled endpoints** — The `SwaggerDocumentFilter` removes endpoints with `Disable` access from the Swagger document. They still exist in the routing table but return 404.

6. **CRUD-named methods on ALL app services bypass DefaultEndpointAccess** — `ApiAuthorizationHelper` checks `CrudMethods` dictionary BEFORE calling `ObjectPermissionChecker`. If the method name (after removing "Async" suffix) is in `CrudMethods` (GetAll, QueryAll, Get, Query, Create, CreateGql, Update, UpdateGql, Delete), `ApiAuthorizationHelper` SKIPS it entirely, expecting `EntityCrudAuthorizationHelper` to handle it. But `EntityCrudAuthorizationHelper` only handles `AbpCrudAppService<>` subclasses. For CRUD-named methods on non-CRUD services (e.g., `FormConfigurationAppService.GetAll`), BOTH helpers skip, and standard ABP auth applies (requires authentication). `DefaultEndpointAccess` does NOT apply to these methods. Classify as `Authenticated (CRUD method bypass)`.

7. **Swagger may return HTTP 500 on large applications** — The Swagger JSON endpoint (`/swagger/v1/swagger.json`) may fail with HTTP 500 or return 0 bytes on large Shesha applications due to memory or timeout constraints. When this occurs, rely on PermissionedObject API data and source code analysis instead. Document the Swagger failure in the report.

---

## Appendix A: Endpoints Without PermissionedObject Records

{List all endpoints discovered via Swagger or source code that have NO corresponding PermissionedObject record in the database. These rely entirely on DefaultEndpointAccess.}

## Appendix B: Entities Without Permission Records

{List all entities with generateAppService=true that have NO Shesha.Entity or Shesha.Entity.Action records. These rely on the CRUD authorization fallback behavior.}

## Appendix C: Global Specifications

{List all specification classes with [GlobalSpecification] attribute, the entity they apply to, and what they filter.}

## Appendix D: Specification Availability by Entity

{For each entity, list available (non-global) specifications that can be applied per-request via the `specifications` parameter.}

## Appendix E: Permission-to-Endpoint Matrix

{For each permission name that is referenced by at least one endpoint, list:}

| Permission Name | Display Name | Endpoints Protected | Source (Code/DB) |
|----------------|-------------|--------------------|--------------------|
| `pages.roles` | Manage Roles | `ShaRoleAppService@GetAll`, `ShaRoleAppService@Create`, ... | Code (hardcoded) |
| `pages.users` | Manage Users | `UserAppService@GetAll`, `UserAppService@Create`, ... | DB (configurable) |
| ... | ... | ... | ... |

{Include permissions that are defined but NOT referenced by any endpoint — these are orphaned permissions that may indicate missing security configuration.}

## Appendix F: Role-to-Endpoint Access Matrix

{For each role, show the endpoints it can access through its granted permissions. This provides a "what can this role do?" view.}

| Role | Granted Permissions | Accessible Endpoints (via permissions) | Also Has (via Anonymous/Authenticated) |
|------|--------------------|-----------------------------------------|----------------------------------------|
| Admin | `pages.roles`, `pages.users`, ... | {list of permissioned endpoints} | All authenticated endpoints |
| Data Admin | `pages.data.export`, ... | {list} | All authenticated endpoints |
| ... | ... | ... | ... |

{Note: This matrix only covers endpoints with `RequiresPermissions` access level. All roles also have access to `Anonymous` and `Authenticated` endpoints.}
```

### Step 7: Print Summary

Print a concise summary to the console:

```
Endpoint Catalog generated: {OUTPUT_PATH}

Total endpoints:     {count}
  - Anonymous:       {count} ({count} by code, {count} by DB, {count} by default)
  - Authenticated:   {count}
  - Permissioned:    {count}
  - Disabled:        {count}
  - No enforcement:  {count} ← INVESTIGATE

DB Record coverage:
  - With DB record:    {count} ({percentage}%)
  - Without DB record: {count} ({percentage}%) ← relies on defaults

Entity CRUD coverage:
  - Entities with CRUD APIs: {count}
  - With permission records: {count} ({percentage}%)
  - Without records:         {count} ({percentage}%) ← relies on defaults

Specifications:
  - Global specs:    {count} (affecting {count} entities)
  - Available specs: {count} (across {count} entities)

Permissions & Roles:
  - Distinct permissions referenced: {count}
  - Permissions with role assignments: {count}
  - Orphaned permissions (defined but unused): {count}
  - Roles:           {count}

Frontend References (if referenced-endpoint-catalog.md present):
  - Endpoints with frontend refs: {count} ({percentage}%)
  - Endpoints without frontend refs: {count} ({percentage}%)
  - Reference sources: coded ({count}), form-config ({count}), JS ({count}), entity-binding ({count})

Recommendations:
  - CRITICAL: {count}
  - HIGH:     {count}
  - MEDIUM:   {count}
  - OK:       {count}

Top issues:
1. {most critical finding}
2. {second most critical}
3. {third most critical}
```
