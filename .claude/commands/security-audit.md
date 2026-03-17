# Security Audit

Run a comprehensive security audit against the Shesha framework backend, checking for known vulnerabilities and scanning for new ones. Requires the backend to be running on localhost.

Arguments: `$ARGUMENTS`
- `--url <base_url>` — Backend base URL (default: `http://localhost:21021`)
- `--skip-code` — Skip source code analysis, only run live API tests
- `--skip-live` — Skip live API tests, only run source code analysis
- `--quick` — Only run the critical vulnerability checks (fastest)
- `--report <path>` — Output report path (default: `security-audit-report.md`)

## Instructions

### Step 0: Parse Arguments

Parse `$ARGUMENTS` for the flags above. Set defaults:
- `BASE_URL` = `http://localhost:21021`
- `REPORT_PATH` = `security-audit-report.md`
- `SKIP_CODE` = false
- `SKIP_LIVE` = false
- `QUICK_MODE` = false

### Step 1: Load the Vulnerability Baseline

Read the vulnerability baseline from `<command-base-dir>/references/vulnerability-baseline.md`. This file contains:
- All known critical and high-severity vulnerabilities with their test procedures
- Expected secure states (what "fixed" looks like)
- Source file paths for code-level checks

### Step 2: Verify API Availability (unless --skip-live)

Test that the backend is running:
```bash
curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/TokenAuth/GetExternalAuthenticationProviders
```
If not 200, warn the user and offer to continue with code-only analysis.

### Step 3: Authenticate (unless --skip-live)

Authenticate to get a JWT token for authorized endpoint testing:
```bash
curl -s $BASE_URL/api/TokenAuth/Authenticate -X POST \
  -H "Content-Type: application/json" \
  -d '{"userNameOrEmailAddress":"admin","password":"123qwe"}'
```
Extract the `accessToken` from the response. If auth fails with default credentials, that's actually GOOD (means defaults were changed) — note it as a pass and ask the user for credentials, or continue with anonymous-only tests.

### Step 4: Run Vulnerability Checks

For each vulnerability in the baseline, run the appropriate check. Track results as:
- **PASS** — vulnerability has been fixed
- **FAIL** — vulnerability still exists
- **WARN** — partially fixed or new concern
- **SKIP** — could not test (server down, endpoint removed, etc.)
- **NEW** — newly discovered vulnerability not in baseline

#### 4A: Critical Anonymous Access Tests (always run unless --skip-live)

For each endpoint listed in the baseline's "Critical Anonymous Endpoints" section, send an unauthenticated request and check:
- HTTP 401 or 403 = **PASS** (properly secured)
- HTTP 200, 400, or 500 (with non-auth error) = **FAIL** (still open)

Use curl with `-s -o /dev/null -w "%{http_code}"` pattern for quick status checks, and capture response bodies for endpoints that return 200 to document what's exposed.

#### 4B: PermissionedObject Configuration Check (unless --skip-live)

Query the permissioned objects API (requires auth):
```bash
curl -s "$BASE_URL/api/services/app/PermissionedObject/GetAllFlat?showNested=true&showHidden=true" \
  -H "Authorization: Bearer $TOKEN"
```

Analyze the results:

**4B-1: Access level breakdown**
- Count objects by access level (1=Disable, 2=Inherited, 3=AnyAuthenticated, 4=RequiresPermissions, 5=AllowAnonymous)
- Flag if >50% of objects still have access=2 (Inherited) as **WARN**

**4B-2: Use `actualAccess` not `access`**
- The API returns both `access` (configured) and `actualAccess` (resolved after inheritance). Use `actualAccess` for determining effective security. If `actualAccess` differs from `access`, note the inheritance resolution.

**4B-3: Security-sensitive services check**
- Flag as **FAIL** if ANY of these services have `access=2` (Inherited) or `actualAccess=5` (AllowAnonymous):
  - `Shesha.Services.NHibernateAppService`
  - `Shesha.Controllers.FrameworkController`
  - `Shesha.Settings.SettingsAppService`
  - `Shesha.Email.EmailSenderAppService`
  - `Shesha.UserManagements.UserManagementAppService`
  - `Shesha.ConfigurationItems.ConfigurationItemAppService`
  - `Shesha.DynamicEntities.EntitiesAppService`
  - `Shesha.DynamicEntities.EntityConfigAppService`
  - `Shesha.DynamicEntities.EntityPropertyAppService`
  - `Shesha.DynamicEntities.ModelConfigurationsAppService`
  - `Shesha.Authorization.Settings.AuthorizationSettingsAppService`
  - `Shesha.Scheduler.Services.ScheduledJobs.ScheduledJobAppService` (or Scheduler module equivalent)
  - `Shesha.Otp.OtpAppService`

**4B-4: Entity-type object coverage**
- Count objects by type (`Shesha.WebApi`, `Shesha.WebApi.Action`, `Shesha.Entity`, `Shesha.Entity.Action`, `Shesha.Form`, etc.)
- Flag as **FAIL** if `Shesha.Entity` + `Shesha.Entity.Action` records total < 10 (indicates EntityPermissionedObjectProvider is still disabled and entities are unprotected)
- List all entity-type objects found — compare against the Dynamic CRUD Entity Baseline to identify which entities have NO permission records

**4B-5: RequiresPermissions with empty permissions**
- For all objects where `access=4` (RequiresPermissions), check if `permissions` array is empty
- Empty permissions with RequiresPermissions = deny-all (blocks everyone including admins). Flag as **WARN** — may be intentional lockdown or misconfiguration

#### 4C: Security Settings Check (unless --skip-live)

Query the security settings:
```bash
curl -s "$BASE_URL/api/services/app/Settings/GetValue?module=Shesha&name=Shesha.Security" \
  -H "Authorization: Bearer $TOKEN"
```

Check:
- `defaultEndpointAccess` should be 3 (AnyAuthenticated) or 4 (RequiresPermissions), NOT 5 (AllowAnonymous)
- If anonymous access to this endpoint works (no token needed), that's a **FAIL**

Also check password complexity:
```bash
curl -s "$BASE_URL/api/services/app/Settings/GetValue?module=Shesha&name=Abp.Zero.UserManagement.PasswordComplexity.RequiredLength" \
  -H "Authorization: Bearer $TOKEN"
```
- RequiredLength should be >= 8

#### 4D: Source Code Analysis (unless --skip-code)

For each code-level vulnerability in the baseline, check the current source:

1. **DefaultEndpointAccess default** — Check `SheshaFrameworkModule.cs` for the `DefaultEndpointAccess.WithDefaultValue(...)` line
2. **FrameworkController auth** — Check if `FrameworkController.cs` has a class-level `[SheshaAuthorize]` or `[Authorize]` attribute
3. **NHibernateAppService.ExecuteHql** — Check if the method or class has auth attributes, or if it's been removed
4. **Hardcoded passphrase** — Check `AppConsts.cs` for `DefaultPassPhrase` hardcoded value
5. **OTP generator** — Check `OtpGenerator.cs` for `new Random()` vs `RandomNumberGenerator`
6. **Default credentials** — Check `User.cs` for `DefaultPassword` and `HostRoleAndUserBuilder.cs` for seeded passwords
7. **CORS policy** — Check `Startup.cs` for `.SetIsOriginAllowed(origin => true)`
8. **Settings anonymous access** — Check `SettingsAppService.cs` for `[AllowAnonymous]` on `GetValue`/`GetConfigurations`
9. **PermissionedObjectAppService auth level** — Check class-level attribute is stronger than `AnyAuthenticated` for write methods
10. **Swagger/GraphQL in production** — Check if `UseSwaggerUI` and `UseGraphQLPlayground` are gated by environment check
11. **ScheduledJobAppService auth** — Check for class-level auth attribute
12. **EmailSenderAppService auth** — Check for class-level auth attribute
13. **UserManagementAppService auth** — Check for class-level auth attribute
14. **EntityPermissionedObjectProvider** — Check if the class is still commented out
15. **EntitiesAppService permission gaps** — Check `EntitiesAppService.cs` for methods that skip `CheckPermissionAsync()`. Specifically verify `ExportToExcelAsync`, `SpecificationsAsync`, and `ReorderAsync` now call `CheckPermissionAsync()`.
16. **Enforcement chain integrity** — Verify:
    - `SheshaAuthorizationFilter` is registered as a global MVC filter in `Startup.cs` (grep for `SheshaAuthorizationFilter`)
    - Both `ApiAuthorizationHelper` and `EntityCrudAuthorizationHelper` are registered in `SheshaApplicationModule.cs` (grep for `ISheshaAuthorizationHelper`)
    - `ObjectPermissionChecker` is registered in IoC (grep for `IObjectPermissionChecker`)
17. **CRUD method mapping completeness** — Check `PermissionedObjectManager.CrudMethods` dictionary. Verify all CRUD-like method names used in app services are covered. Flag any new CRUD methods (e.g., `Export`, `Reorder`, `BulkUpdate`) that aren't mapped and would bypass `EntityCrudAuthorizationHelper`.
18. **Security headers** — Grep the entire `shesha-core/src/` for `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `UseHsts`, `Referrer-Policy`, `Permissions-Policy`. PASS if at least X-Frame-Options, X-Content-Type-Options, and HSTS are configured. FAIL if no security headers found anywhere.

Use Grep and Read tools for these checks. For each, compare against the expected secure state from the baseline.

#### 4E: New Vulnerability Scan (unless --quick)

Scan for NEW vulnerabilities not in the baseline:

1. **New Controllers** — Glob for `*Controller.cs` files in `shesha-core/src/` and check each for auth attributes. Flag any without `[Authorize]`, `[SheshaAuthorize]`, or `[AllowAnonymous]` (the absence means it relies on defaults)

2. **New AppServices** — Glob for `*AppService.cs` and check for class-level auth. Flag any new services without explicit security

3. **New [AllowAnonymous] endpoints** — Grep for `\[AllowAnonymous\]` and `\[AbpAllowAnonymous\]` across the codebase. Compare against the known-anonymous baseline list. Flag any new ones

4. **New dynamic CRUD entities** — If live API is available, compare the swagger service list against the baseline entity list. Flag any new entities

5. **Dependency vulnerabilities** — Check for known vulnerable NuGet packages (if `dotnet list package --vulnerable` is available)

### Step 5: Generate Report

Write the report to `$REPORT_PATH` in this format:

```markdown
# Shesha Security Audit Report

**Date:** {current date}
**Branch:** {git branch}
**Base URL:** {BASE_URL or "code-only"}
**Mode:** {full | quick | code-only | live-only}

## Executive Summary

- **Total checks:** {count}
- **PASS:** {count} | **FAIL:** {count} | **WARN:** {count} | **SKIP:** {count} | **NEW:** {count}
- **Critical issues remaining:** {count}
- **High issues remaining:** {count}

## Results by Severity

### Critical Vulnerabilities

| ID | Vulnerability | Status | Details |
|----|--------------|--------|---------|
| ... per baseline entry ... |

### High Vulnerabilities

| ID | Vulnerability | Status | Details |
|----|--------------|--------|---------|
| ... |

### New Findings

| ID | Vulnerability | Severity | Details |
|----|--------------|----------|---------|
| ... any new findings ... |

## PermissionedObject Configuration Summary

| Access Level | Count | Percentage | Effective Behavior |
|-------------|-------|------------|-------------------|
| ... | ... | ... | ... |

### By Object Type

| Object Type | Count | Notes |
|------------|-------|-------|
| Shesha.WebApi | ... | Service-level |
| Shesha.WebApi.Action | ... | Method-level |
| Shesha.Entity | ... | Entity-level (should cover all CRUD entities) |
| Shesha.Entity.Action | ... | Entity CRUD action-level |
| Shesha.Form | ... | Form-level |

### Entity Coverage Gap

- **Total dynamic CRUD entities:** {count from swagger}
- **Entities with PermissionedObject records:** {count of Shesha.Entity type objects}
- **Coverage:** {percentage}
- **Unprotected entities:** {list entities with no records}

### Security-Sensitive Services

| Service | Configured Access | Actual Access | Status |
|---------|------------------|---------------|--------|
| ... for each service in the 4B-3 checklist ... |

### Misconfigured RequiresPermissions

| Object | Access | Permissions | Issue |
|--------|--------|-------------|-------|
| ... objects with RequiresPermissions but empty permissions array ... |

## Detailed Test Results

### Anonymous Endpoint Tests
{table of each endpoint tested with method, URL, expected status, actual status, result}

### Source Code Checks
{table of each code check with file, check description, expected state, actual state, result}

### Enforcement Chain Integrity
{Verify and report on each component of the authorization chain:}

| Component | File | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| SheshaAuthorizationFilter global registration | Startup.cs | Registered as global MVC filter | ... | PASS/FAIL |
| ApiAuthorizationHelper registration | SheshaApplicationModule.cs | Registered as ISheshaAuthorizationHelper | ... | PASS/FAIL |
| EntityCrudAuthorizationHelper registration | SheshaApplicationModule.cs | Registered as ISheshaAuthorizationHelper | ... | PASS/FAIL |
| ObjectPermissionChecker registration | ... | Registered as IObjectPermissionChecker | ... | PASS/FAIL |
| EntityPermissionedObjectProvider active | EntityPermissionedObjectProvider.cs | Class is NOT commented out | ... | PASS/FAIL |
| CRUD method mapping complete | PermissionedObjectManager.cs | All CRUD methods mapped | ... | PASS/FAIL |

## Comparison with Previous Audit

{If a previous report exists at the same path, load it and compare:
- Vulnerabilities fixed since last audit
- Vulnerabilities still open
- New vulnerabilities found
- Trend (improving / degrading / stable)}

## Recommendations

{List top 5 actions to take next, ordered by impact}
```

### Step 6: Summary

Print a concise summary to the console:
- Total PASS/FAIL/WARN/NEW counts
- List any CRITICAL items that are still FAIL
- If this is a re-run, note what changed since the previous report
