# Release Notes

## 🐞 Bug Fixes

- **Notification Emails Freezing the API** - Fixed thread-pool starvation when notification bursts hit slow/rejecting SMTP servers. `EmailChannelSender` now uses `SendMailAsync` and reads SMTP settings via `GetValueAsync()`. `SheshaEmailSender` async path reads settings via `GetValueAsync()`; sync API unchanged. Previously each email held a thread-pool thread for the whole SMTP conversation (up to 100 s), queuing all requests on the instance
- **GraphQL SchemaContainer Memory Leak"** - Fixed the singleton `SchemaContainer` capturing a request-scoped `IServiceProvider`, retaining dead DI scopes indefinitely. `EntityQuery` now resolves transients per invocation from the current execution's `RequestServices` (with fallback for background/job-initiated queries). `SchemaContainer` no longer holds a request-scoped provider — resolves via `HttpContextAccessor` with fallback
- **Entity Config Import Duplicate Array Items Type** - Fixed startup failure (`uq_Frwk_EntityProperties_Path violation`). Exporter no longer leaks nested/array-items properties as top-level siblings. Packages already containing leaked entries continue to import
- **Form Configuration Application Field on Edit** - Edit view now renders Application as a front-end application lookup/dropdown (previously free text, so values were silently not saved)
- **Form Import Cross-Application Mismatch** - Importer now matches existing forms on front-end application as well as module and name. Importing a web form no longer overwrites a same-named mobile form or retires the web Live version
- **Autocomplete Entity Filter with Empty Model Type** - Autocomplete component now works when the form's Model type is empty

## 💪 Enhancements
- **Login & OTP Rate Limiting**
- **Hangfire Dashboard Access Control**
  - `/hangfire` now enforced by the framework via `Pages.Hangfire` permission
  - Framework filter rewritten as `IDashboardAsyncAuthorizationFilter:` validates the JWT signature, expiry, issuer/audience and blacklist before checking permission (previously parsed the token without validation)
  - Added `UseSheshaHangfireDashboard()` extension; hosts call one line, so the filter can't be omitted or replaced
  - Removed the hard-coded `username == "admin"` filter from the starter, functional-tests host and `Shesha.Web.Host`
  - `JwtExtensions` helpers marked obsolete / made to validate, since their output must not drive access decisions
  - Back-end project update — Startup/Startup.cs:
    - Replace `app.UseHangfireDashboard(...);` with `app.UseSheshaHangfireDashboard();`.
    - Ensure that `SwaggerUiAccessMiddleware` is registered via `app.UseMiddleware<SwaggerUiAccessMiddleware>();`.   
- **SheshaAuthorize isConfigurable + Attribute Consolidation**
  - Added `IsConfigurable` to `SheshaAuthorize: false` = code-based access is final (UI read-only); true = configuration may override
  - Replaced all `[AbpAuthorize]` / `[Authorize]` on framework app services with `[SheshaAuthorize(..., isConfigurable = false)]`
  - `[AllowAnonymous]` still takes precedence and is not configurable; use `[SheshaAuthorize(RefListPermissionedAccess.AllowAnonymous, isConfigurable = true)]` for anonymous-but-configurable endpoints
- **Starter Template Permission Checker Removed**
  - Deleted the ]*.Web.Core/Authorization] folder (and IoC registration) from the starter template and functional-tests host
  - Removed the custom checker that granted every permission to any user named admin
  - Admin now receives only what its roles grant
- **Entity CRUD Security Attribute Refactor**
  - Removed `[CrudDisableActions]`; functionality moved into `[Entity]`
  - `[Entity]` now supports `CrudActions` flags (All/None/Create/Read/Update/Delete), `Access`, `Permissions` and `IsConfigurable`; `GenerateApplicationService` replaced
  - Added stackable `[EntityAuthorize(actions, access, permissions)]` for per-action rules
  - `[AllowAnonymous]` on entities is ignored (explicit attributes preferred)
- **Property-Level Authorization (POPIA) on Core Entities**
  - Properties may declare stricter authorization than their entity via attribute `SheshaAuthorizeAttribute` (access level + permissions)
  - Read operations omit/nullify restricted values; write operations reject or ignore changes
  - Sorting, filtering and quick search on restricted properties are blocked for unauthorised callers
- **IShaRoleManager — UserManager-Style Role API with Audit Trail**
  - Added `IShaRoleManager` / `ShaRoleManager` for assigning and removing `ShaRoles`, with XML-documented methods:
    - `AddToRoleAsync`, `AddToRolesAsync`, `RemoveFromRoleAsync`, `RemoveFromRolesAsync`, `SetRolesAsync`
    - `DeleteAppointmentAsync`, `IsInRoleAsync`
    - `GetRolesForPersonAsync`, `GetPersonsInRoleAsync`, `GetAppointmentsAsync` (by person or by role)
  - All operations go through the audited `ShaRoleAppointedPerson` entity, providing a full audit trail
  - Optional `ShaRoleAppointmentData` parameter carries appointment context through each operation
  - `ShaRoleAppointedPersonActionsAppService` reduced to two methods (`AddToRoleAsync`, `DeleteAsync`); role management now goes through `ShaRoleManager` and this AppService
  - `IShaRoleAppointedPersonDto` updated: removed `Entities`, added `PermissionedEntities
  - Removed `FromDate`, `ToDate` and `Status` from `ShaRoleAppointment` — appointment lifecycle now relies on the standard `FullAuditedEntity` fields (`CreationTime`, `DeletionTime`, `IsDeleted`)
- **Permission Cleanup & Standard Roles**
  - Consolidated permission-name constants (PermissionNames, ShaPermissionNames) under the documented naming convention
  - Migration renames existing permissions, role assignments and permissioned-object configuration without loss
  - Four standard roles (Configurator, System Administrator, User Administrator, User) now defined as configuration items in Shesha Core
- **GraphQL Endpoint & Playground Removed**
  - `/graphql` and `/ui/playground` removed — clients use GraphQL implicitly only
  - `GraphQL.Server.Ui.Playground` is deprecated
- **Role & Entity CRUD Security Tightening**
  - Default `[Entity]` CRUD policy (`DefaultCrudConfig.Default`) reverted to `CrudActions.All` — entities without an explicit CRUD configuration are reachable again, superseding the earlier opt-in-only default
  - `ShaRole` now carries a non-configurable CRUD policy (`IsConfigurable = false`, `CrudActions = All`, `CrudActionsAccess = RequiresPermissions`, `CrudActionsPermissions = [Role_Manage]`), plus `[EntityAuthorize(Read, [Role_Manage, User_Manage])]` so reads are also allowed with `User_Manage`; role data can no longer be opened up via configuration
  - `SheshaAuthorizationProvider.GetModuleId` no longer inserts a new `Module` row when one already exists under concurrent calls — it now selects the existing module's Id directly instead of create-if-missing, preventing duplicate module records

