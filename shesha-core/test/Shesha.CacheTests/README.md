# Cache Coherence Tests

Black-box cache-coherence tests against the running 3-instance rig in
[`../docker-cache-test`](../docker-cache-test).

> **What the cluster runs.** The three containers run
> [`Shesha.CacheTests.Host`](../Shesha.CacheTests.Host) -- a purpose-built host that loads the same
> module graph as the functional-test application (`SheshaFunctionalTestsWebCoreModule`, which is
> what wires Redis via `UseSheshaRedisIfConfigured`). It exists so the diagnostics endpoints and
> the no-background-workers policy live with the tests: **`Boxfusion.SheshaFunctionalTests.Web.Host`
> is not modified at all.**
>
> The database seed is the bacpac in `shesha-functional-tests/database`. Both it and the rig are
> located by walking up to the repo root, so nothing breaks if this project moves again.

## Why

Phase 2 of [`redis-cache-deserialization-performance.md`](../../../redis-cache-deserialization-performance.md)
adds an **L1 (in-process) cache** in front of Redis. Today there is no L1, so coherence is
guaranteed by construction — Redis is the single source of truth and an invalidation is visible
everywhere immediately. Adding L1 trades that guarantee for bounded staleness.

This suite measures the guarantee **before** the change and holds the line **after** it.

## Running

There are two modes. Both run the same 14 tests.

### Managed — self-contained, for CI

```bash
SHA_Cluster__Provision=true dotnet test
```

The fixture provisions everything itself via Testcontainers: SQL Server (seeded from the
checked-in bacpac), Redis, and three API instances — then tears it all down. **Nothing is needed
but Docker.** Roughly 75–110 s to provision; host ports are assigned by Docker, so nothing can
collide.

### External — fast local loop

```powershell
cd ..\docker-cache-test
.\publish.ps1
.\up.ps1
```
```bash
dotnet test          # ~2 s
```

Connects to the already-running stack. Use this while iterating: `publish.ps1` +
`docker compose restart` picks up a framework change in seconds, where managed mode would rebuild
the image and restart the whole cluster each run.

### Filtering

```bash
dotnet test --filter "FullyQualifiedName~ClusterSanityTests"        # T0 only
dotnet test --filter "FullyQualifiedName~SettingsCoherenceTests"    # T1/T1b/T2/T3
dotnet test --filter "FullyQualifiedName~PermissionCoherenceTests"  # T4/T4b/T5/T6
```

Convergence timings and provisioning progress print via `ITestOutputHelper`; add
`--logger "console;verbosity=detailed"` to see them.

**In external mode, if the rig is not running every test reports `Skipped`, not `Failed`** — with a
message naming the configured instances and how to start them. A plain `dotnet test` over the
solution therefore stays green for anyone who has not started Docker.

## Configuration

`appsettings.json`, overridable by `SHA_`-prefixed environment variables:

| Key | Default | Purpose |
|---|---|---|
| `Provision` | `false` | `true` = provision via Testcontainers; `false` = connect to a running stack. |
| `InstanceCount` | `3` | Instances to provision. Coherence needs at least two. |
| `VerboseProvisioning` | `false` | Emit DacFx's per-statement import output (hundreds of lines). |
| `AlwaysPublish` | `false` | Re-run `dotnet publish` even when output exists. |
| `BaseUrls` | 22021–22023 | External mode only; managed mode overwrites these with mapped ports. |
| `BacpacPath` | auto | Discovered under `shesha-functional-tests/database` if unset. |

```bash
SHA_Cluster__Provision=true
SHA_Cluster__BaseUrls__0=http://localhost:22021
SHA_Cluster__Password=...
```

## Tests

| ID | Test | Asserts |
|---|---|---|
| **T0** | `ClusterSanityTests` | Three distinct processes, same build, Redis configured, one JWT key accepted by all. |
| **T2** | `T2_write_is_immediately_visible_on_the_writing_instance` | A write is visible on the instance that made it. |
| **T1 / T1b** | `T1_..._1_becomes_visible_on_2_and_3`, `T1b_..._3_becomes_visible_on_1_and_2` | Propagation works in both directions. |
| **T3** | `T3_convergence_latency_across_repeated_writes` | Convergence latency over 5 rounds. **Produces the number that should drive the L1 TTL.** |
| **T4** | `T4_access_change_on_instance_1_propagates_to_2_and_3` | Access-level change propagates. |
| **T4b** | `T4b_unknown_object_resolves_identically_on_all_instances` | Negative caching via `CacheItemWrapper.DefaultValue`. |
| **T5** | `T5_restriction_applied_on_one_instance_is_seen_by_the_others` | Access level **and** permission list agree everywhere. |
| **T6** | `T6_concurrent_writes_from_all_instances_converge_on_one_value` | Concurrent writes converge; no lost invalidation. |

## Design notes

**No project references.** These tests drive the cluster over HTTP exactly as a real client
would. Referencing `Shesha.Framework` would let them accidentally assert against in-process state
instead of what the deployed instances actually return.

**Parallelisation is disabled.** `ClusterCollection` sets `DisableParallelization = true` because
every test mutates the same shared setting and permissioned object — concurrent tests would make
each other's writes look like cache incoherence.

**T0 must pass first.** If the three URLs are not three distinct processes, every downstream
result is meaningless, passes included. `AssertDistinctInstances` compares `INSTANCE_ID` *and*
`machineName:processId` — containers all report PID 1, so the host name has to be part of it.

**One token, three instances.** `ClusterClient` authenticates once against instance 1 and reuses
that token everywhere, so every test implicitly asserts the JWT signing keys match. Key drift then
surfaces as an auth error rather than as phantom "cache incoherence".

**Writes use `PUT /Update`, and mutate raw JSON.** The obvious-looking `SetApiPermissions`
endpoint is unusable: ASP.NET inferred two body parameters from its signature, so the generated
contract takes the bare `access` enum as the body and drops `permissions` entirely — every request
fails with *"A non-empty request body is required"*. `Update` is the only path that can set access
and permissions together. Mutating the raw `JsonObject` rather than a typed DTO means fields this
suite does not model round-trip verbatim instead of being reset to null.

**Latency is measured, not tightly asserted.** T3 records median and max and only fails on an
absurd bound. A tight threshold would just be flaky on a loaded developer machine — the value is
the recorded number.

**State is restored.** `ClusterFixture` snapshots the setting value and the permissioned object
before any test runs and restores both on disposal.

**Test targets are low-blast-radius.** The setting (`StarsCount`) and the API target
(`ActivateMembershipAppService@ActivateMembership`) both belong to the functional-test module.
Framework services inherit `app:Configurator` from their parent, so a failed restore against one
of those would leave real APIs locked down.

**Diagnostics live in the test host, not the app.** `CacheDiagnosticsController` is part of
`Shesha.CacheTests.Host`. Putting it in a plugin assembly or in the functional-test app would both
have worked, but a dedicated host also lets us omit `AddHangfireServer` -- three instances sharing
one SQL storage would otherwise run every scheduled job in triplicate.

**The bacpac is the single database artifact.** `shesha-functional-tests/database/*.bacpac` is
325 KB and git-tracked. A `.bacpac` cannot be loaded with `RESTORE DATABASE`, so it is imported
with DacFx — in-process here (`Infrastructure/Provisioning/BacpacImporter.cs`), and by a one-shot
`sql-init` container carrying sqlpackage in the compose stack. Two mechanisms, one artifact.

**Bootstrapping is load-bearing.** The bacpac carries the `Frwk_PermissionedObjects` schema but no
rows — that table is populated by a startup bootstrapper that scans the API surface. The permission
tests target `ActivateMembershipAppService@ActivateMembership`, which only exists *after* it runs.
So api-1 always starts alone with `skipBootstrappers=false` before the others join with it skipped.
That sequencing is not cosmetic: the framework's seeding lock waits only 10 s
(`SheshaNHibernateModule.cs:268`), far less than a cold start takes.

## Baseline

The pre-change baseline is recorded in
[`Reports/baseline-336654f63.md`](Reports/baseline-336654f63.md).
