# Cache Coherence Baseline — pre-L1

**Captured:** 2026-08-27
**Build SHA:** `336654f63` (branch `releases/0.43`, before any change from
`redis-cache-deserialization-performance.md`)
**Rig:** 3 instances + Redis, local SQL `SheshaFunctionalTests-43`, cold cache (Redis flushed,
instances restarted immediately before the run)
**Result:** 14/14 passed

---

## Why these numbers matter

There is no in-process cache today: Redis is the single source of truth, so an invalidation is
visible to every instance the moment it lands. **The convergence figures below are therefore
essentially network + request latency, not cache staleness.**

That is the line to hold. After Phase 2 of the remediation plan adds an L1 cache, convergence
becomes bounded by the L1 TTL or the pub/sub invalidation round-trip instead. These numbers are
what "correct" looked like beforehand.

---

## Convergence — settings cache (`SettingsCache`)

Write on one instance, poll all three until every one returns the new value.

| Measure | Value |
|---|---|
| T1 single write (api-1 → all) | **58 ms** (per instance: 29, 28, 58) |
| T3 median over 5 rounds, rotating writer | **26 ms** |
| T3 max over 5 rounds | **53 ms** |
| T3 samples | 24, 25, 26, 29, 53 ms |

Cached payload: `n:SettingsCache,c:Boxfusion.SheshaFunctionalTests.Common.StarsCount` — **167 bytes**.

## Convergence — permissioned object cache (`PermissionedObjectCache`)

The cache the Azure profiler flagged; read on every authenticated request.

| Measure | Value |
|---|---|
| T4 access change (api-1 → all) | **93 ms** (per instance: 38, 93, 90) |
| T6 concurrent writes, time to unanimity | **52 ms** |

## Behavioural results

| Test | Result |
|---|---|
| T2 write-then-read-own | Immediate on the writing instance |
| T1b reverse direction (api-3 → api-1/2) | Converged |
| T5 restriction enforced on other instances | All three agreed on access level **and** permission list |
| T4b phantom object resolution | Identical on all three: `access=2, actualAccess=2` (Inherited) |

T4b is worth noting specifically: reading a non-existent permissioned object populates
`CacheItemWrapper.DefaultValue` independently on each instance, and all three agreed. This is the
wrapper type whose parameterized constructor produces the
`CreateObjectUsingCreatorWithParameters` frame in the Azure profile, and the path most likely to
diverge once an L1 layer exists.

---

## Suggested acceptance criteria for the post-L1 run

1. **All 14 tests still pass.** T5 in particular — a stale L1 entry there means one node serving
   what another has locked down.
2. **Convergence stays bounded and explainable.** If it rises to roughly the L1 TTL, that is the
   design working as intended. If it exceeds the TTL, invalidation is broken.
3. **T2 must remain immediate.** Any regression here means the L1 layer invalidates remotely but
   not locally.
4. **T4b must stay unanimous.** Divergence means the negative-caching path is not being
   invalidated.

## Environment caveats

- Figures come from a developer workstation with Docker Desktop and SQL Server on the same host;
  treat them as a relative baseline, not absolute production latency.
- Hangfire workers are disabled on all three instances (`Hangfire__Enabled=false`) so background
  jobs do not add noise.
- Redis runs with no persistence (`--save "" --appendonly no`).
