# Issue 4614 — seeded users must require a password change

Two paths are covered and both need testing: a **new** database (the seeder) and an **existing**
database (the migration).

## Test 1 — fresh deployment, empty database

- [ ] Deploy against an empty database and let the host initialisation seed the default users.
- [ ] Inspect `AbpUsers` for `admin`, `dev` and `config`.
- [ ] **Pass:** `RequireChangePassword` is `1` / `true` for all three. **Fail:** any of them is `0` / `false`.

## Test 2 — existing deployment still on the default password

- [ ] Start from a database seeded by an earlier build, where the three accounts still have the
      default password and `RequireChangePassword = 0`.
- [ ] Deploy this build and let migrations run.
- [ ] **Pass:** all three accounts now have `RequireChangePassword = 1`. **Fail:** only `admin`
      changed, or none did.

## Test 3 — accounts with a changed password are left alone

- [ ] Before deploying, change `dev`'s password to something else and set
      `RequireChangePassword = 0`.
- [ ] Deploy and let migrations run.
- [ ] **Pass:** `dev` still has `RequireChangePassword = 0` — the migration only flags accounts that
      still hold the default password. **Fail:** `dev` was flagged anyway.

## Test 4 — the flag clears when the password is changed

- [ ] As one of the seeded users, change the password.
- [ ] **Pass:** `RequireChangePassword` becomes `0` for that user.

## Test 5 — login response carries the flag

- [ ] Log in as a seeded user and inspect the authentication response.
- [ ] **Pass:** `requiredChangePassword` is `true`.

## Test 6 — regression

- [ ] Existing non-default users are untouched — no `RequireChangePassword` changes for them.
- [ ] Login, and the normal password change flow, both still work.
- [ ] Run against **both** SQL Server and PostgreSQL: the migration has a separate code path per
      database and only one of them runs on any given deployment.

## Known limitation — not covered by this change

Setting the flag does **not** by itself block anything. `RequiredChangePassword` is returned in the
login response and `requireChangePassword` is declared in the front-end API types, but no component
reads it, and no backend check refuses requests while the flag is set. A seeded user can therefore
still log in and use the application with the default password.

This change delivers what the card asks for — the flag is set on seeding and backfilled for existing
databases — but enforcing it needs a separate card covering the front end and/or an API-level gate.
Please do not test for a forced password-change prompt; there is not one yet.
