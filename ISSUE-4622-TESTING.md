# Issue #4622 — entity CRUD endpoints must respect `DefaultEndpointAccess`

Branch: `fix/4622-entity-crud-default-endpoint-access` (based on `main`)

## Why this is back

The original fix (PR #4647) went into `releases/0.43`. On `main` the refactor of
`EntityCrudAuthorizationHelper` dropped the `ISecuritySettings` dependency again, so entity CRUD
endpoints stopped passing the setting to the permission checker. That is what @yuliaGradova hit:
with `DefaultEndpointAccess = Requires permissions`, endpoints whose access is `Inherited` were
still reachable by a user without any permissions.

Mechanically: `Inherited` reaches the permission checker unresolved, the required-permission list is
empty, and ABP treats an empty list as "granted".

## What changed

| File | Change |
|---|---|
| `Shesha.Application/Authorization/EntityCrudAuthorizationHelper.cs` | reads `SecuritySettings` and passes `DefaultEndpointAccess` + `DefaultEndpointPermissions` to `ObjectPermissionChecker` |
| `Shesha.Application/DynamicEntities/EntitiesAppService.cs` | same for `CheckPermissionAsync` (the generic `Entities/*` endpoints) |
| `Shesha.Tests/Security/DefaultEndpointAccess_Tests.cs` | unit tests for the fallback logic + a test that fails if a caller loses the settings dependency again |

All three call sites of `IObjectPermissionChecker.AuthorizeAsync` now pass the setting
(`ApiAuthorizationHelper` already did).

## Setup

- Ordinary user with **no** permissions.
- Administrator user.
- **Configuration → Settings → Security settings**: note the current `Default endpoint access` and
  `Default endpoint permissions` so you can restore them.
- Pick an entity whose CRUD endpoints are `Inherited` (default), e.g. `Person`.

## Test 1 — the reported bug

- [ ] Set `Default endpoint access` = **Requires permissions**, leave `Default endpoint permissions` empty. Save.
- [ ] As the ordinary user call:
      `GET /api/dynamic/Shesha/Person/Crud/GetAll` → **403**
      `GET /api/services/app/Entities/GetAll?entityType=Shesha.Domain.Person` → **403**
      `POST /api/dynamic/Shesha/Person/Crud/Create` → **403**
- [ ] **Pass:** all refused. **Fail:** any 200 (the bug).

## Test 2 — default permissions are honoured

- [ ] `Default endpoint access` = **Requires permissions**, `Default endpoint permissions` = a permission the ordinary user does **not** have. Save.
- [ ] Ordinary user → `Person/Crud/GetAll` → **403**.
- [ ] Grant that permission to the ordinary user, log in again → **200**.
- [ ] Remove the grant → **403** again.

## Test 3 — the other access levels still behave

- [ ] `Default endpoint access` = **Any authenticated**: ordinary user gets **200**, anonymous call gets **401**.
- [ ] `Default endpoint access` = **Allow anonymous**: anonymous call gets **200**.
- [ ] `Default endpoint access` = **Disable**: even the administrator gets a "not found" style refusal.
- [ ] Restore the original value afterwards.

## Test 4 — explicit configuration still wins over the default

- [ ] With `Default endpoint access` = **Requires permissions** (and no default permissions), open
      **Permissioned Objects**, set `Person` → `Get` to **Any authenticated**, save.
- [ ] Ordinary user → `Person/Crud/GetAll` → **200** (explicit entity configuration overrides the default).
- [ ] Set it back to **Inherited** → **403**.

## Test 5 — regression checks

With `Default endpoint access` back to its original value (**Any authenticated** on a normal environment):

- [ ] Log in as an ordinary user, open the pages they normally use — tables load, forms save.
- [ ] Reference lists, autocompletes and file uploads still work.
- [ ] Admin screens (entity configurator, form designer) still work.
- [ ] Signed out, the login page and any anonymous forms still work.

> Note: `Requires permissions` with an empty `Default endpoint permissions` list is a deliberate
> "deny everything that is not explicitly configured" mode. Expect a lot of 403s for non-admin users
> in that mode — that is the point of the setting, not a bug.
