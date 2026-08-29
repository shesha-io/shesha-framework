# Issue #4619 — permission management APIs must be admin-only

Branch: `fix/4619-permission-services-admin-only` (based on `main`)

## Why this is back

The original fix (PR #4644) went into `releases/0.43`. On `main` the class-level attribute was
reset to `AnyAuthenticated` by a later refactor, which is what @yuliaGradova hit:
`GetAll` returns 200 for a user without any permissions.

## What changed

| File | Change |
|---|---|
| `Shesha.Application/Permissions/PermissionedObjectAppService.cs` | `[SheshaAuthorize(RequiresPermissions, "pages:maintenance")]` restored |
| `Shesha.Application/Permissions/PermissionAppService.cs` | class-level access changed from `AnyAuthenticated` to `RequiresPermissions, "app:Configurator"`; `IsPermissionGranted` keeps its own `AnyAuthenticated` attribute |
| `Shesha.Framework/Migrations/M20260827121299.cs` | new migration — updates the two `frwk.permissioned_objects` rows that still hold `AnyAuthenticated` to the new access level |
| `Shesha.Tests/Security/PermissionServicesAuth_Tests.cs` | regression tests so the attributes cannot be silently dropped again |

The migration is needed because the database configuration wins over the code attribute. Without it
the existing row (`AnyAuthenticated`) keeps overriding the new code default, and nothing changes on
an existing environment. Rows an administrator customized to something other than `AnyAuthenticated`
are left alone.

## Setup

- One user in the **Application Administrator** role (has `pages:maintenance` and `app:Configurator`).
- One ordinary user with **no** permissions (e.g. `yulianew`).
- Deploy the branch so the migration runs, then confirm in **Configuration → Permissioned Objects**:
  - `PermissionedObject` service → Access = **Requires permissions**, permission `pages:maintenance`
  - `Permission` service → Access = **Requires permissions**, permission `app:Configurator`

## Test 1 — ordinary user is refused (the reported bug)

Log in to Swagger as the ordinary user and call:

- [ ] `GET /api/services/app/Permission/GetAll` → **403** (was 200)
- [ ] `GET /api/services/app/Permission/GetAllTree` → **403**
- [ ] `GET /api/services/app/Permission/Autocomplete` → **403**
- [ ] `GET /api/services/app/PermissionedObject/GetAll` → **403**
- [ ] `GET /api/services/app/PermissionedObject/GetAllFlat?type=Shesha.WebApi` → **403**
- [ ] `GET /api/services/app/PermissionedObject/GetApiPermissions` → **403**
- [ ] `POST /api/services/app/PermissionedObject/SetApiPermissions` → **403**
- [ ] `POST /api/services/app/Permission/Create` → **403**
- [ ] `DELETE /api/services/app/Permission/Delete` → **403**

**Pass:** every call is refused. **Fail:** any 200.

## Test 2 — administrator is unaffected

As the administrator:

- [ ] The same endpoints all return 200.
- [ ] **Configuration → Permissioned Objects** opens and lists services; changing an Access value saves.
- [ ] **Configuration → Permissions** (permission tree) opens, and a permission can be created, renamed, re-parented and deleted.

## Test 3 — permission-driven, not role-driven

- [ ] Grant `pages:maintenance` to a custom role, add the ordinary user to it.
- [ ] `PermissionedObject/GetAll` now returns 200 for that user; `Permission/GetAll` still 403.
- [ ] Grant `app:Configurator` as well → `Permission/GetAll` returns 200.
- [ ] Remove both grants → back to 403.

## Test 4 — regression checks

As the ordinary user (no permissions):

- [ ] Log in, load the app — no error toasts, no endless spinner.
- [ ] Open normal pages/forms — they render, data loads.
- [ ] Anything driven by "is this permission granted" still works
      (`Permission/IsPermissionGranted` must keep returning 200 — it is the one endpoint left open
      to authenticated users).
- [ ] Anonymous forms and the login page still work when signed out.

As the administrator:

- [ ] Form designer opens and saves.
- [ ] A permission picker (`permissionAutocomplete`) in the designer still loads its list.

> Note: `permissionAutocomplete` and the permissions tree now require `app:Configurator`. If a
> customer form uses the permission picker for ordinary users, that picker will come back empty —
> report it and we will add a narrower read endpoint instead.
