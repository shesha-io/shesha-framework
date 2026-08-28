# Shesha.CacheTests.Host

The web application that runs in the three containers of the cache-coherence rig.

It is **not** a test project — it is the *subject* of the tests in
[`../Shesha.CacheTests`](../Shesha.CacheTests). You never run it directly; the test fixture and
[`../docker-cache-test/up.ps1`](../docker-cache-test) publish and containerise it.

## Why it exists

The rig needs two things the shipped application does not provide:

1. **Diagnostics endpoints** — `/api/cache-diagnostics/instance` and `/peek`, so the suite can prove
   *which* of the three instances answered and inspect raw Redis state.
2. **No background workers** — three instances sharing one SQL storage would run every Hangfire
   scheduled job in triplicate and add noise to the measurements.

Both used to be edits to `Boxfusion.SheshaFunctionalTests.Web.Host`. Moving them here keeps that
application **completely untouched**.

## How close is it to the real host?

Deliberately very close. It loads the same module graph via `SheshaFunctionalTestsWebCoreModule`,
so everything under test — the authorization filter, Redis caching, NHibernate, the dynamic
app-service API — behaves identically. `Startup.cs` is adapted from that host's `Startup.cs`.

The intentional differences:

| Difference | Reason |
|---|---|
| No `AddHangfireServer` | Storage and client are registered so anything that enqueues a job still resolves, but no worker runs. |
| No Swagger UI, GraphQL playground, or Hangfire dashboard | Unused by the tests. The Swagger UI in particular loads an embedded resource from the other host's assembly. |
| Console-only log4net | Three containers would otherwise need separate log volumes; `docker logs` is where you look anyway. |
| `CacheDiagnosticsController` | The point of the whole project. |

## Two things that are load-bearing and non-obvious

**Swagger *generation* is not optional.** A Shesha module registers `CachingSwaggerProvider`
unconditionally, and that needs Swashbuckle's `ISchemaGenerator`. Dropping `AddSwaggerGen` makes
every request fail at startup with `ComponentNotFoundException`. The UI is omitted; the generator
is not.

**`JobStorage.Current` must be set manually.** `AddHangfire` registers `JobStorage` in DI but does
not assign the static — normally `AddHangfireServer` does that. ABP's Hangfire background-job
manager reads the static during module initialisation, so without the explicit assignment in
`Configure` every request fails with *"Current JobStorage instance has not been initialized yet"*.

## Configuration

`appsettings.json` holds only baseline values. Everything meaningful — connection string, Redis
endpoint, JWT signing key, `INSTANCE_ID`, `skipMigrations`/`skipBootstrappers` — is supplied per
instance by the provisioner or by docker-compose.

The JWT signing key **must** be identical across instances, or a token minted by one is rejected by
the others. The suite asserts this so the failure reads as an auth error rather than as phantom
cache incoherence.
