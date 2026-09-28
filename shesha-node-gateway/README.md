# Shesha Node Gateway

A **backend-agnostic integration layer** for Shesha React apps.

The Shesha frontend talks to a backend over a single HTTP contract (`backendUrl` + ABP-style
`{ success, result }` envelopes on `/api/services/app/...` and `/api/TokenAuth/...` endpoints).
This gateway reimplements that contract as a **generic, data-driven adapter**, so *any* backend —
Go, .NET, Python, Rust, or a mix — can serve a Shesha app without the frontend changing at all.

```
Shesha React app  ──BACKEND_URL──▶  Node Gateway  ──┬─▶ native handlers (SQLite)
                                                    ├─▶ adapter  ─▶ your backend (Go/Python/…)
                                                    ├─▶ proxy    ─▶ existing .NET shesha-core
                                                    └─▶ mock     ─▶ canned responses
```

There are **no bespoke routes**. One dispatcher resolves every call against a declarative
**operation map**, then serves it in whichever **mode** you configure. Migrating a call from
.NET to your own backend is a config edit, not a code change.

---

## Quick start

```bash
cd shesha-node-gateway
npm install
cp .env.example .env          # defaults are fine for local dev
npm run dev                   # http://localhost:21022
```

Then point the React app at the gateway:

```bash
# in shesha-functional-tests/adminportal (or shesha-reactjs)
BACKEND_URL=http://localhost:21022 npm run dev
```

Default seeded login: **admin / 123qwe**.

Verify it's alive:

```bash
curl http://localhost:21022/health
curl http://localhost:21022/api/gateway/status   # route table + modes + backend probes
```

Run the end-to-end smoke test (in-memory DB, ephemeral port):

```bash
npm run smoke
```

---

## Modes — "transition via config"

Each operation in `config/operations.json` has a `mode`:

| Mode       | Behaviour                                                                     |
| ---------- | ----------------------------------------------------------------------------- |
| `native`   | Served by a built-in Node handler backed by SQLite.                            |
| `adapter`  | Transformed and forwarded to a named backend (any language). **The core idea.**|
| `proxy`    | Transparent reverse-proxy to the upstream .NET backend.                        |
| `mock`     | Returns a canned `result`.                                                     |

Any path **not** listed is handled by `defaultMode` (default: `proxy` → .NET). So you can start
with the gateway in front of your existing .NET backend and flip operations to `native`/`adapter`
one at a time — a gradual, per-call migration with zero frontend changes.

---

## Mapping any backend (the `adapter` mode)

`config/backends.json` registers upstreams by name:

```jsonc
{
  "name": "go-example",
  "baseUrl": "http://localhost:8080",
  "auth": { "type": "bearer-passthrough" },  // or static-bearer / header (API key)
  "healthPath": "/healthz"
}
```

An `adapter` operation declares how to call the backend and how to reshape its response into the
Shesha DTO. See **`config/operations.adapter-examples.json`** for ready-to-copy examples (Go
session/auth, generic REST entity CRUD, ABP passthrough). Example:

```jsonc
{
  "id": "session.getCurrentLoginInfo",
  "shesha": { "method": "GET", "path": "/api/services/app/Session/GetCurrentLoginInfo" },
  "mode": "adapter",
  "adapter": {
    "target": { "backend": "go-example", "method": "GET", "path": "/internal/session/me" },
    "response": {
      "user": {
        "userName": "$.body.account.username",
        "fullName": "{{$.body.account.profile.firstName}} {{$.body.account.profile.lastName}}",
        "grantedPermissions": { "$each": "$.body.account.permissions", "$as": { "permission": "$.name" } }
      },
      "application": { "version": "$.body.app.version" }
    }
  }
}
```

### Transform engine (single reusable mechanism)

The same tiny engine drives request **and** response mapping. Spec leaves:

| Spec                              | Meaning                                            |
| --------------------------------- | -------------------------------------------------- |
| `"$.a.b"`, `"$"`                  | path reference into the source (or whole source)   |
| `{ "$const": v }`                 | literal value                                      |
| `{ "$template": "x={{$.a}}" }` or `"{{$.a}}-{{$.b}}"` | string template (single `{{}}` preserves type) |
| `{ "$coalesce": ["$.a","$.b"], "$default": v }` | first defined value                   |
| `{ "$each": "$.items", "$as": spec }` | array map (`$` = item, `{ "$index": true }` = index) |
| plain object / array              | recursed                                           |

- **Request source**: `{ query, body, params, headers, user, path, method, operation }`
- **Response source**: `{ status, headers, body }` (the raw backend response)
- Target `path`/`method` support the same `{{ }}` templating.
- Set `adapter.passthroughEnvelope: true` when the backend already returns an ABP `{ success, result }`.

---

## Single-endpoint architecture: the resource registry

Shesha's management screens call roughly 60 app-service endpoints that are all variations on five
shapes. Mapping them one by one does not scale, so the gateway collapses them onto **four wildcard
operations** and one declarative registry.

### The routes

| Operation | Path | Resolves to |
| --------- | ---- | ----------- |
| `appService.dispatch.*` | `/api/services/:serviceModule/:service/:action` | a resource + a named action |
| `appService.dispatch.short.*` | `/api/:service/:action` | same, for services core puts outside `/api/services/...` (`api/Sms/Gateways`) |
| `appService.dispatch.collection.*` | `/api/:service` | same, with the **verb** as the action (`GET /api/ModelConfigurations` → `Get`) |
| `dynamic.crud` | `/api/dynamic/:module/:entity/Crud/:action` | the generic entity CRUD engine |

All four land in `src/modules/resourceRouter.ts`: one place decides authorization, whether the
action is a named behaviour, and which storage backs it. `OperationMap` ranks matches by specificity
(`literals × 10 − wildcard penalty − param count`), so an exact entry always outranks a wildcard —
that is how `/api/ModelConfigurations/GetAll` beats `/api/ModelConfigurations/:id`, and how the
hand-written bootstrap operations keep working untouched. An exact entry may also name
`appService.dispatch` directly; the router then reads the segments off the path instead of route
params.

A service the registry does not describe returns the `proxyFallback()` marker, so unmapped calls
still reach the .NET upstream rather than 404ing at the gateway.

### The registry (`config/resources.json`)

Each entry declares *what the rows are*, not how to serve them:

```json
{
  "service": "ReferenceList",
  "serviceModule": "*",
  "storage": { "kind": "configItem", "itemType": "reference-list" },
  "actions": { "GetAllTree": "referenceList.getAllTree" },
  "auth": { "requiresAuth": true, "permission": "app:Configurator", "anonymousActions": ["Get"] }
}
```

| `storage.kind` | Backed by | Generic CRUD |
| -------------- | --------- | ------------ |
| `entity` | `entity_rows` — one JSON document per row, keyed `(module, entityName, id)` | all five verbs |
| `configItem` | `config_items` + `config_nodes`, for the given `itemType` | all five verbs |
| `user` | `users` (delete = deactivate; there is no `isDeleted` column) | all five verbs |
| `module` | the authoritative `modules` table — no parallel copy | read verbs |
| `behaviour` | nothing generic; every action must be named | none |

Actions listed in `actions` are named behaviours in `src/modules/behaviours/`; anything else falls
through to the storage's generic CRUD, and an action that is neither falls through to proxy.

**Single source of truth.** Where a service's rows *are* a configuration item, the resource is bound
to that item type rather than given its own table — `ReferenceList` → `reference-list`, `ShaRole` →
`role`, `NotificationTypeConfig` → `notification-type`, `ModelConfigurations` → `entity`,
`Permission` → `permission-definition`. The management screen and the Configuration Studio tree then
edit the same document, with no second copy to drift. `Permission` needs all eight actions named
because its DTO does not fit the generic engine: `id` **is** the permission name, and `GetAll`
returns a bare array instead of a `PagedResultDto`.

### Derived seed data

`src/db/seed.ts` reads the registry rather than duplicating it: permissioned objects
(`Shesha.{Service}AppService` plus one `...@{Action}` child per action) are generated from
`loadResources()`, with each one's `access` derived from the same `auth` block the router enforces
(`AllowAnonymous` / `AnyAuthenticated` / `RequiresPermissions`, matching
`RefListPermissionedAccess`). Registering a resource therefore registers its permissioned objects,
and the Permission Configurator cannot disagree with the route table. The seed also writes the
framework permissions shesha-core declares in code (`ShaPermissionNames` + `PermissionNames`), the
`System Administrator` role with an appointment for the seeded admin, and the two canonical
front-end applications (`default-app`, `shesha-swagger-app`). Seeding is idempotent and un-deletes
rows a user removed (`entityRowsRepo.put` upserts with `isDeleted = 0`).

### Configuration-item documents

`readItemContent` fills in the item's identity on read, because core builds the `configuration` half
of `IConfigurationItemDto` by mapping the *entity* to its DTO — so it always carries `id` and
`itemType`. `id` and `itemType` are authoritative (non-form ids derive from the natural key, so a
rename leaves a stale id in the stored copy); `module` is only a default, because a
`setting-configuration` stores it as a `ModuleDto` reference rather than a name.

---

## Bootstrap coverage (native)

Served natively out-of-the-box (SQLite): `TokenAuth/Authenticate`, `RefreshToken`, `SignOff`,
`Session/GetCurrentLoginInfo`, `ConfigurationStudio/GetModules`, `ConfigurationItem/GetCurrent`
(reference lists & forms), `Metadata/Get`,
`Settings/GetConfigurations|GetValue|UpdateValue|GetUserValue|UpdateUserValue`,
`Permission/IsPermissionGranted`, `ShaRole/IsRoleGranted`, plus the whole **Form Designer /
Configuration Studio** surface (see below). On top of that, every resource listed in
`config/resources.json` is served through the wildcard routes — security (`Permission`,
`PermissionedObject`, `ShaRole`, `ShaRoleAppointedPerson`), reference lists, users and the password
reset / OTP flows, notifications, front-end apps, modules, the entity designer's
`ModelConfigurations`, audit trail, and the dynamic CRUD route for any entity. Everything else
proxies to .NET until you map it.

### Forms: canonical seed data, served from disk

Forms are **not** DB-seeded. `ConfigurationItem/GetCurrent?itemType=form` reads
`config/forms/<name>.json` on each request (mtime-cached), so editing a form takes effect
without restarting the gateway.

Those files come from the same source the .NET backend seeds from: shesha-core imports embedded
`package{yyyyMMddHHmm}.shaconfig` ZIPs through `EmbeddedPackageSeeder` at module startup.
`scripts/extract-forms.ts` mirrors that (date order, latest revision wins) and writes each form
in the shape we serve:

```bash
npx tsx scripts/extract-forms.ts --all                 # every form in the packages (77 today)
npx tsx scripts/extract-forms.ts --forms login,header   # just a few
npx tsx scripts/extract-forms.ts --all --dry-run        # preview which package each form resolves to
```

The framework login form reads
`application.settings.shesha.userManagement.userManagementSettings.getValueAsync()` in its
`onBeforeDataLoad`. That resolves via `Settings/GetConfigurations` → `Settings/GetValue`
(setting `Shesha.UserManagement`, module `Shesha`), both seeded natively — so the canonical
login renders typeable fields and hides the register link (`supportedRegistrationMethods: 1`).

### Form Designer / Configuration Mode

Configuration Mode (the drag-and-drop Form Designer plus Configuration Studio) is served natively,
so a user can edit the UI without the .NET backend. Two gates had to line up with how shesha-reactjs
actually decides access:

1. **`app:Configurator` must appear literally in `grantedPermissions`.**
   `Authenticator.anyOfPermissionsGranted` compares `loginInfo.grantedPermissions[].permission === p`
   with **no wildcard support**, so a stored `'*'` marker never grants it and the Configuration Mode
   toggle stays hidden. `src/auth/permissions.ts` expands wildcards against the permission names
   shesha-core defines (`ShaPermissionNames` / `PermissionNames`) at the `GetCurrentLoginInfo`
   boundary. `Permission/IsPermissionGranted` still honours wildcard semantics server-side, the way
   shesha-core grants the admin role everything.
2. **The module must be editable.** `ConfigurationLoader.getFormAsync` passes `!isEditable` (from
   `ConfigurationStudio/GetModules`) into the form as `readOnly`, and every write op re-checks it —
   mirroring `module.EnsureEditable()` / `ModuleIsNotEditableException`. `SheshaModuleInfo.IsEditable`
   defaults to `true` and is only turned off `#if !DEBUG`, so the seed marks the Shesha module
   editable.

Mapped exact operations (the wildcard routes above cover the rest; 61 entries in total):

| Area | Operations |
| ---- | ---------- |
| `FormConfiguration/*` | `Get`, `GetAll`, `Create`, `Update`, **`UpdateMarkup`** (the designer's Save), `Delete`, `CheckPermissions`, `GetJson` (raw file download), `GetAnonymousForms` |
| `ConfigurationStudio/*` | `GetModules`, `GetFlatTree`, `GetAvailableItemTypes`, `GetItem`, `CreateItem`, `UpdateItem`, `RenameItem`, `DeleteItem`, `DuplicateItem`, `ExposeItem`, `CreateFolder`, `RenameFolder`, `DeleteFolder`, `MoveNodeToFolder`, `ReorderNode`, `GetItemRevisions`, `RenameRevision`, `RestoreItemRevision`, `GetRevisionJson` |
| `ConfigurationItem/*` | `GetCurrent`, `Get` (by id) |
| `Metadata/*` | `Get`, `Autocomplete` (the entity-type picker in the designer) |

**Storage.** Disk stays the source of truth for markup: a designer save rewrites
`config/forms/<name>.json`, and the mtime cache means the next request serves it — no restart.
Non-form item types live in `config_items`; tree/folder metadata in `config_nodes`; version history
in `config_item_revisions` (each save snapshots the previous document). Ids are deterministic
md5-derived GUIDs, so the tree keeps stable ids across restarts even on `DB_PATH=:memory:`.

`GetAvailableItemTypes` returns shesha-core's eight item types with their create/rename forms
(`form`, `entity`, `reference-list`, `role`, `notification-type`, `notification-channel`,
`permission-definition`, `setting-configuration`) — the matching `cs-*-create` / `cs-item-rename`
forms are already seeded in `config/forms`.

> `FlatTreeNode` requires **both** `itemType` and `discriminator` on `nodeType === 2`, or
> `flatNode2TreeNode` throws in the browser. `npm run smoke` asserts this over the whole tree.

---

## Project layout

```
config/
  backends.json                     backend registry (any language)
  operations.json                   the operation map (modes) — data, not code
  resources.json                    the resource registry the wildcard routes resolve against
  operations.adapter-examples.json  copy-paste adapter mappings
  forms/                            canonical form definitions served by ConfigurationItem/GetCurrent
scripts/
  extract-forms.ts                  pull forms out of shesha-core's .shaconfig packages
  smoke.ts                          end-to-end check (109 assertions over every mapped surface)
src/
  config/        env + typed config loaders
  abp/           IAjaxResponse envelope + GatewayError
  adapter/       transform engine, backend HTTP client, operation-map resolver
  gateway/       dispatcher (native/adapter/proxy/mock), native registry, status router
  modules/       native bootstrap handlers (auth, session, metadata, config, settings,
                 formConfiguration, configurationStudio, configStore)
    resourceRouter.ts  the one dispatcher every wildcard route lands in
    dynamicCrud.ts     /api/dynamic/:module/:entity/Crud/:action
    crud/              generic CRUD per storage kind (entity, configItem, user, module)
    behaviours/        named actions that do not fit generic CRUD (users, otp, permissions,
                       referenceLists, metadata, audit, studio, sms, modelConfigurations)
    entityStore.ts     the entity_rows backend: filtering, quick-search, paging, audit emission
  auth/          permission catalogue + wildcard expansion for the frontend contract
  utils/         deterministic GUID helpers, DTO helpers, JsonLogic subset
  db/            SQLite schema, repositories, seed
  server/app.ts  Express wiring
  index.ts       bootstrap
```

## Environment

See `.env.example`. Key vars: `PORT` (21022), `SHESHA_UPSTREAM_URL` (proxy target, 21021),
`JWT_SECRET`, `DB_PATH` (`:memory:` or a file), `DB_SEED`, `CORS_ORIGINS`, `CONFIG_DIR`.

## Notes & limits

- `proxy` mode uses `http-proxy-middleware` (full passthrough). `adapter` mode uses JSON over
  `fetch`; binary/streaming responses (e.g. file downloads) should stay on `proxy` or a dedicated mount.
- Mixed auth: tokens issued by `native` auth are gateway JWTs. When proxying protected calls to
  .NET, that backend won't accept them — for a mixed setup keep auth on one side, or use `adapter`
  with token exchange. Bootstrap scope runs auth natively.
- Replace the dev `JWT_SECRET` and the `generic-rest` API key before any real deployment.
- `npm run dev` runs the TypeScript sources with hot reload; `npm start` runs the compiled `dist/`.
  After changing anything under `src/`, run `npm run build` (or just use `npm run dev`) — otherwise a
  restarted gateway serves stale handlers. `config/` (forms, operation map) is read at runtime in both modes.
