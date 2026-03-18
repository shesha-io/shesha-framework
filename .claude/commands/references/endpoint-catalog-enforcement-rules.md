# Endpoint Catalog — Enforcement Rules Reference

> Authoritative reference for how Shesha authorization is enforced at runtime.
> Used by the endpoint-catalog skill to correctly classify endpoint security.

## Authorization Chain (Request Flow)

```
HTTP Request
  │
  ├─ SheshaAuthorizationFilter (global MVC filter)
  │   ├─ [AllowAnonymous] metadata? → SKIP ALL CHECKS (return immediately)
  │   ├─ Not a controller action? → SKIP
  │   └─ Resolve all ISheshaAuthorizationHelper → call AuthorizeAsync on each
  │       │
  │       ├─ ApiAuthorizationHelper (non-CRUD methods)
  │       │   ├─ [AllowAnonymous] or [AbpAllowAnonymous] on class/method? → SKIP
  │       │   ├─ Not ApplicationService or ControllerBase? → SKIP
  │       │   ├─ Method name in CrudMethods dict? → SKIP (handled by Entity helper)
  │       │   └─ ObjectPermissionChecker.AuthorizeAsync(
  │       │         typeName, methodName, "Shesha.WebApi.Action",
  │       │         isAuthenticated, replaceInherited=DefaultEndpointAccess)
  │       │
  │       └─ EntityCrudAuthorizationHelper (CRUD methods only)
  │           ├─ Method NOT in CrudMethods dict? → SKIP
  │           ├─ Not AbpCrudAppService<>? → SKIP
  │           ├─ No entity type resolved? → SKIP
  │           └─ ObjectPermissionChecker.AuthorizeAsync(
  │                 entityFullName, crudMethod, "Shesha.Entity.Action",
  │                 isAuthenticated, replaceInherited=NULL)  ← NO FALLBACK
  │
  └─ ObjectPermissionChecker.AuthorizeAsync(...)
      ├─ Authorization disabled globally? → ALLOW
      ├─ Map method via CrudMethods dict → build "{object}@{method}"
      ├─ Lookup PermissionedObject from DB/cache
      │   └─ Not found? → Creates default with Access=Inherited
      ├─ Resolve actualAccess:
      │   ├─ If replaceInherited != null AND ActualAccess == Inherited → use replaceInherited
      │   └─ Otherwise → use ActualAccess as-is
      ├─ permission == null? → ALLOW
      ├─ actualAccess == AllowAnonymous? → ALLOW
      ├─ actualAccess == AnyAuthenticated AND authenticated? → ALLOW
      ├─ NOT authenticated? → THROW 401
      ├─ actualAccess == Disable? → THROW 404
      ├─ actualAccess == RequiresPermissions + no permissions? → THROW 403
      └─ actualAccess == RequiresPermissions + permissions? →
          ShaPermissionChecker.AuthorizeAsync(requireAll=false, permissions)
```

## CrudMethods Dictionary

Methods in this dictionary are handled by `EntityCrudAuthorizationHelper` (entity-level).
Methods NOT in this dictionary are handled by `ApiAuthorizationHelper` (service-level).

```
GetAll   → Get
QueryAll → Get
Get      → Get
Query    → Get
Create   → Create
CreateGql → Create
Update   → Update
UpdateGql → Update
Delete   → Delete
```

**NOT mapped (service-level check only):** ExportToExcel, Specifications, Reorder, and any custom methods.

## Dynamic CRUD Endpoint Generation

This section explains exactly which entity classes get dynamic CRUD endpoints, how, and why.

### Which Entities Get CRUD Endpoints

At application startup, a two-phase process determines which entities get dynamic CRUD endpoints:

**Phase 1: EntityConfig bootstrapping** (`EntityConfigsBootstrapper.ProcessAsync()`)

The bootstrapper scans all loaded assemblies for types where `MappingHelper.IsEntity(t)` returns true (i.e., types inheriting from `Entity<T>`, `FullPowerEntity`, or other NHibernate-mapped entity base classes). For each discovered entity type:

- **New entity** (no DB record yet): Creates an `EntityConfig` record with `GenerateAppService = true` by DEFAULT, unless the entity class has `[Entity(GenerateApplicationService = DisableGenerateApplicationService)]` attribute.
[IH: IMPLEMENT CHANGES to ensure that by default CRUD end-points do not get generated unless explicitly requested:
1. If an entity does not have the [Entity(...)]` applied, set `GenerateAppService = false` ]
2. For a new entity where `[Entity(GenerateApplicationService = UseConfiguration)]` set  `GenerateAppService = false`
]

- **Existing entity** (DB record exists): Updates metadata (FriendlyName, TableName, etc.). Only changes `GenerateAppService` if the code attribute explicitly forces it (`AlwaysGenerateApplicationService` or `DisableGenerateApplicationService`). If `UseConfiguration` (default), the existing DB value is preserved.

**Source:** `shesha-core/src/Shesha.Framework/DynamicEntities/EntityConfigsBootstrapper.cs`

**Phase 2: Dynamic controller registration** (`DynamicEntityControllerFeatureProvider.PopulateFeature()`)

This runs during MVC startup. It:
1. First registers any manually-coded app services that implement `IEntityAppService<,>` (these take priority over dynamic ones)
2. Then loads **ALL** `EntityConfig` records from the database — **with no filter on `GenerateAppService`**
3. For each EntityConfig, resolves the .NET entity type by `FullClassName`
4. If the entity type exists AND no manually-coded app service was already registered for it, creates a `DynamicCrudAppService<TEntity, TDynamicDto, TCreateDynamicDto, TUpdateDynamicDto, TPrimaryKey>` and registers it as an MVC controller

**Critical:** The `GenerateAppService` flag is **NOT checked** during controller registration. Every entity with an `EntityConfig` record gets a dynamic CRUD endpoint, regardless of this flag. The flag is only used by the UI and some commented-out validation code.
[IH: IMPLEMENT CHANGES TO FILTER OUT ENTITIES WHERE:
-  `EntityConfig.GenerateAppService` = false, OR
-  `PermissionedObject.Access` == 1 (Disable), OR
-  `PermissionedObject` is missing for the entity
]

[IH: Additionally, create a database migration to sets `EntityConfig.GenerateAppService` = false for all entities where there is no `PermissionedObject`.
This is to correct the previous default behavior which generated dynamic CRUD endpoints by default for all entities even if there is no explicit configuration.
]

**Source:** `shesha-core/src/Shesha.Application/DynamicEntities/DynamicEntityControllerFeatureProvider.cs` (lines 48-81)

### Entity Types That Qualify

An entity type gets CRUD endpoints if ALL of these are true:
1. It inherits from `Entity<T>` (directly or via `FullPowerEntity`, `FullAuditedEntity`, etc.)
2. It has an `EntityConfig` record in the database (created automatically by the bootstrapper for any NHibernate-mapped entity)
3. The .NET type is loadable at runtime (exists in a loaded assembly)
4. It has an `Id` property (required by `DynamicAppServiceHelper.MakeApplicationServiceType()`)
5. No manually-coded app service implementing `IEntityAppService<TEntity, TId>` is already registered for it (manual services take priority)

### Entity Types That Do NOT Get Dynamic CRUD Endpoints

- Types with `[Entity(GenerateApplicationService = DisableGenerateApplicationService)]` — their `EntityConfig` still gets created but with `GenerateAppService = false`. However, as noted above, the controller registration ignores this flag. **In practice, these entities still get CRUD endpoints.** The attribute only prevents the bootstrapper from setting `GenerateAppService = true`.
- Types that don't have an `EntityConfig` record in the database at all (rare — the bootstrapper creates these automatically)
- Types that have a manually-coded `IEntityAppService<,>` implementation — these use the custom service instead of `DynamicCrudAppService`
- Types without an `Id` property
- Abstract types, non-public types, and types not mapped by NHibernate

### URL Route Pattern

**Template:** `api/dynamic/{moduleName}/{EntityTypeName}/Crud/{ActionName}`

| Component | Source |
|-----------|--------|
| `moduleName` | Resolved from the assembly's ABP module → Shesha Module record. Falls back to `app` if not found. |
| `EntityTypeName` | The short class name (e.g., `Person`, not `Shesha.Domain.Person`) |
| `ActionName` | `Get`, `GetAll`, `Create`, `Update` (no `Delete` — see below) |

**Controller naming:** `{EntityTypeName}Crud` by default, or custom name from `[Entity(ApplicationServiceName = "...")]`

**Source:** `shesha-core/src/Shesha.Application/DynamicEntities/DefaultEntityActionRouteProvider.cs`

### HTTP Methods and Actions Exposed

Each dynamic CRUD controller exposes these actions:

| Action | HTTP Method | Route Suffix | Entity Action Attribute |
|--------|-------------|-------------|------------------------|
| `Get` | GET | `/Crud/Get?id={id}` | `StandardEntityActions.Read` |
| `GetAll` | GET | `/Crud/GetAll` | `StandardEntityActions.List` |
| `Create` | POST | `/Crud/Create` | `StandardEntityActions.Create` |
| `Update` | PUT | `/Crud/Update` | `StandardEntityActions.Update` |
| `CreateGql` | POST | Hidden from Swagger (`[ApiExplorerSettings(IgnoreApi = true)]`) | — |
| `UpdateGql` | PUT | Hidden from Swagger (`[ApiExplorerSettings(IgnoreApi = true)]`) | — |

**Note:** `Delete` is inherited from ABP's `AbpCrudAppService` base class but may not be exposed in Swagger depending on configuration.

**Source:** `shesha-core/src/Shesha.Application/DynamicCrudAppService.cs`

### Manual App Service Priority

When an entity has BOTH a manually-coded app service and would qualify for a dynamic one:
1. `DynamicEntityControllerFeatureProvider` first scans all existing controllers for `IEntityAppService<,>` implementations (Phase 1, lines 35-43)
2. It records their controller names
3. In Phase 2, it skips any entity whose controller name already exists in `existingControllerNames` (line 66)

**Result:** Manually-coded app services always take priority. The dynamic one is simply not registered.

### Source Files

| Component | Path |
|-----------|------|
| DynamicCrudAppService | `shesha-core/src/Shesha.Application/DynamicCrudAppService.cs` |
| DynamicEntityControllerFeatureProvider | `shesha-core/src/Shesha.Application/DynamicEntities/DynamicEntityControllerFeatureProvider.cs` |
| DynamicAppServiceHelper | `shesha-core/src/Shesha.Application/DynamicEntities/DynamicAppServiceHelper.cs` |
| DynamicControllerNameConvention | `shesha-core/src/Shesha.Application/DynamicEntities/DynamicControllerNameConvention.cs` |
| DynamicControllerRouteConvention | `shesha-core/src/Shesha.Application/DynamicEntities/DynamicControllerRouteConvention .cs` |
| DefaultEntityActionRouteProvider | `shesha-core/src/Shesha.Application/DynamicEntities/DefaultEntityActionRouteProvider.cs` |
| MvcOptionsExtensions (registration) | `shesha-core/src/Shesha.Application/DynamicEntities/MvcOptionsExtensions.cs` |
| EntityConfigsBootstrapper | `shesha-core/src/Shesha.Framework/DynamicEntities/EntityConfigsBootstrapper.cs` |
| EntityConfig (domain entity) | `shesha-core/src/Shesha.Framework/Domain/EntityConfig.cs` |
| EntityAttribute | `shesha-core/src/Shesha.Framework/Domain/Attributes/EntityAttribute.cs` |
| EntityConfigurationStore | `shesha-core/src/Shesha.Framework/Configuration/Runtime/EntityConfigurationStore.cs` |

## PermissionedObject Type Mapping

| Endpoint Pattern | PermissionedObject Type | Object Name Format |
|-----------------|------------------------|--------------------|
| App service (service level) | `Shesha.WebApi` | `{Namespace}.{ClassName}` |
| App service (action level) | `Shesha.WebApi.Action` | `{Namespace}.{ClassName}@{MethodName}` |
| Dynamic CRUD (entity level) | `Shesha.Entity` | `{EntityNamespace}.{EntityName}` |
| Dynamic CRUD (action level) | `Shesha.Entity.Action` | `{EntityNamespace}.{EntityName}@{CrudAction}` |
| CRUD app service (service level) | `Shesha.WebCrudApi` | `{EntityNamespace}.{EntityName}` |
| CRUD app service (action level) | `Shesha.WebCrudApi.Action` | `{EntityNamespace}.{EntityName}@{CrudAction}` |
| Form configuration | `Shesha.Form` | `{FormModule}/{FormName}` |

## EntitiesAppService Methods and Permission Coverage

| Method | Calls CheckPermissionAsync? | Authorization |
|--------|---------------------------|---------------|
| `GetAsync` | YES (line 88) | Entity-level via ObjectPermissionChecker |
| `GetAllAsync` | YES (line 139) | Entity-level via ObjectPermissionChecker |
| `ExportToExcelAsync` | **NO** | Service-level only (ApiAuthorizationHelper) |
| `SpecificationsAsync` | **NO** | Service-level only (ApiAuthorizationHelper) |
| `ReorderAsync` | **NO** | Service-level only (ApiAuthorizationHelper) |

## How Code Attributes and DB Configuration Interact

Understanding this is CRITICAL for producing an accurate catalog.

### Bootstrap vs Runtime — Two Different Phases

**Phase 1: Bootstrap (application startup)**
`ApiPermissionedObjectProvider` scans all controllers and app services. For each class and method:
- Reads `[SheshaAuthorize]`, `[AbpAuthorize]`, `[AbpMvcAuthorize]`, `[AllowAnonymous]` attributes
- Creates a `PermissionedObjectDto` with the attribute's access level and permissions
- Sets `hardcoded = true` if the attribute is `[AbpAuthorize]`, `[AbpMvcAuthorize]`, or `[AllowAnonymous]`
- Sets `hardcoded = false` (default) for `[SheshaAuthorize]` unless overridden

`PermissionedObjectsBootstrapper` then:
- **New objects** (no DB record yet): Inserts the bootstrapped DTO as-is
- **Existing objects where `hardcoded` changed or `hardcoded == true`**: Overwrites DB `access` and `permissions` with code values (line 79-83). This means hardcoded attributes RESET any admin changes on every restart.
- **Existing objects where `hardcoded == false` and hasn't changed**: Does NOT overwrite. Admin changes to DB survive restarts.
- **No attribute at all**: Creates a record with `Access = Inherited`

**Phase 2: Runtime (per-request authorization)**
The authorization filter chain runs. Critically:
- `[AllowAnonymous]` / `[AbpAllowAnonymous]` — checked by `SheshaAuthorizationFilter` (line 44) and `ApiAuthorizationHelper` (lines 47-49) BEFORE any DB lookup. **Bypasses everything.**
- `[SheshaAuthorize]` / `[AbpAuthorize]` — **NOT checked at runtime.** These attributes are only read at bootstrap time. At runtime, only the DB value (via `ObjectPermissionChecker`) matters.
- No attribute — same as above, DB value is what counts.

### The Definitive Precedence Model

Use this decision tree for EVERY endpoint to determine the actual effective access level:

```
STEP 1: Check for runtime anonymous bypass
─────────────────────────────────────────
Does the endpoint have [AllowAnonymous] or [AbpAllowAnonymous] on the
method or class? (Check both ASP.NET and ABP variants.)
Also: does the endpoint metadata include IAllowAnonymous?

  YES → STOP. Effective access = Anonymous (code override).
        The DB PermissionedObject value is IRRELEVANT.
        Even if an admin set Disable or RequiresPermissions in the DB,
        this endpoint is still anonymous. This is a silent override.
        Catalog classification: "Anonymous (code override)"

  NO  → Go to Step 2.

STEP 2: Determine which authorization helper handles this endpoint
──────────────────────────────────────────────────────────────────
Two helpers are registered. BOTH run for every request. The first
one that doesn't skip handles authorization.

  ApiAuthorizationHelper checks FIRST:
    ├─ [AllowAnonymous] or [AbpAllowAnonymous]? → SKIP
    ├─ Not ApplicationService or ControllerBase? → SKIP
    ├─ Method name (minus "Async") in CrudMethods dict? → SKIP
    └─ Otherwise → HANDLES IT
        - objectType = "Shesha.WebApi.Action"
        - objectName = "{classFullName}@{methodName}"
        - replaceInherited = DefaultEndpointAccess (from SecuritySettings)
        → Go to Step 3 with these values.

  EntityCrudAuthorizationHelper checks SECOND:
    ├─ Method name NOT in CrudMethods dict? → SKIP
    ├─ Not AbpCrudAppService<> subclass? → SKIP
    ├─ No entity type resolved? → SKIP
    └─ Otherwise → HANDLES IT
        - objectType = "Shesha.Entity.Action"
        - objectName = "{entityFullName}@{mappedCrudMethod}"
        - replaceInherited = NULL (no DefaultEndpointAccess fallback)
        → Go to Step 3 with these values.

  CRITICAL: BOTH helpers can SKIP the same endpoint!
  ─────────────────────────────────────────────────
  This happens when a method has a CRUD name (GetAll, Get, Create, etc.)
  but the service is NOT an AbpCrudAppService<> subclass.

  Example: FormConfigurationAppService extends SheshaCrudServiceBase
  (which extends AbpCrudAppService), so it IS handled. But a hypothetical
  non-CRUD service with a GetAll() method would be skipped by BOTH.

  When BOTH skip: standard ABP authorization applies (requires authentication
  by default). DefaultEndpointAccess does NOT apply.
  Catalog classification: "Authenticated (CRUD method bypass)"
  [IH: IMPLEMENT Change so that this scenario cannot occur and DefaultEndpointAccess applies]

  IMPORTANT for CRUD service identification:
  The AbpCrudAppService<> check includes ALL subclasses in the inheritance
  chain. Common Shesha hierarchy:
    DynamicCrudAppService → SheshaCrudServiceBase → AbpAsyncCrudAppService
    → AbpCrudAppService
  Services extending SheshaCrudServiceBase ARE AbpCrudAppService subclasses
  and ARE handled by EntityCrudAuthorizationHelper.

  If NEITHER helper handles it and it's not an AppService/Controller:
  → Not covered by Shesha authorization helpers.
    Falls through to standard ASP.NET/ABP authorization.
    Catalog classification: "Unknown (not a Shesha endpoint)"

STEP 3: Look up the PermissionedObject from DB
───────────────────────────────────────────────
Query: objectName + objectType → PermissionedObjectManager.GetOrDefaultAsync()

  Record exists in DB?
    YES → dto = DB record mapped to DTO
    NO  → dto = auto-generated default with Access = Inherited,
           Parent = "{classFullName}" (derived by splitting on "@")

  Then resolve actualAccess:
    - If dto.Access != Inherited → actualAccess = dto.Access
    - If dto.Access == Inherited AND parent exists with non-Inherited access
      → actualAccess = parent's actualAccess (recursive)
    - If dto.Access == Inherited AND no parent resolves
      → actualAccess = Inherited (stays as value 2)

STEP 4: Apply the replaceInherited fallback
───────────────────────────────────────────
In ObjectPermissionChecker.AuthorizeAsync() (lines 61-63):

  IF replaceInherited != null AND actualAccess == Inherited:
      actualAccess = replaceInherited value
      (For ApiAuthorizationHelper, this is DefaultEndpointAccess)

  IF replaceInherited == null AND actualAccess == Inherited:
      actualAccess stays as Inherited (value 2)
      (For EntityCrudAuthorizationHelper, this is ALWAYS the case)

STEP 5: Enforce the resolved actualAccess
──────────────────────────────────────────
ObjectPermissionChecker lines 65-94 execute these checks IN ORDER.
The first matching condition determines the outcome:

  5a. permission == null                                    → ALLOW
  5b. actualAccess == AllowAnonymous (5)                    → ALLOW
  5c. actualAccess == AnyAuthenticated (3) AND logged in    → ALLOW
  5d. NOT logged in (regardless of actualAccess)            → DENY (401)
  5e. actualAccess == Disable (1)                           → DENY (404)
  5f. actualAccess == RequiresPermissions (4), empty perms  → DENY (403)
  5g. actualAccess == RequiresPermissions (4), has perms    → Check via ShaPermissionChecker
                                                              (OR logic: any one permission grants)
  5h. actualAccess == Inherited (2), user is logged in      → ALLOW
      (see explanation below)

  IMPORTANT — Step 5h explained:
  When actualAccess is Inherited (2) and the user IS logged in, the code
  falls through ALL the checks above without matching any deny condition:
    - 5a: permission is not null (a default DTO was created) → no match
    - 5b: Inherited != AllowAnonymous → no match
    - 5c: Inherited != AnyAuthenticated → no match
    - 5d: user IS logged in → no match
    - 5e: Inherited != Disable → no match
    - 5f: Inherited != RequiresPermissions → no match
    - 5g: Inherited != RequiresPermissions → no match
    → Falls through to line 94: _permissionChecker.AuthorizeAsync(false, [])
    → Empty permissions array = ABP passes with no checks → ALLOWED

  This means: Inherited (2) with no parent resolution and no replaceInherited
  behaves IDENTICALLY to AnyAuthenticated (3) at runtime.

  THIS IS THE KEY INSIGHT FOR ENTITY CRUD ENDPOINTS:
  Since EntityCrudAuthorizationHelper NEVER passes replaceInherited,
  and most entities have no DB record (so they get default Access=Inherited),
  the effective behavior for nearly all entity CRUD endpoints is:
    - Anonymous users → DENIED (401)
    - Any authenticated user → ALLOWED (regardless of role/permissions)
  This is effectively "AnyAuthenticated" but arrived at accidentally,
  not through intentional configuration.

STEP 6: Additional checks for EntitiesAppService methods
────────────────────────────────────────────────────────
EntitiesAppService is a special case — it's a non-CRUD service that delegates
to entity CRUD services. Its methods are checked by ApiAuthorizationHelper
(service-level), but some also call CheckPermissionAsync() internally for
entity-level checks:

  GetAsync:          ApiAuthorizationHelper (service) + CheckPermissionAsync (entity)
  GetAllAsync:       ApiAuthorizationHelper (service) + CheckPermissionAsync (entity)
  ExportToExcelAsync: ApiAuthorizationHelper (service) ONLY — no entity check
  SpecificationsAsync: ApiAuthorizationHelper (service) ONLY — no entity check
  ReorderAsync:      ApiAuthorizationHelper (service) ONLY — no entity check
```

### What the `hardcoded` Flag Means for the Catalog

When you see `hardcoded = true` on a PermissionedObject:
- The access level was set from a code attribute (`[AbpAuthorize]`, `[AllowAnonymous]`, etc.)
- On every application restart, the bootstrapper will RESET the DB value to match the code
- Admin changes to this object will be LOST on restart
- Catalog should note: "Enforcement: Code (hardcoded, resets on restart)"

When you see `hardcoded = false`:
- The access level may have been initially set from `[SheshaAuthorize]` or defaulted to `Inherited`
- Admin changes to this object will PERSIST across restarts
- Catalog should note: "Enforcement: DB config (persists across restarts)"

### Practical Classification Rules for the Catalog

Given all the above, use these rules to classify each endpoint:

| Condition | Catalog Auth Level | Catalog Enforcement |
|-----------|-------------------|---------------------|
| `[AllowAnonymous]` on class or method | Anonymous (code override) | Code attribute — bypasses DB |
| DB `actualAccess` = 5 AND `hardcoded = true` | Anonymous (DB, hardcoded) | Code attribute → DB bootstrap (resets on restart) |
| DB `actualAccess` = 5 AND `hardcoded = false` | Anonymous (DB, configurable) | DB PermissionedObject (admin changes persist) |
| No DB record + DefaultEndpointAccess = 5 + non-CRUD | Anonymous (default fallback) | DefaultEndpointAccess setting |
| No DB record + entity CRUD | Authenticated (accidental — effectively AnyAuthenticated) | No DB record → default Inherited → no replaceInherited → falls through to auth check (Step 5h). Anonymous=denied, any logged-in user=allowed. |
| DB `actualAccess` = 3 AND `hardcoded = true` | Authenticated (DB, hardcoded) | Code attribute → DB bootstrap (resets on restart) |
| DB `actualAccess` = 3 AND `hardcoded = false` | Authenticated (DB, configurable) | DB PermissionedObject (admin changes persist) |
| DB `actualAccess` = 2 (Inherited) + parent resolves to concrete access | Authenticated (inherited, resolved) | Inheritance from parent |
| DB `actualAccess` = 2 (Inherited) + non-CRUD method name + no parent resolves | {Resolved via DefaultEndpointAccess} | DefaultEndpointAccess fallback via ApiAuthorizationHelper |
| DB `actualAccess` = 2 (Inherited) + CRUD method name + AbpCrudAppService subclass + no parent resolves | Authenticated (accidental — effectively AnyAuthenticated) | EntityCrudAuthorizationHelper with replaceInherited=NULL → falls through to Step 5h. Anonymous=denied, any logged-in user=allowed. |
| CRUD method name + NOT AbpCrudAppService subclass | Authenticated (CRUD method bypass) | Both helpers skip: ApiAuthorizationHelper skips CRUD names, EntityCrudAuthorizationHelper skips non-CRUD services. Standard ABP auth applies (requires authentication). |
| DB `actualAccess` = 4, non-empty permissions | Permissioned (DB) | DB PermissionedObject + ShaPermissionChecker |
| DB `actualAccess` = 4, empty permissions | Permissioned (DB, empty = deny-all) | DB PermissionedObject (blocks everyone) |
| DB `actualAccess` = 1 (Disable) | Disabled (DB) | DB PermissionedObject (returns 404) |
| No code attribute, no DB record, no helper applies | Unknown | No enforcement detected |

## Swagger URL → Source File Mapping

| Swagger Tag/Path Pattern | Source Location |
|-------------------------|----------------|
| `/api/TokenAuth/*` | `Shesha.Application/Authorization/TokenAuthController.cs` |
| `/api/Framework/*` | `Shesha.Framework/Controllers/FrameworkController.cs` |
| `/api/StoredFile/*` | `Shesha.Application/StoredFiles/StoredFileController.cs` |
| `/api/AntiForgery/*` | Via ABP framework |
| `/api/services/app/{Service}/*` | `Shesha.Application/{Module}/{Service}AppService.cs` |
| `/api/services/Shesha/{Service}/*` | Various — search for class name |
| `/api/services/Scheduler/*` | `Shesha.Scheduler/Services/` |
| `/api/dynamic/{module}/{Entity}/Crud/*` | Auto-generated via `DynamicCrudAppService<>` |
| `/api/services/Shesha/Entities/*` | `Shesha.Application/DynamicEntities/EntitiesAppService.cs` |
| `/api/ModelConfigurations*` | `Shesha.Application/DynamicEntities/ModelConfigurationsAppService.cs` |
| `/api/services/Shesha/FormConfiguration/*` | `Shesha.Web.FormsDesigner/Services/FormConfigurationAppService.cs` |

## Specification Types

| Attribute | Effect |
|-----------|--------|
| `[GlobalSpecification]` on spec class | Automatically applied to ALL queries for that entity type |
| `[ApplySpecifications(typeof(...))]` on method | Forces specific specifications on that endpoint |
| `[DisableSpecifications]` on method | Bypasses all specifications (global and local) |
| `specifications` parameter in request DTO | Client selects which non-global specs to apply |

## Source Files

| Component | Path |
|-----------|------|
| SheshaAuthorizationFilter | `shesha-core/src/Shesha.Application/Authorization/SheshaAuthorizationFilter.cs` |
| ApiAuthorizationHelper | `shesha-core/src/Shesha.Application/Authorization/ApiAuthorizationHelper.cs` |
| EntityCrudAuthorizationHelper | `shesha-core/src/Shesha.Application/Authorization/EntityCrudAuthorizationHelper.cs` |
| ObjectPermissionChecker | `shesha-core/src/Shesha.Framework/Authorization/ObjectPermissionChecker.cs` |
| PermissionedObjectManager | `shesha-core/src/Shesha.Framework/Permissions/PermissionedObjectManager.cs` |
| ShaPermissionChecker | `shesha-core/src/Shesha.Framework/Authorization/ShaPermissionChecker.cs` |
| PermissionedObjectsBootstrapper | `shesha-core/src/Shesha.Framework/Permissions/PermissionedObjectsBootstrapper.cs` |
| ApiPermissionedObjectProvider | `shesha-core/src/Shesha.Application/Permissions/ApiPermissionedObjectProvider.cs` |
| EntityPermissionedObjectProvider | `shesha-core/src/Shesha.Framework/Permissions/EntityPermissionedObjectProvider.cs` |
| EntitiesAppService | `shesha-core/src/Shesha.Application/DynamicEntities/EntitiesAppService.cs` |
| SpecificationsFinder | `shesha-core/src/Shesha.Framework/Specifications/SpecificationsFinder.cs` |
| SpecificationManager | `shesha-core/src/Shesha.Framework/Specifications/SpecificationManager.cs` |
| SpecificationsActionFilter | `shesha-core/src/Shesha.Framework/Specifications/SpecificationsActionFilter.cs` |
| SwaggerDocumentFilter | `shesha-core/src/Shesha.Framework/Swagger/SwaggerDocumentFilter.cs` |
| SecuritySettings | `shesha-core/src/Shesha.Framework/Configuration/Security/SecuritySettings.cs` |
| RefListPermissionedAccess | `shesha-core/src/Shesha.Framework/Domain/Enums/RefListPermissionedAccess.cs` |
| ShaPermissionedObjectsTypes | `shesha-core/src/Shesha.Framework/Permissions/ShaPermissionedObjectsTypes.cs` |
