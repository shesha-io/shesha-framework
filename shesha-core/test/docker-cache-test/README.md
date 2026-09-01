# Multi-Instance Cache Test Rig

Three Shesha API instances + Redis, sharing the host's local SQL Server. Built to establish a
behavioural and performance baseline **before** implementing
[`redis-cache-deserialization-performance.md`](../../../redis-cache-deserialization-performance.md),
and to act as the regression harness for that work.

See [`cache-test-environment-plan.md`](../../../cache-test-environment-plan.md) for the full rationale.

---

## Layout

```
sql       localhost:21433       SQL Server, seeded from the checked-in bacpac
sql-init  (one-shot)            imports the bacpac, then exits
api-1     http://localhost:22021  owns DB migration + bootstrappers
api-2     http://localhost:22022  skipMigrations=true
api-3     http://localhost:22023  skipMigrations=true
redis     localhost:6379          exposed for direct inspection
nginx     http://localhost:22020  loadtest profile only
```

**Instances are addressed directly, not through nginx.** Coherence tests must control which
instance answers a request — a round-robin balancer makes "did instance B see the write?"
unanswerable. nginx exists only for the throughput test (T7).

---

> The containers run **`Shesha.CacheTests.Host`** (`../Shesha.CacheTests.Host`), not
> `Boxfusion.SheshaFunctionalTests.Web.Host`. It loads the same module graph, adds the diagnostics
> endpoints, and registers no Hangfire worker. The functional-test application is untouched.

## Setup

None. The stack ships its own SQL Server, seeded from
[`shesha-functional-tests/database/SheshaFunctionalTests.bacpac`](../../../shesha-functional-tests/database) (325 KB,
git-tracked). You need Docker and nothing else.

A `.bacpac` cannot be loaded with `RESTORE DATABASE`, so a one-shot `sql-init` container carrying
sqlpackage imports it and exits; the api services wait on it via
`depends_on: service_completed_successfully`. The import is idempotent, so repeated `up` runs are
safe.

> **Using your own SQL instead:** copy `.env.example` to `.env` and set `SHA_DB_CONNECTION`.
> `.env` and every `.env.*` variant are gitignored.

---

## Running

```powershell
./publish.ps1        # build the app on the host into ./publish
./up.ps1             # start redis -> api-1 (migrates) -> api-2/api-3
```

Then run the tests from
[`../Shesha.CacheTests`](../Shesha.CacheTests):

```bash
cd ../Shesha.CacheTests
dotnet test
```

`up.ps1` sequences the cold start deliberately. The framework guards DB seeding with a Redis
distributed lock (`SheshaNHibernateModule.cs:268`), but that lock only waits 10s while a first-run
migration takes far longer — so instances 2 and 3 are held back until instance 1 is serving.

### Iterating on framework code

The containers bind-mount `./publish` at `/app`, so there is no image rebuild in the loop:

```powershell
./publish.ps1
docker compose restart
```

### Other commands

```powershell
./up.ps1 -Rebuild            # force image rebuild
./up.ps1 -Loadtest           # also start nginx on :22020
./reset.ps1                  # flush Redis + restart instances (cold cache)
./reset.ps1 -Full            # down -v, full teardown
docker compose logs api-1 --tail 60
docker compose --profile loadtest down
```

---

## Diagnostics endpoint

Added to the **test host only** (`Controllers/CacheDiagnosticsController.cs`) — deliberately not in
the framework.

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/cache-diagnostics/instance` | anonymous | Instance identity, uptime, build SHA. Doubles as the readiness probe. |
| `GET /api/cache-diagnostics/peek?cacheName=&key=` | authenticated | Raw Redis state for one cache entry: normalized key, existence, payload size, TTL. |
| `POST /api/cache-diagnostics/reset-stats` | authenticated | No-op until the L1 cache exists. |

`peek` is what lets the test suite distinguish *"the value propagated"* from *"the value was never
written"* — a distinction timing alone cannot make.

Quick check that all three instances are up and distinct:

```powershell
22021,22022,22023 | % { (Invoke-RestMethod "http://localhost:$_/api/cache-diagnostics/instance").instanceId }
```

---

## Deliberate configuration choices

| Setting | Why |
|---|---|
| Identical `Authentication__JwtBearer__SecurityKey` on all three | A token minted by instance 1 must validate on 2 and 3. The suite asserts this, so config drift never masquerades as a cache bug. |
| `Hangfire__Enabled=false` | Three instances sharing one SQL storage would otherwise run duplicate scheduled jobs and add background noise to the throughput numbers. |
| Per-instance `App_Data` volume | log4net writes `App_Data/Logs` relative to `/app`; three containers on one bind mount would interleave writes. |
| Redis `--save "" --appendonly no` | No persistence. Every run starts from a genuinely cold cache. |
| SQL service has **no volume** | Every `up` starts from a pristine database, so one run can never pollute the next. The fast dev loop (`publish.ps1` + `docker compose restart api-*`) does not touch SQL. |
| `gzip off` in nginx | Compression would distort the latency measurements the loadtest profile exists to take. |

---

## Known constraints

- **Startup lock window.** The distributed lock waits 10s / expires at 30s. Sequenced startup avoids
  the problem, but instances may flap if started concurrently on a cold database.
- **Stored files on local disk** are already incoherent across instances, independent of this work.
  Do not misattribute such a failure to the cache change.
- **Data Protection** defaults to a per-instance key ring in containers. JWT uses a symmetric key from
  config so is unaffected, but anything else depending on Data Protection will not round-trip
  across instances.
