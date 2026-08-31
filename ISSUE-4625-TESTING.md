# Issue 4625 — unauthenticated `ChangePassword` must return 401, not 500

Run against a database that existed **before** `[AbpAllowAnonymous]` was removed from
`ChangePasswordAsync`. A freshly created database never had the stale row and will pass
these tests even without the fix.

## Test 1 — Reproduce on the unpatched build (optional, confirms your database is affected)

- [ ] On a build without this migration, call `POST /api/services/app/User/ChangePassword` with **no**
      `Authorization` header.
- [ ] **Affected:** HTTP **500**. **Not affected:** HTTP 401 — your database has no stale row, so
      switch to a database that reproduces it before continuing.

## Test 2 — The migration corrects the stored access

- [ ] Deploy this build and let migrations run.
- [ ] Open **Permissioned objects**, find `UserAppService` → `ChangePassword`.
- [ ] **Pass:** Access reads **Inherited**. **Fail:** still **Allow anonymous**.

## Test 3 — Unauthenticated request now returns 401

- [ ] Call `POST /api/services/app/User/ChangePassword` with no `Authorization` header.
- [ ] **Pass:** HTTP **401**. **Fail:** HTTP 500, or the request is processed.

## Test 4 — Authenticated password change still works

- [ ] Log in as an ordinary user and change your password through the UI.
- [ ] **Pass:** succeeds as before. **Fail:** access denied, or a 401/403.
- [ ] Log in again with the new password.

## Test 5 — Administrator overrides are still respected

- [ ] Set `ChangePassword` Access to **Disable**, save.
- [ ] As the ordinary user, try to change your password. **Pass:** refused.
- [ ] Restore Access to **Inherited**.

## Test 6 — Deliberate customisations are not overwritten

- [ ] Before deploying, set some *other* endpoint to **Allow anonymous** and note it.
- [ ] Deploy and let migrations run.
- [ ] **Pass:** that endpoint is still **Allow anonymous** — the migration only touches
      `Shesha.Users.UserAppService@ChangePassword`.

## Test 7 — Regression check

- [ ] Log in with username and password.
- [ ] Forgot-password flow, including receiving and entering the OTP.
- [ ] Forced password change on first login (if your environment uses it).
- [ ] Load the app signed out — login page appears, no errors.
