# Issue #4655 — ghost endpoint in Permissioned Objects

Branch: `fix/4655-form-and-permission-write-auth` (based on `main`)

## Scope

The authorization part of #4655 is already on `main`: `PermissionAppService`'s write methods
(`Create`, `Update`, `UpdateParent`, `Delete`) and the class-level restriction on
`FormConfigurationAppService` both require `app:Configurator` there, and
`Shesha.Tests/Security/PermissionAndFormServiceAuth_Tests.cs` covers them. Nothing to redo.

What is left is @yuliaGradova's follow-up: **`FormConfiguration → GetByNameAsync` appears in
Permissioned Objects but not in Swagger.**

That endpoint no longer exists on `main` — it was removed by the configuration-items refactor
(runtime form loading now goes through `ConfigurationItem/Get` / `GetCurrent`). Swagger is correct;
the Permissioned Objects screen was wrong: the bootstrapper only ever added and updated rows, it
never removed the rows of endpoints that disappeared from the code, so
`...FormConfigurationAppService@GetByName` stayed behind as a ghost entry. Such an entry cannot be
configured meaningfully — nothing reads it — and it makes the security screen untrustworthy.

## What changed

| File | Change |
|---|---|
| `Shesha.Framework/Permissions/PermissionedObjectsBootstrapper.cs` | deletes web-api action rows whose endpoint no longer exists |
| `Shesha.Tests/Security/PermissionAndFormServiceAuth_Tests.cs` | the "must not be `[AllowAnonymous]`" theory also covers `Create`, `Update`, `Delete` and `GetJson` |
| `PermissionAppService.cs`, `FormConfigurationAppService.cs` | `"app:Configurator"` literals replaced by `ShaPermissionNames.Application_Configurator` — same value, no behaviour change (this is how the merge conflict with `main` was resolved) |

Cleanup rules (deliberately conservative):

- only rows of type `Shesha.WebApi.Action`;
- only actions whose **service was scanned in this run** — the provider skips services in unchanged
  assemblies, so a skipped service never loses its actions;
- service ("parent") rows themselves are never deleted;
- entity and form permissioned objects are untouched;
- each deletion is written to the bootstrapper log.

Because the scan skips unchanged assemblies, the cleanup happens on the first startup after a
deployment that changes the assembly — which is the case when this branch is deployed.

## Test 1 — ghost endpoint is gone (the reported comment)

- [ ] Before deploying, note in **Configuration → Permissioned Objects → FormConfiguration** that
      `GetByName` is listed.
- [ ] Deploy this branch (the app must start, so the bootstrapper runs).
- [ ] Re-open the screen: `GetByName` is **no longer listed**.
- [ ] Every endpoint still listed for `FormConfiguration` also appears in Swagger, and vice versa
      (`Get`, `GetAll`, `Create`, `Update`, `Delete`, `UpdateMarkup`, `ImportJson`, `GetJson`,
      `CheckPermissions`, `GetAnonymousForms`).
- [ ] Spot-check several other services — the endpoint lists match Swagger, nothing legitimate
      disappeared.
- [ ] Check the bootstrapper log (startup log / `Frwk_BootstrapperStartups`) — every deleted object
      is listed there.

## Test 2 — configured endpoints survive

- [ ] Pick an endpoint that still exists, set its Access to **Requires permissions** with some
      permission, save.
- [ ] Restart the app.
- [ ] The configuration is still there — the cleanup must not touch endpoints that exist.

## Test 3 — the authorization already on `main` still holds

As an ordinary user (no permissions):

- [ ] `POST /api/services/app/Permission/Create`, `PUT .../Update`, `PUT .../UpdateParent`,
      `DELETE .../Delete` → **403**
- [ ] `PUT /api/services/Shesha/FormConfiguration/UpdateMarkup` → **403 / 401**
- [ ] `POST /api/services/Shesha/FormConfiguration/ImportJson` → **403 / 401**
- [ ] Log in and open the pages they normally use — main menu renders
      (`FormConfiguration/CheckPermissions` stays anonymous), forms load and save data.

As a configurator:

- [ ] Form designer: open, edit, save, publish, export, import, delete.
- [ ] Permission tree: create, rename, re-parent, delete a test permission.
