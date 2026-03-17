# Endpoint Permissions API Reference

> Reference for AI agents to verify and update authorization settings on Shesha endpoints.
>
> Shesha has two distinct types of API endpoints, each managed through different mechanisms:
> - **Part A — Entity CRUD APIs**: Auto-generated endpoints for domain entities, configured via the Entity Configurations UI and the `ModelConfigurations` API.
> - **Part B — Custom Application APIs**: Hand-coded application service endpoints, configured via the `PermissionedObject` API.

## Authentication Prerequisite

All API calls require an authenticated session. Obtain a bearer token first:

```
POST /api/TokenAuth/Authenticate
Content-Type: application/json

{
  "userNameOrEmailAddress": "<username>",
  "password": "<password>"
}
```

Use the returned `accessToken` as `Authorization: Bearer <accessToken>` on all subsequent requests.

---

## Shared Reference: Access Levels

Both Part A and Part B use the same access level enum.

Enum: `RefListPermissionedAccess` (reference list: `Shesha.Framework.PermissionedAccess`)

| Value | Name                 | Meaning |
|-------|---------------------|---------|
| `1`   | `Disable`            | Endpoint is disabled entirely (returns 404/forbidden) |
| `2`   | `Inherited`          | Inherits access level from parent object |
| `3`   | `AnyAuthenticated`   | Any logged-in user can access |
| `4`   | `RequiresPermissions`| Only users with specific named permissions can access |
| `5`   | `AllowAnonymous`     | No authentication required (publicly accessible) |

**Important:** When `access = 4`, the `permissions` array must contain at least one permission name. When `access` is any other value, the `permissions` array is ignored.

---

## Shared Reference: Permissions Tree

Both Part A and Part B use the same permission definitions. To get the full tree of available permissions:

```
GET /api/services/app/Permission/GetAllTree
```

**Response:** `{ "result": [ PermissionDto, ... ] }` — hierarchical tree via `child` field.

**PermissionDto fields:**
| Field           | Type             | Description |
|----------------|------------------|-------------|
| `name`          | string           | Permission name (unique identifier) |
| `displayName`   | string           | Human-readable display name |
| `description`   | string           | Description |
| `parentName`    | string           | Parent permission name |
| `moduleId`      | GUID             | Module ID |
| `module`        | EntityReferenceDto| Module reference |
| `isDbPermission`| boolean          | Whether defined in DB vs code |
| `child`         | PermissionDto[]  | Child permissions (tree structure) |

---
---

# Part A — Entity CRUD APIs

> Auto-generated CRUD endpoints for domain entities (Get, Create, Update, Delete). Managed via the **Entity Configurations** UI at `/settings/entity-configs/configurator` and the `ModelConfigurations` REST API.

## A1. List All Entity Configurations

Returns all configured entities with metadata (class name, module, version status, etc.).

```
GET /api/services/app/EntityConfig/GetMainDataList?maxResultCount=10000&sorting=className
```

**Query Parameters:**
| Parameter        | Type    | Description |
|-----------------|---------|-------------|
| `maxResultCount` | integer | Max items to return (`-1` for unlimited, default `10`) |
| `skipCount`      | integer | Pagination offset |
| `sorting`        | string  | Sort field (e.g., `className`) |
| `filter`         | string  | JsonLogic filter expression |
| `quickSearch`    | string  | Free-text search |

**Response:** `{ "result": { "totalCount": N, "items": [ EntityConfigDto, ... ] } }`

**Key EntityConfigDto fields:**
| Field               | Type   | Description |
|--------------------|--------|-------------|
| `id`                | GUID   | Entity config ID (used to fetch model configuration) |
| `className`         | string | Short class name (e.g., `Account`) |
| `namespace`         | string | Full namespace (e.g., `Shesha.Domain`) |
| `fullClassName`     | string | Computed: `{namespace}.{className}` |
| `friendlyName`      | string | Human-readable name |
| `generateAppService`| boolean| Whether CRUD APIs are generated |
| `source`            | enum   | `ApplicationCode` or `UserDefined` |
| `entityConfigType`  | enum   | Entity config type |
| `module`            | string | Module name |
| `moduleId`          | GUID   | Module ID |
| `versionStatus`     | enum   | Configuration item version status |
| `suppress`          | boolean| Whether the entity is suppressed |

## A2. Get Model Configuration by ID

Returns the full model configuration including CRUD API settings and per-action permissions.

```
GET /api/ModelConfigurations/{id}
```

**Response:** `{ "result": ModelConfigurationDto }`

## A3. Get Model Configuration by Name

```
GET /api/ModelConfigurations?name=<className>&namespace=<namespace>
```

**Example:** `GET /api/ModelConfigurations?name=Account&namespace=Shesha.Domain`

## A4. Update Model Configuration (Save)

Saves the entire model configuration including CRUD API generation flag and per-action permission rules. This is the single endpoint that the Entity Configurations UI calls when clicking "Save".

```
PUT /api/ModelConfigurations
Content-Type: application/json

{
  "id": "<guid>",
  "className": "Account",
  "namespace": "Shesha.Domain",
  "generateAppService": true,
  "moduleId": "<guid>",
  "module": "Shesha",
  "name": "Shesha.Domain.Account",
  "label": "Account",
  "description": "",
  "suppress": false,
  "permission": { ... },
  "permissionGet": { ... },
  "permissionCreate": { ... },
  "permissionUpdate": { ... },
  "permissionDelete": { ... },
  "properties": [ ... ],
  "viewConfigurations": [ ... ]
}
```

**Key ModelConfigurationDto fields:**

| Field                    | Type                  | Description |
|-------------------------|-----------------------|-------------|
| `id`                     | GUID                  | Required. The model configuration ID |
| `className`              | string                | Entity class name |
| `namespace`              | string                | Entity namespace |
| `generateAppService`     | boolean               | **Controls CRUD API generation** |
| `allowConfigureAppService`| boolean              | Whether app service is configurable |
| `permission`             | PermissionedObjectDto | **Entity-level permission** (overall) |
| `permissionGet`          | PermissionedObjectDto | **GET action permission** |
| `permissionCreate`       | PermissionedObjectDto | **CREATE action permission** |
| `permissionUpdate`       | PermissionedObjectDto | **UPDATE action permission** |
| `permissionDelete`       | PermissionedObjectDto | **DELETE action permission** |
| `moduleId`               | GUID                  | Module ID |
| `module`                 | string                | Module name |
| `name`                   | string                | Configuration item name |
| `label`                  | string                | Display label |
| `description`            | string                | Description |
| `suppress`               | boolean               | Suppress this entity |
| `properties`             | ModelPropertyDto[]    | Entity property definitions |
| `viewConfigurations`     | EntityViewConfigurationDto[] | View configs |
| `versionNo`              | integer               | Version number |
| `versionStatus`          | enum                  | Version status |

Each permission field (`permission`, `permissionGet`, etc.) is a `PermissionedObjectDto` (see [PermissionedObjectDto fields](#permissionedobjectdto-fields) in Part B). The key fields for authorization are:
- `access` — integer enum from [Access Levels](#shared-reference-access-levels)
- `permissions` — string array of required permission names (when `access = 4`)

## A5. Create Model Configuration

```
POST /api/ModelConfigurations
Content-Type: application/json

{ /* ModelConfigurationDto — same shape as PUT */ }
```

## A6. Sync Client API

Synchronizes client-side entity API definitions with the server. Called automatically by the UI when an entity is selected.

```
POST /api/services/app/EntityConfig/SyncClientApi
Content-Type: application/json

{ /* SyncAllRequest */ }
```

## A7. AI Agent Workflow — Read Entity CRUD API Settings

To determine the current CRUD API configuration and authorization rules for any entity:

1. **List all entities** using `GET /api/services/app/EntityConfig/GetMainDataList?maxResultCount=10000&sorting=className`.
2. **Find the target entity** by matching `className` and `namespace` (or `fullClassName`).
3. **Fetch the full configuration** using `GET /api/ModelConfigurations/{id}` with the entity's `id`.
4. **Check CRUD generation** — `generateAppService` indicates whether dynamic CRUD endpoints exist.
5. **Check per-action permissions** — inspect `permissionGet`, `permissionCreate`, `permissionUpdate`, `permissionDelete`:
   - `access` — the configured access level (see [Access Levels](#shared-reference-access-levels))
   - `actualAccess` — the resolved access after inheritance
   - `permissions` / `actualPermissions` — required permission names

## A8. AI Agent Workflow — Update Entity CRUD API Settings

To change CRUD API generation or authorization rules for an entity:

1. **Fetch the current configuration** using `GET /api/ModelConfigurations/{id}`.
2. **Modify the desired fields** in the returned `ModelConfigurationDto`:
   - Set `generateAppService` to `true`/`false` to enable/disable CRUD API generation.
   - Set `permissionGet.access`, `permissionCreate.access`, etc. to the desired access level.
   - When `access = 4` (RequiresPermissions), populate the `permissions` array with permission names.
3. **Save** using `PUT /api/ModelConfigurations` with the full modified DTO.
4. **Re-fetch and verify** the configuration was persisted correctly.

### Example: Set "Requires permissions" on GET for Account entity

```bash
# 1. Get entity list and find Account's ID
GET /api/services/app/EntityConfig/GetMainDataList?maxResultCount=10000&sorting=className

# 2. Get full config (assume ID = 81203cb5-146a-405d-a518-bcc5e562e7cf)
GET /api/ModelConfigurations/81203cb5-146a-405d-a518-bcc5e562e7cf

# 3. Modify permissionGet in the response and PUT back:
PUT /api/ModelConfigurations
{
  ... (all existing fields),
  "permissionGet": {
    ... (existing fields),
    "access": 4,
    "permissions": ["my-app:read-accounts"]
  }
}
```

---
---

# Part B — Custom Application APIs

> Hand-coded application service endpoints (e.g., `TokenAuthAppService`, `EntitiesAppService`). Managed via the `PermissionedObject` API, which controls access at both the service level and individual action level.

## B1. Read / Verify Permissions

### B1.1 Get All Endpoints as a Tree

Returns the full hierarchy of permissioned objects filtered by type.

```
GET /api/services/app/PermissionedObject/GetAllTree?type=Shesha.WebApi&showHidden=false
```

**Query Parameters:**
| Parameter    | Type    | Description |
|-------------|---------|-------------|
| `type`       | string  | Object type filter (see [Object Types](#b3-object-types)) |
| `showHidden` | boolean | Include hidden objects (default `false`) |

**Response:** `{ "result": [ PermissionedObjectDto, ... ] }` — nested tree via `children`.

### B1.2 Get All Endpoints as a Flat List

```
GET /api/services/app/PermissionedObject/GetAllFlat?type=Shesha.WebApi&showNested=true&showHidden=false
```

**Query Parameters:**
| Parameter     | Type    | Description |
|--------------|---------|-------------|
| `type`        | string  | Object type filter |
| `showNested`  | boolean | Include nested/child objects (default `true`) |
| `showHidden`  | boolean | Include hidden objects (default `false`) |

### B1.3 Get a Single Object by ID

```
GET /api/services/app/PermissionedObject/Get?Id=<guid>
```

### B1.4 Get a Single Object by Name

```
GET /api/services/app/PermissionedObject/GetByObjectName?objectName=<name>&type=<type>
```

The `objectName` typically follows the format `ServiceName` for a service or `ServiceName@ActionName` for an action.

### B1.5 Get API Permissions by Service + Action

```
GET /api/services/app/PermissionedObject/GetApiPermissions?serviceName=<service>&actionName=<action>
```

Resolves the object name internally as `{serviceName}@{actionName}` with type `Shesha.WebApi.Action`, or `{serviceName}` with type `Shesha.WebApi` if `actionName` is empty.

## B2. Update / Modify Permissions

### B2.1 Update a Permissioned Object (General)

Full update of an existing permissioned object by ID. Use this when you need to update access level, description, category, or permissions together.

```
PUT /api/services/app/PermissionedObject/Update
Content-Type: application/json

{
  "id": "<guid>",
  "object": "Shesha.EntitiesAppService",
  "access": 4,
  "permissions": ["permission.name.one", "permission.name.two"],
  "description": "Optional description",
  "category": "Optional category",
  "type": "Shesha.WebApi",
  "hidden": false
}
```

### PermissionedObjectDto fields

| Field                | Type          | Description |
|---------------------|---------------|-------------|
| `id`                 | GUID          | Required. The object's unique identifier |
| `object`             | string        | The fully qualified object name |
| `access`             | integer (enum)| Access level — see [Access Levels](#shared-reference-access-levels) |
| `actualAccess`       | integer (enum)| Resolved access level after inheritance |
| `permissions`        | string[]      | Permission names required when `access = 4` |
| `actualPermissions`  | string[]      | Resolved permissions including inherited |
| `inheritedPermissions`| string[]     | Permissions inherited from parent |
| `inheritedAccess`    | integer (enum)| Access level inherited from parent |
| `description`        | string        | Human-readable description |
| `category`           | string        | Grouping category |
| `type`               | string        | Object type — see [Object Types](#b3-object-types) |
| `hidden`             | boolean       | Whether the object is hidden in the tree UI |
| `parent`             | string        | Parent object name (for inheritance) |
| `children`           | PermissionedObjectDto[] | Child objects (tree structure) |
| `module`             | string        | Module name |
| `moduleId`           | GUID          | Module ID |
| `hardcoded`          | boolean       | Whether the object was registered via code attributes |

### B2.2 Set Permissions by Object Name

Targeted update of just the access level and permissions list for a named object.

```
POST /api/services/app/PermissionedObject/SetPermissions
Content-Type: application/json

{
  "objectName": "Shesha.EntitiesAppService@GetAll",
  "access": 3,
  "permissions": []
}
```

| Parameter     | Type          | Description |
|--------------|---------------|-------------|
| `objectName`  | string        | The full object name |
| `access`      | integer (enum)| Access level |
| `permissions`  | string[]     | Required permission names (only used when `access = 4`) |

### B2.3 Set API Permissions by Service + Action

Same as B2.2 but addressed by service and action name separately.

```
POST /api/services/app/PermissionedObject/SetApiPermissions
Content-Type: application/json

{
  "serviceName": "Shesha.EntitiesAppService",
  "actionName": "GetAll",
  "access": 3,
  "permissions": []
}
```

## B3. Object Types

Constant values from `ShaPermissionedObjectsTypes`:

| Constant              | Value                      | Description |
|----------------------|----------------------------|-------------|
| `WebApi`              | `Shesha.WebApi`            | Application service (service-level) |
| `WebApiAction`        | `Shesha.WebApi.Action`     | Individual app service action/method |
| `WebCrudApi`          | `Shesha.WebCrudApi`        | Dynamic CRUD API (entity-level) |
| `WebCrudApiAction`    | `Shesha.WebCrudApi.Action` | Individual CRUD action (Get, Create, Update, Delete) |
| `Entity`              | `Shesha.Entity`            | Entity-level permission |
| `EntityAction`        | `Shesha.Entity.Action`     | Entity action permission |
| `Form`                | `Shesha.Form`              | Form configuration permission |

## B4. Object Naming Conventions

- **Service-level:** `Shesha.EntitiesAppService` (type: `Shesha.WebApi`)
- **Action-level:** `Shesha.EntitiesAppService@GetAll` (type: `Shesha.WebApi.Action`)
- **Dynamic CRUD service:** `Shesha.Core.Person` (type: `Shesha.WebCrudApi`)
- **Dynamic CRUD action:** `Shesha.Core.Person@Get` (type: `Shesha.WebCrudApi.Action`)

## B5. AI Agent Workflow — Verify Custom API Permissions

To verify the configured permissions for a specific endpoint:

1. **Fetch the tree** using `GET /api/services/app/PermissionedObject/GetAllTree?type=Shesha.WebApi` to get all app service endpoints, or use `type=Shesha.WebCrudApi` for dynamic CRUD endpoints.
2. **Locate the target object** by matching the `object` field to the expected service/action name.
3. **Check `access`** — compare the integer value against the [Access Levels](#shared-reference-access-levels) table.
4. **Check `actualAccess`** — this is the resolved access level after inheritance. If `access = 2` (Inherited), `actualAccess` shows what the parent provides.
5. **Check `permissions`** / `actualPermissions` — the list of required permission names. `actualPermissions` includes inherited permissions from parent objects.
6. **Verify `hardcoded`** — if `true`, the object was registered via code-level attributes (e.g., `[AbpAuthorize]`, `[SheshaAuthorize]`) and represents the source-code intent.

## B6. AI Agent Workflow — Update Custom API Permissions

To change the authorization settings for an endpoint:

1. **Fetch the current state** using `GET /api/services/app/PermissionedObject/Get?Id=<guid>` or `GetByObjectName`.
2. **Choose the update method:**
   - Use `SetPermissions` (B2.2) or `SetApiPermissions` (B2.3) for targeted access-level changes.
   - Use `Update` (B2.1) when also changing description, category, or other metadata.
3. **Send the update** with the desired `access` value and `permissions` list.
4. **Re-fetch and verify** the object to confirm the change was persisted and `actualAccess`/`actualPermissions` reflect the expected state.

---
---

# Source Code Locations

## Part A — Entity CRUD APIs

| Artifact | Path |
|----------|------|
| ModelConfigurations controller | `shesha-core/src/Shesha.Application/DynamicEntities/ModelConfigurationsAppService.cs` |
| ModelConfigurationDto | `shesha-core/src/Shesha.Framework/DynamicEntities/Dtos/ModelConfigurationDto.cs` |
| EntityConfig app service | `shesha-core/src/Shesha.Application/DynamicEntities/EntityConfigAppService.cs` |
| EntityConfigDto | `shesha-core/src/Shesha.Framework/DynamicEntities/Dtos/EntityConfigDto.cs` |
| Permission app service | `shesha-core/src/Shesha.Application/Permissions/PermissionAppService.cs` |

## Part B — Custom Application APIs

| Artifact | Path |
|----------|------|
| PermissionedObject app service | `shesha-core/src/Shesha.Application/Permissions/PermissionedObjectAppService.cs` |
| PermissionedObject manager interface | `shesha-core/src/Shesha.Framework/Permissions/IPermissionedObjectManager.cs` |
| PermissionedObject manager implementation | `shesha-core/src/Shesha.Framework/Permissions/PermissionedObjectManager.cs` |
| PermissionedObjectDto | `shesha-core/src/Shesha.Framework/Permissions/Dtos/PermissionedObjectDto.cs` |
| Object type constants | `shesha-core/src/Shesha.Framework/Permissions/ShaPermissionedObjectsTypes.cs` |
| Frontend API client | `shesha-reactjs/src/apis/permissionedObject.ts` |
| Frontend tree component | `shesha-reactjs/src/components/permissionedObjectsTree/index.tsx` |

## Shared

| Artifact | Path |
|----------|------|
| Access enum | `shesha-core/src/Shesha.Framework/Domain/Enums/RefListPermissionedAccess.cs` |
