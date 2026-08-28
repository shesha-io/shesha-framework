# Phase 1 + 2 Results — serializer hygiene and the L1 cache

**Captured:** 2026-08-28
**Baseline for comparison:** [`baseline-336654f63.md`](baseline-336654f63.md) (pre-change)
**Result:** 20/20 passing (14 original + 6 new L1 tests)

---

## What shipped

### Phase 1 — serializer hygiene

| Change | File |
|---|---|
| `JsonSerializerSettings` hoisted to `static readonly` | `DefaultRedisCacheSerializer.cs` |
| Type resolution memoized in a `ConcurrentDictionary`, `ignoreCase` dropped | `DefaultRedisCacheSerializer.cs` |
| Parameterless constructor + settable properties | `CacheItemWrapper<T>`, `CachedSettingValue` |

The third item is the one that addresses the reported stack frame. Both types previously had only a
parameterized constructor, forcing Newtonsoft down the
`CreateObjectUsingCreatorWithParameters` path — frame 0 of the Azure profile.

### Phase 2 — L1 cache

New in `Shesha.Redis`:

- `ShaRedisCacheL1Store` — per-cache in-process store, absolute TTL, bounded entry count, hit/miss counters
- `ShaCacheInvalidationBus` — Redis pub/sub broadcast so a write on one instance drops the entry everywhere
- `ShaCacheStatistics` — counter registry, surfaced through the diagnostics endpoint
- `ShaRedisCache` — reads check L1 first; every `Set`/`Remove`/`Clear` invalidates locally and broadcasts

Defaults: **enabled**, 30s TTL, 10,000 entries per cache, broadcast on. All four configurable under
the `SheshaRedis` section (`L1Enabled`, `L1ExpirationSeconds`, `L1MaxEntriesPerCache`,
`L1InvalidationBroadcastEnabled`).

---

## Measurements

### L1 is doing its job

| Test | Result |
|---|---|
| L2A — repeat setting reads | **100% L1 hit rate** over 21 reads |
| L2B — permission lookups (the profiled hot path) | **95% L1 hit rate** over 22 reads |

The permission cache is the one the Azure profile flagged: it is read on every authenticated request
via `SheshaAuthorizationFilter`. At a 95% hit rate, 19 in 20 of those reads no longer deserialize
anything.

### Coherence held

Convergence is unchanged, which is the point — the L1 layer must not cost correctness.

| Measure | Baseline (pre-L1) | With L1 |
|---|---|---|
| Settings, median over 5 rounds | 26 ms | **14 ms** |
| Settings, max over 5 rounds | 53 ms | **22 ms** |
| Settings, single write → all instances | 58 ms | 15–24 ms |
| Permissions, access change → all instances | 93 ms | 19–22 ms |

Convergence did not regress; it improved, because the invalidated instances now refill from Redis
rather than every reader deserializing on every request.

**L2C asserts convergence is faster than the 30s TTL**, so a broken pub/sub subscription cannot hide
behind expiry quietly doing the work.

---

## The semantic change worth knowing about

L1 stores values **already deserialized**, so callers now receive the **same object instance** on
every hit until invalidation. Previously the Redis path handed out a fresh copy per read.

This matches ABP's in-memory cache (`AbpMemoryCache`), which has always shared instances — the Redis
path was the outlier. But it means code that mutates a cached value now affects everything holding it.

`PermissionedObjectManager.GetObjectWithChild` does exactly that: it appends to `dto.Children` on
objects that came from the cache. It is idempotent thanks to a `FirstOrDefault` guard, and **L2E
exists to keep that guard honest** — it reads a 335-node tree three times and asserts the count is
stable (335, 335, 335).

If a future change removes that guard, L2E fails rather than the tree quietly growing in production.

---

## Verified escape hatch

`SheshaRedis__L1Enabled=false` was confirmed to disable L1 end to end: no L1 stores registered, no
invalidation subscription, and the coherence tests still pass (only the six L1-specific tests fail,
as they should).

---

## Rig change forced by this work

The rig used to bind-mount the publish output so `publish.ps1` + `docker compose restart` was a
seconds-long loop. **That had to be abandoned.** Docker Desktop served stale files to the running
container — `docker exec` showed the new DLL with a matching md5, while the process kept running
code several edits old. It cost a long detour chasing a config-binding bug that did not exist.

The app is now COPYed into the image and `up.ps1` always builds. The COPY is the last layer, so the
rebuild adds about 5 seconds.

`publish.ps1` now also wipes its output directory first: `dotnet publish` skips files it considers
up to date, so a hand-edited `appsettings.json` in the output survived a republish and was baked
into the image — which is how an L1-disabling override once leaked into a full test run.

---

## Not done

Phase 3 (payload reduction — replacing the double-encoded `AbpCacheData` envelope, and slimming
`PermissionedObjectDto` for cache storage) and Phase 4 (re-profile, then decide on
`System.Text.Json`) remain open. T7 throughput is also still unbuilt, so there is no
requests-per-second figure yet — only cache hit rates and convergence latency.
