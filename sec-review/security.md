# Shesha Framework — Security Audit Report

**Date:** 2026-03-14
**Scope:** Backend (`shesha-core/src/`) — authentication, authorization, access control, data security, configuration, and recommendations
**Branch:** `releases/0.43`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Authentication](#2-authentication)
3. [Authorization & Permission System](#3-authorization--permission-system)
4. [Roles](#4-roles)
5. [Permission Definitions](#5-permission-definitions)
6. [Endpoint Security Inventory](#6-endpoint-security-inventory)
7. [Data-Level Security](#7-data-level-security)
8. [Security Configuration & Settings](#8-security-configuration--settings)
9. [CORS, Headers & Transport Security](#9-cors-headers--transport-security)
10. [Exception Handling & Information Leakage](#10-exception-handling--information-leakage)
11. [Cryptography & Secrets Management](#11-cryptography--secrets-management)
12. [Hangfire / Background Jobs Security](#12-hangfire--background-jobs-security)
13. [GraphQL Security](#13-graphql-security)
14. [File Upload/Download Security](#14-file-uploaddownload-security)
15. [Form Configuration Security](#15-form-configuration-security)
16. [Framework Controller — Unsecured Admin Endpoints](#16-framework-controller--unsecured-admin-endpoints)
17. [Default Users & Credentials](#17-default-users--credentials)
18. [OTP Generation Weakness](#18-otp-generation-weakness)
19. [Critical Findings](#19-critical-findings)
20. [Recommendations](#20-recommendations)

---

## 1. Executive Summary

Shesha Framework implements a **multi-layered security model** built on top of ABP Framework's authorization infrastructure, extending it with:

- A **Permissioned Object** system that allows runtime (database-configurable) access control on API endpoints, entities, and forms
- A **custom role system** (`ShaRole`) separate from ABP's built-in `Role` entity, with person-to-role appointments and role-to-permission mappings
- Custom permission checkers that extend ABP's `PermissionChecker` with Shesha-specific role logic
- JWT Bearer authentication with token blacklisting and refresh support

**Key risk areas identified:**

| Severity | Finding |
|----------|---------|
| **CRITICAL** | Default endpoint access is `AllowAnonymous` — all API endpoints without explicit permissions are publicly accessible | IH: Implement!!!
| **CRITICAL** | Hardcoded encryption passphrase in source code (`AppConsts.DefaultPassPhrase`) |
| **CRITICAL** | Default minimum password length is 3 characters | IH: Implement!!!
| **HIGH** | CORS allows any origin with credentials | IH: Implement!!!
| **HIGH** | Settings API exposes `GetValueAsync` and `GetConfigurationsAsync` anonymously — leaks configuration metadata | IH: Implement!!!
| **HIGH** | `PermissionedObjectAppService` (manages all endpoint permissions) only requires `AnyAuthenticated` — any logged-in user can view/modify security policies |IH: Implement!!!
| **HIGH** | GraphQL endpoint has no visible authorization layer | IH: Implement!!! Should observe the permissions assigned to the entities being queried; Any global specifications should be applied.
| **MEDIUM** | `DbAuthorizationProvider.SetPermissions()` is fully commented out — DB-defined permissions are not loaded into ABP's permission system |
| **MEDIUM** | No rate limiting on authentication or password reset endpoints |
| **MEDIUM** | No security headers (CSP, X-Frame-Options, HSTS, etc.) configured | IH: Implement!!!
| **LOW** | GraphQL Playground is enabled (information disclosure in production) | IH: Implement!!! Need to restrict by permission

---

## 2. Authentication

### 2.1 JWT Bearer Authentication

**Configuration:** `Shesha.Web.Host/Startup/AuthConfigurer.cs`

- JWT is the primary authentication mechanism
- Token validation is properly configured:
  - `ValidateIssuerSigningKey = true`
  - `ValidateIssuer = true`
  - `ValidateLifetime = true`
  - `ValidateAudience = true`
  - `ClockSkew = TimeSpan.Zero` (strict expiration)
- Signing key is a `SymmetricSecurityKey` derived from `Authentication:JwtBearer:SecurityKey` in configuration
- Token configuration: `Shesha.Framework/Authentication/JwtBearer/TokenAuthConfiguration.cs`

### 2.2 Token Controller

**File:** `Shesha.Application/Authorization/TokenAuthController.cs`
**Access:** Entire controller is `[AllowAnonymous]` (appropriate for auth endpoints)

**Endpoints:**
| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| `POST` | `AuthenticateAsync` | Anonymous | Username/password login |
| `POST` | `SignOffAsync` | Anonymous (class-level) | Blacklists JWT via JTI |
| `POST` | `RefreshTokenAsync` | `[Authorize]` | Properly secured; uses atomic blacklist to prevent reuse |
| `POST` | `OtpAuthenticateSendPinAsync` | `[AbpAllowAnonymous]` | Sends OTP for login |
| `POST` | `OtpAuthenticateAsync` | Anonymous (class-level) | Verifies OTP |
| `POST` | `ExternalAuthenticateAsync` | Anonymous (class-level) | External provider login |
| `GET` | `GetExternalAuthenticationProviders` | Anonymous (class-level) | Lists external auth providers |

**Token Refresh Security (Good):**
- `RefreshTokenAsync` (line 158) uses `TryBlacklistTokenAsync` atomically before generating a new token
- Prevents TOCTOU race conditions and concurrent refresh attacks
- Validates JTI presence before refresh

### 2.3 Token Blacklisting

**File:** `Shesha.Application/Authentication/JwtBearer/DbTokenBlacklistService.cs`
- Tokens are blacklisted by JTI (JWT ID) claim
- Used during sign-off and token refresh
- `TryBlacklistTokenAsync` provides atomic blacklist-or-fail semantics

### 2.4 Login Manager

**File:** `Shesha.Framework/Authorization/ShaLoginManager.cs`

- Supports: username/password, OTP, external auth, anonymous device-based login
- **Account lockout** is supported and configurable:
  - `UserLockOutEnabled` (default: `true`)
  - `MaxFailedAccessAttemptsBeforeLockout` (default: `5`)
  - `DefaultAccountLockoutSeconds` (default: `300` / 5 minutes)
- Login attempts are logged to `ShaUserLoginAttempt` table with: IP, browser, IMEI, device, result
- IMEI-based device verification for mobile logins
- **Issue:** `AnonymousLoginViaDeviceIdAsync` (line 128) allows login using only a device GUID — this is a weak authentication factor

### 2.5 Password Policy

**File:** `Shesha.Framework/Configuration/IPasswordComplexitySettings.cs`
**Defaults set in:** `SheshaFrameworkModule.cs` (line 145-147)

| Setting | Default | Risk |
|---------|---------|------|
| `RequiredLength` | **3** | **CRITICAL — far below any industry standard** |
| `RequireDigit` | Not set (ABP default: false) | Weak |
| `RequireLowercase` | Not set (ABP default: false) | Weak |
| `RequireUppercase` | Not set (ABP default: false) | Weak |
| `RequireNonAlphanumeric` | Not set (ABP default: false) | Weak |

**Note:** `UserManager.cs` (line 298) dynamically loads these settings, so they are configurable at runtime. But the **defaults are dangerously weak**.

The `UserAppService.ResetPasswordUsingTokenAsync` (line 571) enforces a regex `PasswordRegex` requiring 8+ chars, lowercase, uppercase, and digit — but this is only for password resets, not for password creation via the `UserManager`.

### 2.6 Password Reset Flows

**File:** `Shesha.Application/Users/UserAppService.cs`

All password reset endpoints are `[AbpAllowAnonymous]` (appropriate):
- `ResetPasswordSendOtpAsync` — sends OTP via SMS
- `GetUserPasswordResetOptionsAsync` — **returns available reset methods for a username** (information disclosure risk: reveals whether email/phone is set)
- `SendSmsOtpAsync` — sends SMS OTP
- `GetSecurityQuestionsAsync` — returns security questions for a user
- `ValidateResetCodeAsync` — verifies OTP/email token
- `ValidateSecurityQuestionsAsync` — verifies security question answers (case-insensitive comparison)
- `SendEmailLinkAsync` — sends email reset link
- `ResetPasswordVerifyOtpAsync` — verifies OTP and issues reset token
- `ResetPasswordUsingTokenAsync` — performs the actual password change

[IH: IMPLEMENT FIX]
**Issue:** `ChangePasswordAsync` (line 628) is marked `[AbpAllowAnonymous]` but checks `_abpSession.UserId == null` internally. It should use `[Authorize]` instead to properly reject unauthenticated requests at the framework level.

---

## 3. Authorization & Permission System

### 3.1 Architecture Overview

Shesha layers its authorization on top of ABP in three tiers:

```
┌─────────────────────────────────────────────┐
│  SheshaAuthorizationFilter (MVC filter)     │  ← Runs on every request
│  ↓ resolves all ISheshaAuthorizationHelper  │
├─────────────────────────────────────────────┤
│  ApiAuthorizationHelper                     │  ← Checks permissioned objects DB
│  ↓ uses IObjectPermissionChecker            │
├─────────────────────────────────────────────┤
│  ObjectPermissionChecker                    │  ← Resolves access level from DB
│  ↓ uses IPermissionedObjectManager          │
│  ↓ uses IShaPermissionChecker               │
├─────────────────────────────────────────────┤
│  ShaPermissionChecker                       │  ← ABP PermissionChecker + custom
│  ↓ uses ICustomPermissionChecker[]          │
├─────────────────────────────────────────────┤
│  ShaCustomPermissionChecker                 │  ← Checks ShaRole → permissions
│  SheshaWebCorePermissionChecker             │  ← System Admin bypass
└─────────────────────────────────────────────┘
```

### 3.2 SheshaAuthorizationFilter

**File:** `Shesha.Application/Authorization/SheshaAuthorizationFilter.cs`

- Registered as a global MVC filter (`Startup.cs` line 85)
- Skips endpoints with `IAllowAnonymous` metadata
- Resolves all `ISheshaAuthorizationHelper` implementations and calls `AuthorizeAsync` on each
- Returns 401 (unauthenticated) or 403 (forbidden) based on auth state

### 3.3 ApiAuthorizationHelper

**File:** `Shesha.Application/Authorization/ApiAuthorizationHelper.cs`

- Primary authorization logic for API endpoints
- **Bypasses authorization if `IAuthorizationConfiguration.IsEnabled` is false** (line 42-45)
- Skips types with `[AllowAnonymous]` or `[AbpAllowAnonymous]`
- Only applies to `ApplicationService` and `ControllerBase` subclasses
- **CRUD methods bypass this check** (line 59-61): `GetAll`, `QueryAll`, `Get`, `Query`, `Create`, `CreateGql`, `Update`, `UpdateGql`, `Delete` — these are handled by the entity permissioned object system instead
- Delegates to `ObjectPermissionChecker.AuthorizeAsync` with the `DefaultEndpointAccess` fallback

### 3.4 ObjectPermissionChecker

**File:** `Shesha.Framework/Authorization/ObjectPermissionChecker.cs`

Access decision logic:

1. If authorization is disabled globally → allow
2. Map method name via `CrudMethods` dictionary, build permission name `{object}@{method}` (line 54-57)
3. Look up the permissioned object from the database (via `IPermissionedObjectManager.GetOrDefaultAsync`) — if no DB record exists, a default DTO with `Access=Inherited` is returned (line 59)
4. Resolve `actualAccess`: if `replaceInherited` is provided AND `ActualAccess == Inherited`, use `replaceInherited`; otherwise use `ActualAccess` as-is (lines 61-63)
5. If `permission == null` OR `actualAccess == AllowAnonymous` OR (`actualAccess == AnyAuthenticated` AND user is authenticated) → **allow** (line 65-68)
6. If not authenticated → throw `AbpAuthorizationException` (line 70-76)
7. If `actualAccess == Disable` → throw `EntityNotFoundException` (returns 404, not 403) (line 77-82)
8. If `actualAccess == RequiresPermissions` with no permissions defined → throw `AbpAuthorizationException` (line 83-90)
9. If `actualAccess == RequiresPermissions` with permissions → delegate to `IShaPermissionChecker.AuthorizeAsync(false, permissions)` — **always OR logic** (any single permission grants access) (line 94)

**Important enforcement caveats:**
- **`replaceInherited` gap:** `ApiAuthorizationHelper` passes `DefaultEndpointAccess` as `replaceInherited`, but `EntityCrudAuthorizationHelper` and `EntitiesAppService.CheckPermissionAsync` do **not**. When `replaceInherited` is null and `actualAccess` is `Inherited`, the value stays `Inherited` (2), which falls through to the authentication check at step 6 — accidentally blocking anonymous but allowing any authenticated user.
- **`requireAll` always false:** The `requireAll` parameter passed to `ShaPermissionChecker.AuthorizeAsync` is hardcoded to `false` at all call sites. Multiple permissions on an endpoint are OR'd, not AND'd. [IH: DO NOT IMPLEMENT - The Permissions should be OR'd NOT AND'd - Update the code to remove the that implies otherwise]
- **Code-level overrides:** `[AllowAnonymous]`/`[AbpAllowAnonymous]` attributes bypass this checker entirely — the `SheshaAuthorizationFilter` and `ApiAuthorizationHelper` exit before reaching `ObjectPermissionChecker`. [IH: IMPLEMENT changes so that Database may override and take precedence over the code attribute]

### 3.5 Permissioned Object Access Levels

**File:** `Shesha.Framework/Domain/Enums/RefListPermissionedAccess.cs`

```csharp
public enum RefListPermissionedAccess
{
    Disable = 1,             // Endpoint returns 404
    Inherited = 2,           // Inherits from parent object
    AnyAuthenticated = 3,    // Any logged-in user
    RequiresPermissions = 4, // Specific permissions required
    AllowAnonymous = 5       // No authentication needed
}
```

### 3.6 Permissioned Object Manager

**File:** `Shesha.Framework/Permissions/PermissionedObjectManager.cs`

- Maintains a database of permissioned objects with caching
- Objects are organized hierarchically (service → method) with inheritance
- CRUD method names are normalized: `GetAll`/`QueryAll`/`Get`/`Query` → `Get`, etc.
- Permissions are stored as comma-separated strings in the `Permissions` column
- **TODO comment at line 390:** "check if permission names exist" — permission name validation is not implemented

### 3.7 Permissioned Object Types

**File:** `Shesha.Framework/Permissions/ShaPermissionedObjectsTypes.cs`

```
Shesha.WebApi          — API service/controller
Shesha.WebApi.Action   — Individual API method
Shesha.WebCrudApi      — Dynamic CRUD service
Shesha.WebCrudApi.Action — CRUD method
Shesha.Entity          — Domain entity
Shesha.Entity.Action   — Entity CRUD operation
Shesha.Form            — Shesha form configuration
```

### 3.8 ShaPermissionChecker

**File:** `Shesha.Framework/Authorization/ShaPermissionChecker.cs`

- Extends ABP's `PermissionChecker<Role, User>`
- First checks ABP's built-in permission system (role-based)
- If not granted, checks all registered `ICustomPermissionChecker` implementations
- Uses a 5-minute sliding cache for custom permission results

### 3.9 Custom Permission Checkers

**ShaCustomPermissionChecker** (`Shesha.Core/Authorization/ShaCustomPermissionChecker.cs`):
- Checks `ShaRole` → `ShaRolePermission` chain
- Person → ShaRoleAppointedPerson → ShaRole → Permissions
- Supports entity-scoped permissions via `PermissionedEntities`

**SheshaWebCorePermissionChecker** (`Shesha.Web.Core/Authorization/SheshaWebCorePermissionChecker.cs`):
- **System Administrator role gets ALL permissions** (line 40): `if (await IsInAnyOfRolesAsync(person, RoleNames.SystemAdministrator)) return true;`
- This is a complete permission bypass for the "System Administrator" role

### 3.10 SheshaAuthorize Attribute

**File:** `Shesha.Framework/Authorization/SheshaAuthorizeAttribute.cs`

Custom attribute that declares access level and required permissions:
```csharp
[SheshaAuthorize(RefListPermissionedAccess.AnyAuthenticated)]
[SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, "perm1", "perm2")]
```

Used by `ApiPermissionedObjectProvider` to discover hardcoded security declarations and bootstrap them into the permissioned objects database.

---

## 4. Roles

### 4.1 ABP Static Roles

**File:** `Shesha.Framework/Authorization/Roles/StaticRoleNames.cs`

| Context | Role |
|---------|------|
| Host | `Application Administrator` |
| Host | `Application Developer` |
| Host | `Application Configurator` |
| Tenants | `Application Administrator` |
| Tenants | `Application Developer` |
| Tenants | `Application Configurator` |

### 4.2 Shesha Roles (ShaRole)

**File:** `Shesha.Core/Domain/ShaRole.cs`

- Extends `ConfigurationItemBase` (versioned configuration item)
- Has a `Permissions` collection (`IList<ShaRolePermission>`)
- `HardLinkToApplication` flag prevents accidental modification of system roles
- Roles are assigned via `ShaRoleAppointedPerson` (person-to-role mapping)
- Supports entity-scoped role appointments via `ShaRoleAppointmentEntity`

### 4.3 Named Roles

**File:** `Shesha.Web.Core/Authorization/RoleNames.cs`

```csharp
public const string SystemAdministrator = "System Administrator";
```

This role has **complete permission bypass** in `SheshaWebCorePermissionChecker`.

### 4.4 Role-Permission Mapping

**File:** `Shesha.Core/Domain/ShaRolePermission.cs`

```csharp
public class ShaRolePermission : FullPowerEntity
{
    public virtual ShaRole ShaRole { get; set; }
    public virtual string Permission { get; set; }
    public virtual bool IsGranted { get; set; }
}
```

---

## 5. Permission Definitions

### 5.1 Framework Permissions

**File:** `Shesha.Framework/Authorization/PermissionNames.cs`

| Constant | Value |
|----------|-------|
| `Pages_Tenants` | `Pages.Tenants` |
| `Pages_Users` | `Pages.Users` |
| `Pages_Roles` | `Pages.Roles` |
| `Pages_Hangfire` | `Pages.Hangfire` |

### 5.2 Shesha Permissions

**File:** `Shesha.Framework/Authorization/ShaPermissionNames.cs`

| Constant | Value |
|----------|-------|
| `Application_Configurator` | `app:Configurator` |
| `Pages_Persons` | `pages:persons` |
| `Pages_ShaRoles` | `pages:shaRoles` |
| `Pages_ApplicationSettings` | `pages:applicationSettings` |
| `Pages_Maintenance` | `pages:maintenance` |
| `Users_ResetPassword` | `users:resetPassword` |

### 5.3 WebCore Permissions

**File:** `Shesha.Web.Core/Authorization/PermissionNames.cs` (Boxfusion namespace)

| Constant | Value |
|----------|-------|
| `GeneralDashboard` | `pages:generalDashboard` |

### 5.4 Authorization Providers

| Provider | File | Status |
|----------|------|--------|
| `SheshaAuthorizationProvider` | `Shesha.Framework/Authorization/` | Active — registers framework permissions |
| `DbAuthorizationProvider` | `Shesha.Framework/Authorization/` | **DEAD CODE** — `SetPermissions()` is entirely commented out |
| `SheshaWebCoreAuthorizationProvider` | `Shesha.Web.Core/Authorization/` | Active — registers WebCore permissions via reflection |

**Issue:** `DbAuthorizationProvider` was presumably intended to load permission definitions from the database into ABP's permission system. This is completely disabled, which means database-defined permissions (from the `PermissionDefinition` entity) are **not** registered with ABP's `IPermissionManager`. They may still work through the Shesha custom permission checker chain, but this is a gap in the architecture.

---

## 6. Endpoint Security Inventory

### 6.1 Default Endpoint Access

**File:** `Shesha.Framework/SheshaFrameworkModule.cs` (line 141)

```csharp
DefaultEndpointAccess = Domain.Enums.RefListPermissionedAccess.AllowAnonymous
```
[IH: IMPLEMENT change - should be defaulted to Authenticated]

**This means: Any API endpoint that does not have an explicit permission configured in the database defaults to ANONYMOUS ACCESS.**

This is the single most critical security finding. The framework is **open by default** rather than **closed by default**.

### 6.2 Explicitly Anonymous Endpoints

| Service | Method | Justification |
|---------|--------|---------------|
| `TokenAuthController` | All methods | Authentication endpoints |
| `SessionAppService` | `GetCurrentLoginInfoAsync` | Session check |
| `SessionAppService` | `GetCurrentLoginInformationsAsync` | Legacy session check |
| `SettingsAppService` | `GetValueAsync` | **Exposes any setting value anonymously** |
| `SettingsAppService` | `GetConfigurationsAsync` | **Exposes all setting definitions anonymously** |
| `FormConfigurationAppService` | `GetByNameAsync` | Form config retrieval |
| `FormConfigurationAppService` | `CheckPermissionsAsync` | Form permission check |
| `UserAppService` | 10+ methods | Password reset flows |

### 6.3 Explicitly Secured Endpoints

| Service | Access Level | Permission |
|---------|-------------|------------|
| `StoredFileController` | `AnyAuthenticated` | Via `[SheshaAuthorize]` |
| `PermissionedObjectAppService` | `AnyAuthenticated` | Via `[SheshaAuthorize]` |
| `TokenAuthController.RefreshTokenAsync` | `[Authorize]` | JWT required |

### 6.4 CRUD Endpoints (Dynamic)

- `DynamicCrudAppService` methods call `CheckGetPermission()`, `CheckGetAllPermission()`, `CheckCreatePermission()`, `CheckUpdatePermission()`, `CheckDeletePermission()`
- These are ABP's built-in permission checks from `AbpCrudAppService`
- The `ApiAuthorizationHelper` explicitly **skips** CRUD methods (line 59-61) because they're expected to be handled by the entity permission system
- **Issue:** If entity-level permissions are not configured in the database, CRUD endpoints fall back to the `DefaultEndpointAccess` which is `AllowAnonymous`

---

## 7. Data-Level Security

### 7.1 Multi-Tenancy

- Entities implement `IMayHaveTenant` (nullable `TenantId`) or `IMustHaveTenant`
- ABP's data filter automatically restricts queries to the current tenant
- Tenant context is set during authentication (from JWT claims)
- `FullPowerEntity` base class implements `IMayHaveTenant`

### 7.2 Soft Delete

- ABP's `ISoftDelete` filter is active by default
- Entities with `IsDeleted = true` are automatically excluded from queries
- Some bootstrappers explicitly `DisableFilter(AbpDataFilters.SoftDelete)` when needed

### 7.3 Specifications (Row-Level Security)

**File:** `Shesha.Framework/Specifications/ShaSpecification.cs`

- `ShaSpecification<T>` provides a base for reusable LINQ expressions that filter entities
- Applied via `SpecificationsActionFilter` (registered in `Startup.cs` line 84)
- Can be used for row-level security patterns
- **Note:** This is a capability, not a requirement — applications must explicitly implement specifications for their entities

### 7.4 Entity-Level Permissions

- `EntityPermissionedObjectProvider` (`Shesha.Framework/Permissions/`) is **COMMENTED OUT** entirely
- Entity-level permissioned objects (type `Shesha.Entity`) exist in the system but there is no active provider bootstrapping them from entity types
- This means entity-level access control relies entirely on what's manually configured in the database

### 7.5 Audit Trail

- ABP's `FullAuditedEntity` provides `CreationTime`, `CreatorUserId`, `LastModificationTime`, `LastModifierUserId`, `DeletionTime`, `DeleterUserId`
- Login attempts are logged to `ShaUserLoginAttempt` with IP, browser, IMEI, device
- `EntityHistory.IsEnabledForAnonymousUsers = true` (line 178 of `SheshaFrameworkModule.cs`) — entity changes are tracked even for anonymous operations
- Entity properties marked with `[Audited]` attribute get additional tracking

---

## 8. Security Configuration & Settings

### 8.1 Security Settings Interface

**File:** `Shesha.Framework/Configuration/Security/ISecuritySettings.cs`

| Setting | Type | Default |
|---------|------|---------|
| `UserLockOutEnabled` | `bool` | `true` |
| `MaxFailedAccessAttemptsBeforeLockout` | `int` | `5` |
| `DefaultAccountLockoutSeconds` | `int` | `300` (5 min) |
| `SecuritySettings` (compound) | `SecuritySettings` | See below |

### 8.2 SecuritySettings Object

**File:** `Shesha.Framework/Configuration/Security/SecuritySettings.cs`

| Setting | Default |
|---------|---------|
| `AutoLogoffTimeout` | `0` (disabled) |
| `UseAutoLogoff` | `false` |
| `UseResetPasswordViaEmailLink` | `true` |
| `ResetPasswordEmailLinkLifetime` | `60` min |
| `UseResetPasswordViaSmsOtp` | `true` |
| `ResetPasswordSmsOtpLifetime` | `60` min |
| `MobileLoginPinLifetime` | `60` min |
| `UseResetPasswordViaSecurityQuestions` | `true` |
| `ResetPasswordViaSecurityQuestionsNumQuestionsAllowed` | `3` |
| **`DefaultEndpointAccess`** | **`AllowAnonymous`** |

---

## 9. CORS, Headers & Transport Security

### 9.1 CORS Configuration

**File:** `Shesha.Web.Host/Startup/Startup.cs` (line 157-161)

```csharp
app.UseCors(x => x
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(origin => true)  // allow any origin
    .AllowCredentials());
```

**This is a completely open CORS policy.** It allows:
- Any origin
- Any HTTP method
- Any header
- Credentials (cookies, JWT tokens)

This effectively disables CORS protection entirely.

[IH: IMPLEMENT appropriate changes without restricting calls from front-end. Should also update the starter project template @shesha-starter\backend\src\ShaCompanyName.ShaProjectName.Web.Host\Startup\Startup.cs]

### 9.2 Missing Security Headers

The following security headers are **not configured**:
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (CSP)
- `X-Content-Type-Options`
- `X-Frame-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

[IH: IMPLEMENT appropriate changes that would not impact the development process. Should also update the starter project template @shesha-starter\backend\src\ShaCompanyName.ShaProjectName.Web.Host\Startup\Startup.cs]

### 9.3 HTTPS

- No explicit HTTPS redirection middleware (`app.UseHttpsRedirection()` is absent)
- The backend supports both HTTP and HTTPS URLs (`http://localhost:21021;https://localhost:44362`)

---

## 10. Exception Handling & Information Leakage

### 10.1 Exception Filter

**File:** `Shesha.Framework/Exceptions/ShaExceptionToErrorInfoConverter.cs`

```csharp
result.Details = !string.IsNullOrWhiteSpace(result.Details)
    ? result.Details
    : exception.Message;
```

This converter ensures that `exception.Message` is always included in the API response. While ABP normally wraps exceptions, the message content may leak implementation details (table names, query information, stack context) in non-UserFriendlyException cases.

### 10.2 Authorization Error Responses

`SheshaAuthorizationFilter.cs` (line 93-98) catches generic exceptions and returns `InternalServerError` with `_errorInfoBuilder.BuildForException(ex)` — which may include stack traces in development mode.

### 10.3 Swagger/OpenAPI

- Swagger UI is exposed at `/swagger` in production builds (no conditional check for environment)
- API documentation reveals all endpoints, DTOs, and their structures

[IH: IMPLEMENT - Swagger should be disabled by default in production builds. Also add an application setting that would allow disabling Swagger through application settings. Should also update the starter project template @shesha-starter\backend\src\ShaCompanyName.ShaProjectName.Web.Host\Startup\Startup.cs]

---

## 11. Cryptography & Secrets Management

### 11.1 Hardcoded Encryption Passphrase

**File:** `Shesha.Framework/AppConsts.cs` (line 8)

```csharp
public const string DefaultPassPhrase = "gsKxGZ012HLL3MI5";
```

This passphrase is used by ABP's `SimpleStringCipher` to encrypt/decrypt JWT tokens for SignalR's query string authentication (`AuthConfigurer.cs` line 74, `TokenAuthController.cs` line 419).

**Impact:** Anyone with source code access (it's open-source) can decrypt encrypted tokens from query strings.

### 11.2 JWT Security Key

- Stored in `appsettings.json` under `Authentication:JwtBearer:SecurityKey`
- Loaded at runtime, not hardcoded
- Uses `SymmetricSecurityKey` with `HmacSha256` signing

### 11.3 Password Hashing

- Uses ASP.NET Identity's `IPasswordHasher<TUser>` (PBKDF2 by default)
- This is appropriate and industry-standard

---

## 12. Hangfire / Background Jobs Security

**File:** `Shesha.Scheduler/Hangfire/HangfireAuthorizationFilter.cs`

- Dashboard is mounted at `/hangfire` with a custom `HangfireAuthorizationFilter`
- Filter extracts username from JWT token, resolves the user, and checks `Pages.Hangfire` permission
- **Properly secured** — requires both authentication and the Hangfire permission

---

## 13. GraphQL Security

**File:** `Shesha.GraphQL/GraphQL/Middleware/GraphQLMiddleware.cs`

- GraphQL endpoint is registered as middleware (`app.UseMiddleware<GraphQLMiddleware>()`)
- Handles POST requests to the configured GraphQL path
- **No visible authorization check** in the middleware itself
- Authorization depends on the underlying resolvers and the global `SheshaAuthorizationFilter` (which only applies to MVC controller actions, not middleware)
- `GraphQL Playground` is enabled in production (`app.UseGraphQLPlayground()`) — allows interactive API exploration

**Issue:** GraphQL queries may bypass the `SheshaAuthorizationFilter` since they don't go through MVC routing. Authorization must be implemented at the resolver/field level, but there's no evidence of systematic authorization in the GraphQL layer.
[IH: IMPLEMENT appropriate access control GraphQL queries should respect the permissions specified for the entities being queried at least for the top level entity being queried and any Global specifications should be applied if possible]


---

## 14. File Upload/Download Security

**File:** `Shesha.Application/StoredFiles/StoredFileController.cs`

- Controller is decorated with `[SheshaAuthorize(RefListPermissionedAccess.AnyAuthenticated)]`
- Requires authentication for all file operations
- Download endpoint: `GET /api/StoredFile/Download?id={guid}&versionNo={int}`
- **No object-level authorization** — any authenticated user can download any file by GUID
- File downloads track download events via `MarkDownloadedAsync`

---

## 15. Form Configuration Security

**File:** `Shesha.Web.FormsDesigner/Services/FormConfigurationAppService.cs`

- `GetByNameAsync` and `CheckPermissionsAsync` are `[AllowAnonymous]` — allows retrieving form configurations without authentication
- `GetAnonymousFormsAsync` returns all forms with `AllowAnonymous` access
- `CheckFormPermissionsAsync` (line 88-107) verifies per-form permissions:
  - Default access for forms is `AnyAuthenticated` (line 96)
  - Supports `RequiresPermissions` for specific form access control
- Forms can be individually permissioned via the `PermissionedObject` system

---

## 16. Framework Controller — Unsecured Admin Endpoints

**File:** `Shesha.Framework/Controllers/FrameworkController.cs`

**This controller has NO authorization attributes at all.** Every endpoint is publicly accessible.

| Method | Endpoint | Risk |
|--------|----------|------|
| `POST` | `/api/Framework/BootstrapReferenceLists` | Triggers expensive bootstrapping operation — DoS vector |
| `POST` | `/api/Framework/BootstrapSettings` | Re-initializes all settings — DoS / configuration tampering |
| `POST` | `/api/Framework/BootstrapEntityConfigs` | Re-initializes entity configs — DoS / configuration tampering |
| `GET` | `/api/Framework/Assemblies` | **Lists all loaded assemblies with versions, locations, architecture** — full information disclosure |
| `GET` | `/api/Framework/CurrentRamUsage` | Returns server RAM usage — resource reconnaissance |
| `GET` | `/api/Framework/DynamicAssemblies` | Lists dynamically loaded assemblies as CSV — information disclosure |
| `POST` | `/api/Framework/TestException` | Generates arbitrary exceptions — stack trace disclosure, DoS |

**Impact:** Any unauthenticated user can discover the complete technology stack (assembly names, versions, file paths), trigger expensive bootstrap operations repeatedly, and generate exceptions to probe error handling.
layer.
[IH: IMPLEMENT - retrict to 'Application Administrator' role]

---

## 17. Default Users & Credentials

**File:** `Shesha.Core/Roles/HostRoleAndUserBuilder.cs`

Three default users are seeded automatically during host initialization:

| Username | Email | Password | Role |
|----------|-------|----------|------|
| `admin` | `admin@host` | `123qwe` | Application Administrator |
| `dev` | `dev@host` | `123qwe` | Application Developer |
| `config` | `config@host` | `123qwe` | Application Configurator |

**Hardcoded in:** `Shesha.Framework/Authorization/Users/User.cs` (line 16):
```csharp
public const string DefaultPassword = "123qwe";
```

All users are created with `IsEmailConfirmed = true` and `IsActive = true`. The password `123qwe` is hardcoded in `HostRoleAndUserBuilder.cs` line 88 (not even using the constant).

**Impact:** Any deployment that doesn't immediately change these passwords is fully compromised. Since "System Administrator" role grants all permissions (via `SheshaWebCorePermissionChecker`), the `admin` user has complete access to the entire system.

---

## 18. OTP Generation Weakness

**File:** `Shesha.Application/Otp/OtpGenerator.cs`

```csharp
var random = new Random();  // Weak, predictable PRNG
for (int i = 0; i < passwordLength; i++)
{
    password += alphabet[random.Next(alphabet.Length)];
}
```

**Issues:**
- Uses `System.Random` which is seeded by the system clock — cryptographically weak and predictable
- Should use `System.Security.Cryptography.RandomNumberGenerator` for security-critical random values
- OTPs generated with weak randomness can be predicted by an attacker who knows the approximate generation time

---

## 19. Critical Findings

### CF-0: Framework Controller Completely Unsecured

**Severity:** CRITICAL
**Location:** `Shesha.Framework/Controllers/FrameworkController.cs`
**Impact:** All endpoints on this controller — including assembly listing, bootstrap triggers, exception generation, and RAM usage — are publicly accessible without any authentication. Provides full information disclosure and DoS vectors.
[IH: IMPLEMENT - retrict to 'Application Administrator' role]


### CF-0b: Default Users with Hardcoded Password "123qwe"

**Severity:** CRITICAL
**Location:** `Shesha.Core/Roles/HostRoleAndUserBuilder.cs:88`, `Shesha.Framework/Authorization/Users/User.cs:16`
**Impact:** Three admin-level users (`admin`, `dev`, `config`) are seeded with the well-known password `123qwe`. Combined with the System Administrator role's all-permissions bypass, this provides complete system access to anyone who knows the default credentials.
[IH: IMPLEMENT - Seed all default users with RequireChangePassword = true; In case an application is already connecting to a database after  seeding and therefore alreasy contains the default users with the original password. Create a database migration that looks for any default users with the default password (Password Hash: 'AQAAAAIAAYagAAAAEFKROtKVvkKZcM2mW3hG8W3GBMbyljRRKm8cNTm43o+bEefY9dZdh0MdN+tK0oOgjQ==') still set and UPDATE to sett the set the required change password flag to 1. i.e. `UPDATE dbo.AbpUsers SET [RequireChangePassword] = 1 WHERE Password = 'AQAAAAIAAYagAAAAEFKROtKVvkKZcM2mW3hG8W3GBMbyljRRKm8cNTm43o+bEefY9dZdh0MdN+tK0oOgjQ=='`]

### CF-0c: Weak OTP Generation Using System.Random

**Severity:** HIGH
**Location:** `Shesha.Application/Otp/OtpGenerator.cs:18`
**Impact:** OTPs are generated using `new Random()` (clock-seeded, predictable PRNG) instead of `System.Security.Cryptography.RandomNumberGenerator`. An attacker who knows the approximate generation time could predict OTP values.
[IH: IMPLEMENT to use `System.Security.Cryptography.RandomNumberGenerator`]

### CF-1: Default Endpoint Access is AllowAnonymous

**Severity:** CRITICAL
**Location:** `SheshaFrameworkModule.cs:141`
**Impact:** Every API endpoint without explicit database-configured permissions is accessible without authentication. This includes all dynamically generated CRUD endpoints for every entity in the system.
[IH: IMPLEMENT change default to Authorise]

### CF-2: Hardcoded Encryption Passphrase

**Severity:** CRITICAL
**Location:** `AppConsts.cs:8`
**Impact:** The `DefaultPassPhrase` used for SignalR token encryption is hardcoded in open-source code. Any attacker can decrypt encrypted tokens from query strings.

### CF-3: Minimum Password Length of 3

**Severity:** CRITICAL
**Location:** `SheshaFrameworkModule.cs:146`
**Impact:** The default password policy allows passwords as short as 3 characters with no complexity requirements. While configurable, new deployments start with this dangerously weak default.
[IH: IMPLEMENT - increase to 6]

### CF-4: Wide-Open CORS Policy

**Severity:** HIGH
**Location:** `Startup.cs:157-161`
**Impact:** `SetIsOriginAllowed(origin => true)` with `AllowCredentials()` allows any website to make authenticated cross-origin requests, enabling CSRF-like attacks.
[IH: IMPLEMENT appropriate changes without restricting calls from front-end. Should also update the starter project template @shesha-starter\backend\src\ShaCompanyName.ShaProjectName.Web.Host\Startup\Startup.cs]

### CF-5: Anonymous Settings API

**Severity:** HIGH
**Location:** `SettingsAppService.cs:48, 111`
**Impact:** `GetValueAsync` allows anonymous access to any application setting by module/name. `GetConfigurationsAsync` exposes all setting definitions. This could leak security configurations, database connection info (if stored as settings), API keys, etc.
[IH: To be implemented later on v0.47 by upgrading ConfigurationItemBase Class to support permissioning for read operations per item so that all configuration items, e.g. settings, forms, reference lists, etc... (which also sometimes selectively need to be exposed to the public) may benefit from this)

### CF-6: Insufficient Permission Management Protection

**Severity:** HIGH
**Location:** `PermissionedObjectAppService.cs:13`
**Impact:** The API that manages endpoint permissions (`SetPermissionsAsync`) only requires `AnyAuthenticated`. Any logged-in user can modify security policies on any endpoint, effectively granting themselves admin access.
[IH: IMPLEMENT only 'Application Administrator' role should be able to update permissions]


### CF-7: GraphQL Authorization Gap

**Severity:** HIGH
**Location:** `GraphQLMiddleware.cs`
**Impact:** GraphQL queries bypass MVC authorization filters. Without resolver-level authorization, all data accessible via GraphQL may be available to any caller.
[IH: IMPLEMENT appropriate access control GraphQL queries should respect the permissions specified for the entities being queried at least for the top level entity being queried and any Global specifications should be applied if possible]

### CF-8: Code-Level AllowAnonymous Overrides Database Permissions

**Severity:** HIGH
**Location:** `SheshaAuthorizationFilter.cs:44`, `ApiAuthorizationHelper.cs:47-49`
**Impact:** Code-level `[AllowAnonymous]` or `[AbpAllowAnonymous]` attributes completely bypass all PermissionedObject database-configured permissions. Even if an admin sets `Disable` or `RequiresPermissions` in the database, a code-level anonymous attribute silently overrides it. This creates a discrepancy between what administrators configure and what is actually enforced. Affected endpoints include `SettingsAppService.GetValue`, `SettingsAppService.GetConfigurations`, and `UserAppService.ChangePassword`.
[IH: IMPLEMENT Change so that database configuration overrides code attribute for consistency]

### CF-9: RequireAll Flag Hardcoded to False

**Severity:** HIGH
**Location:** `ObjectPermissionChecker.cs:94`, `ApiAuthorizationHelper.cs:70`, `EntityCrudAuthorizationHelper.cs:76`, `EntitiesAppService.cs:53`
**Impact:** All callers of `ObjectPermissionChecker.AuthorizeAsync()` pass `requireAll: false`. When multiple permissions are configured on an endpoint with `RequiresPermissions` access, a user needs only ANY ONE of them to gain access (OR logic). There is no way to configure AND logic. This may be less restrictive than what administrators intend when assigning multiple required permissions.
[IH: DO NOT IMPLEMENT - This was intentional as permission should be ORD. However, update any comments left in the code that may imply otherwise or be explicit about the intended logic in the code through comments.]

### CF-10: Entity CRUD Missing DefaultEndpointAccess Fallback

**Severity:** HIGH
**Location:** `EntityCrudAuthorizationHelper.cs:76`, `ObjectPermissionChecker.cs:61-68`
**Impact:** `EntityCrudAuthorizationHelper` does not pass `replaceInherited` (the `DefaultEndpointAccess` fallback) to `ObjectPermissionChecker.AuthorizeAsync()`, unlike `ApiAuthorizationHelper` which does. When an entity CRUD endpoint has `Inherited` access and no parent with a concrete setting, `actualAccess` stays `Inherited` (value 2), which doesn't match any explicit check. It falls through to the authentication check — accidentally blocking anonymous users but allowing any authenticated user regardless of the `DefaultEndpointAccess` setting. The admin-configured security setting has no effect on entity CRUD endpoints.
[IH: IMPLEMENT Change so that the logic is more explicit rather than 'accidental' and it respects the `DefaultEndpointAccess` setting, which itself should be updated to Authenticated.]

### CF-11: Dead DB Authorization Provider

**Severity:** MEDIUM
**Location:** `DbAuthorizationProvider.cs:27-63`
**Impact:** The entire `SetPermissions()` method is commented out. Permission definitions stored in the database are not loaded into ABP's permission system, potentially leaving gaps in permission checking.

### CF-12: No Rate Limiting

**Severity:** MEDIUM
**Impact:** No rate limiting on any endpoints, including: authentication, password reset OTP sending, security question verification. Enables brute-force attacks and OTP/SMS flooding.

### CF-13: Entity-Level Permissions Provider Disabled

**Severity:** MEDIUM
**Location:** `EntityPermissionedObjectProvider.cs`
**Impact:** The entire class is commented out. Entity-level permission objects are not automatically bootstrapped, relying entirely on manual database configuration.

---

## 20. Recommendations

### Priority 0 — Urgent (Before Next Release)

0a. **Secure or remove the FrameworkController**
   - Add `[SheshaAuthorize(RefListPermissionedAccess.RequiresPermissions, ShaPermissionNames.Pages_Maintenance)]` to the entire controller
   - Consider removing `TestException`, `Assemblies`, `DynamicAssemblies`, and `CurrentRamUsage` from production builds entirely
   - At minimum require `AnyAuthenticated` + admin permission

0b. **Force password change for seeded users**
   - Set `RequireChangePassword = true` on all seeded users in `HostRoleAndUserBuilder`
   - Generate random passwords during seeding and log them to a secure channel
   - Remove the hardcoded `"123qwe"` from `HostRoleAndUserBuilder.cs` line 88 and use `User.CreateRandomPassword()` instead
   - Add a startup warning if default credentials are still active

0c. **Fix OTP generation to use cryptographic randomness**
   - Replace `new Random()` in `OtpGenerator.cs` with `System.Security.Cryptography.RandomNumberGenerator`
   - Example: `RandomNumberGenerator.GetInt32(alphabet.Length)` for each character

### Priority 1 — Critical (Immediate)

1. **Change `DefaultEndpointAccess` to `AnyAuthenticated`**
   - `SheshaFrameworkModule.cs` line 141
   - This single change closes the largest attack surface
   - Existing applications may break if they rely on anonymous API access — provide a migration guide

2. **Remove or externalize `DefaultPassPhrase`**
   - Move to configuration/secrets management
   - Rotate the key for all existing deployments
   - Consider eliminating SignalR query-string token encryption in favor of a more secure transport

3. **Increase default password complexity**
   - `RequiredLength`: minimum 8 (NIST recommendation)
   - `RequireDigit`: true
   - `RequireLowercase`: true
   - `RequireUppercase`: true
   - Consider removing `RequireNonAlphanumeric` per NIST 800-63B (encourages passphrases)

### Priority 2 — High

4. **Restrict CORS policy**
   - Replace `SetIsOriginAllowed(origin => true)` with an explicit allowlist from configuration
   - Pattern: `_appConfiguration.GetSection("App:CorsOrigins").Get<string[]>()`

5. **Secure the Settings API**
   - Remove `[AllowAnonymous]` from `GetValueAsync` — require authentication
   - If some settings must be public, introduce a `IsPublic` flag on setting definitions
   - Remove `[AllowAnonymous]` from `GetConfigurationsAsync` or filter to public-only settings

6. **Restrict `PermissionedObjectAppService` to admin role**
   - Change from `AnyAuthenticated` to `RequiresPermissions` with a new `security:managePermissions` permission
   - Only admin/configurator roles should be able to modify endpoint security policies

7. **Add authorization to GraphQL layer**
   - Implement a GraphQL authorization middleware or use field-level authorization
   - At minimum, require authentication for all GraphQL queries
   - Consider using the same `ObjectPermissionChecker` system for GraphQL operations

8. **Add rate limiting**
   - Add `AspNetCoreRateLimit` or similar middleware
   - Rate limit: authentication endpoints (e.g., 5 attempts/minute per IP)
   - Rate limit: OTP send endpoints (e.g., 3 sends/hour per user)
   - Rate limit: password reset endpoints

### Priority 3 — Medium

9. **Re-enable `DbAuthorizationProvider`**
   - Uncomment and fix the `SetPermissions()` method
   - Ensure database-defined permissions are properly loaded into ABP's permission system

10. **Re-enable `EntityPermissionedObjectProvider`**
    - Uncomment the class to auto-bootstrap entity-level permissions
    - This ensures CRUD endpoints for all entities have permission entries in the database

11. **Add security headers middleware**
    ```csharp
    app.UseHsts();
    app.UseHttpsRedirection();
    app.Use(async (context, next) => {
        context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Add("X-Frame-Options", "DENY");
        context.Response.Headers.Add("X-XSS-Protection", "0");
        context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'");
        await next();
    });
    ```

12. **Add object-level authorization to stored files**
    - Check that the requesting user has access to the entity that owns the file
    - Do not rely solely on GUID obscurity

13. **Fix `ChangePasswordAsync` authorization**
    - Replace `[AbpAllowAnonymous]` with `[Authorize]` on `ChangePasswordAsync`
    - The internal `_abpSession.UserId == null` check is insufficient

14. **Disable Swagger and GraphQL Playground in production**
    ```csharp
    if (_hostEnvironment.IsDevelopment())
    {
        app.UseSwaggerUI(...);
        app.UseGraphQLPlayground();
    }
    ```

15. **Audit information disclosure in password reset**
    - `GetUserPasswordResetOptionsAsync` reveals whether a user has email/phone configured
    - Consider returning the same options for all users, or requiring a pre-authentication step

### Priority 4 — Enhancements

16. **Implement a security audit log**
    - Log permission changes, role assignments, security setting modifications
    - Track who changed what security policy and when

17. **Add permission validation**
    - Implement the TODO at `PermissionedObjectManager.cs:390` — validate that permission names exist before saving

18. **Consider implementing ABAC (Attribute-Based Access Control)**
    - The current RBAC model is adequate for most cases
    - For complex multi-tenant scenarios, consider adding attribute-based policies

19. **Add Content Security Policy for API responses**
    - Prevent response sniffing and injection attacks

20. **Implement token rotation policy**
    - Enforce maximum token lifetime
    - Implement sliding expiration with hard ceiling

21. **Add MFA support at the framework level**
    - OTP-based login exists but is separate from the primary auth flow
    - Consider adding TOTP (authenticator app) support as a second factor

---

## Appendix A: Key Security Files Reference

| File | Purpose |
|------|---------|
| `Shesha.Framework/SheshaFrameworkModule.cs` | Security defaults, module initialization |
| `Shesha.Web.Host/Startup/Startup.cs` | Middleware pipeline, CORS, Hangfire |
| `Shesha.Web.Host/Startup/AuthConfigurer.cs` | JWT configuration |
| `Shesha.Application/Authorization/TokenAuthController.cs` | Authentication endpoints |
| `Shesha.Application/Authorization/ApiAuthorizationHelper.cs` | API authorization logic |
| `Shesha.Application/Authorization/SheshaAuthorizationFilter.cs` | Global MVC auth filter |
| `Shesha.Framework/Authorization/ObjectPermissionChecker.cs` | Permission resolution |
| `Shesha.Framework/Permissions/PermissionedObjectManager.cs` | Permission database management |
| `Shesha.Framework/Authorization/ShaPermissionChecker.cs` | Custom permission checking |
| `Shesha.Core/Authorization/ShaCustomPermissionChecker.cs` | ShaRole-based permission checking |
| `Shesha.Web.Core/Authorization/SheshaWebCorePermissionChecker.cs` | System Admin bypass |
| `Shesha.Framework/Authorization/ShaLoginManager.cs` | Login management |
| `Shesha.Framework/Authorization/Users/UserManager.cs` | User/password management |
| `Shesha.Framework/Configuration/Security/ISecuritySettings.cs` | Security settings interface |
| `Shesha.Framework/Configuration/Security/SecuritySettings.cs` | Security settings class |
| `Shesha.Framework/Configuration/IPasswordComplexitySettings.cs` | Password policy |
| `Shesha.Framework/Domain/Enums/RefListPermissionedAccess.cs` | Access level enum |
| `Shesha.Application/Permissions/PermissionedObjectAppService.cs` | Permission management API |
| `Shesha.Application/Permissions/ApiPermissionedObjectProvider.cs` | API permission bootstrapper |
| `Shesha.Framework/Permissions/ShaPermissionedObjectsTypes.cs` | Permission object type constants |
| `Shesha.Core/Domain/ShaRole.cs` | Role entity |
| `Shesha.Core/Domain/ShaRolePermission.cs` | Role-permission mapping |
| `Shesha.Framework/Authorization/Roles/StaticRoleNames.cs` | Built-in role names |
| `Shesha.Web.Core/Authorization/RoleNames.cs` | Named roles |
| `Shesha.Framework/Authorization/PermissionNames.cs` | Permission constants |
| `Shesha.Framework/Authorization/ShaPermissionNames.cs` | Shesha permission constants |
| `Shesha.Framework/AppConsts.cs` | Hardcoded passphrase |
| `Shesha.Application/StoredFiles/StoredFileController.cs` | File access |
| `Shesha.Application/Settings/SettingsAppService.cs` | Settings API |
| `Shesha.GraphQL/GraphQL/Middleware/GraphQLMiddleware.cs` | GraphQL endpoint |
| `Shesha.Scheduler/Hangfire/HangfireAuthorizationFilter.cs` | Hangfire dashboard auth |
| `Shesha.Web.FormsDesigner/Services/FormConfigurationAppService.cs` | Form config security |
| `Shesha.Framework/Controllers/FrameworkController.cs` | **UNSECURED** admin endpoints |
| `Shesha.Core/Roles/HostRoleAndUserBuilder.cs` | Default user/role seeding |
| `Shesha.Framework/Authorization/Users/User.cs` | Default password constant |
| `Shesha.Application/Otp/OtpGenerator.cs` | Weak OTP generation |
| `Shesha.Application/Authorization/EntityCrudAuthorizationHelper.cs` | Entity CRUD authorization |
| `Shesha.Framework/Specifications/ShaSpecification.cs` | Row-level security base |
| `Shesha.NHibernate/NHibernate/Filters/MayHaveTenantFilter.cs` | Tenant data isolation |
| `Shesha.NHibernate/NHibernate/Filters/SoftDeleteFilter.cs` | Soft delete filter |
