# Issue #4904 - Azure App Service health check endpoints

Branch: `nhlakanipho/en/4904`

## Scope

Two anonymous endpoints, provided by `Shesha.Application` and mapped by `Shesha.Web.Host`, split so that Azure App Service Health Check pings
a path with no dependencies and never auto-recycles instances over a transient database outage:

| Path | Checks | For |
|---|---|---|
| `/api/health/live` | none | Azure App Service Health Check |
| `/api/health/ready` | `Person` query over the app's own NHibernate session | internal monitoring only |

## What changed

| File | Change |
|---|---|
| `Shesha.Application/HealthChecks/SheshaHealthCheckExtensions.cs` | `AddSheshaHealthChecks()` registers the `person-db` check tagged `ready`; `MapSheshaHealthChecks()` maps both paths |
| `Shesha.Web.Host/Startup/Startup.cs` | calls both extensions |
| `Shesha.Application/HealthChecks/PersonReadinessHealthCheck.cs` | runs the probe, bounded to 3s, one at a time |
| `Shesha.Application/HealthChecks/IPersonReadinessProbe.cs`, `PersonReadinessProbe.cs` | the `Person` DB query, constructor-injected so tests mock it |
| `Shesha.Application/HealthChecks/SheshaHealthCheckResponseWriter.cs` | sanitized JSON payload |
| `Shesha.Tests/HealthChecks/*` | 7 tests |
| `shesha-core/docs/health-checks.md`, `shesha-core/README.md` | documentation |

## The defect found while verifying, and the fix

The readiness probe's 3-second timeout did not work. `CheckHealthAsync` raced the probe against
`Task.Delay(3s)`, but `ProbeDatabaseAsync` blocks before it yields, so it ran to completion before
ever handing back a task. The race was therefore set up only after the blocking work had already
finished - `Task.Delay` never got to win.

The blocking frame is `IUnitOfWorkManager.Begin()`, confirmed by the logged stack: NHibernate opens
the ADO connection when it begins the transaction, before the query is ever reached.

```
WARN ... PersonReadinessHealthCheck - Readiness probe failed: database not reachable.
System.AggregateException: One or more errors occurred. (Begin failed with SQL exception)
 ---> NHibernate.TransactionException: Begin failed with SQL exception
```

Fix: run the probe on a thread-pool thread so `CheckHealthAsync` reaches the race immediately.

```csharp
var probeTask = Task.Run(() => ProbeDatabaseAsync(timeoutCts.Token), timeoutCts.Token);
var timeoutTask = Task.Delay(ProbeTimeout, timeoutCts.Token);
```

Note this is not something ASP.NET Core's built-in per-check `timeout:` could have solved.
`DefaultHealthCheckService` bounds a check by cancelling a token and awaiting the check anyway; a
probe that never observes the token is never cut short. The explicit race is what actually returns.

## Second finding, from review: probe accumulation

Offloading the probe fixed the response time but moved the cost onto a thread-pool thread, which
stays blocked until the connection attempt gives up (~27s after the response). One such probe per
request would accumulate for as long as the database stayed unreachable - at a 1s poll interval,
~30 blocked pool threads, enough to starve the app.

Contained with a single-flight gate: requests arriving while a probe is in flight join it instead
of starting another, so the cost is one probe regardless of poll rate, and the second and later
requests answer immediately instead of waiting out their own 3s. The check is registered as a
singleton (`services.AddSingleton<PersonReadinessHealthCheck>()`, inside `AddSheshaHealthChecks()`)
so the gate is process-wide; `AddCheck<T>` resolves through `GetServiceOrCreateInstance`, so it
picks up that registration.

## Third finding, from review: location and dependency injection

- `Shesha.Web.Host` is a test host that downstream applications never reference, so the check,
  probe and response writer moved to `Shesha.Application`, behind `AddSheshaHealthChecks()` /
  `MapSheshaHealthChecks()`.
- Manual resolution through `IIocResolver.ResolveAsDisposable` was replaced by constructor
  injection. The DB query now lives in `PersonReadinessProbe` (`IPersonReadinessProbe`), which takes
  `IUnitOfWorkManager` and `IRepository<Person, Guid>` in its constructor; the check takes the probe.
  Neither standard implementation is disposable, so there is nothing to release.
- The singleton check therefore holds one probe, and with it one unit-of-work manager and
  repository, for the process lifetime. That is safe: `NhRepositoryBase` reads `Session` from the
  current unit of work on every access, and `UnitOfWorkManager` keeps no state of its own.
- All 7 tests now mock `IPersonReadinessProbe`; none needs a database or Docker (~6s).

## Evidence

Host: `Shesha.Web.Host` on `http://localhost:21021`, SQL Server 2025 in Docker (`sheshadb-sql`).
A hung database was simulated with `docker pause sheshadb-sql`, which drops packets rather than
refusing connections - the case a timeout has to cover.

The hung-database runs below predate the third finding's refactor. After it, only the healthy path
was re-run on the real host: `/live` 200 in 0.022s, `/ready` 200 in 0.218s (first request after
start-up), with the same payloads as below.

### Database healthy

```
$ curl -i http://localhost:21021/api/health/live          # no Authorization header
HTTP/1.1 200 OK
{"status":"Healthy"}

$ curl -i http://localhost:21021/api/health/ready         # no Authorization header
HTTP/1.1 200 OK
{"status":"Healthy","checks":[{"name":"person-db","status":"Healthy","description":null}]}

  /live   200  0.024s   0.003s   0.003s
  /ready  200  0.057s   0.026s   0.015s
```

### Database hung - before the fix

```
  live   200  0.011s   0.007s
  ready  503  35.127s          <-- Connection Timeout=30, not the 3s ProbeTimeout
  ready  503  5.878s
  ready  503  0.018s
```

Neither bounded nor consistent. The 35s first response is the connection string's
`Connection Timeout`; the 5.9s and 0.018s that follow are SqlClient's pool-blocking period after
the first failure.

### Database hung - after the fix

```
  live   200  0.019s   0.011s
  ready  503  3.084s
  ready  503  3.041s
  ready  503  3.034s
  ready  503  3.048s
  ready  503  3.057s

{"status":"Unhealthy","checks":[{"name":"person-db","status":"Unhealthy","description":"Database unreachable"}]}
```

Bounded at `ProbeTimeout` and consistent across repeats. `/live` is unaffected throughout, which
is the entire point of the split.

### Database hung - single-flight containment

Six requests during one outage: four concurrent, then two more staggered after they returned.

```
  concurrent-1  503  3.109s        staggered-5  503  3.022s
  concurrent-2  503  3.100s        staggered-6  503  3.031s
  concurrent-3  503  3.083s        live         200  0.006s
  concurrent-4  503  3.068s
```

All six bounded at ~3.0s, `/live` unaffected. The log then shows the containment directly: the
per-probe failure is logged once for the whole outage, not once per request.

```
$ grep -c "Readiness probe failed" Logs.txt   # logged once per probe that actually ran
1
```

(`Logs.txt` appends across restarts, so the per-request "timed out" count in it spans earlier runs
too; the per-probe message is new in this change and so counts only this outage.)

### Recovery

```
$ docker unpause sheshadb-sql
  ready  200  0.104s   0.162s
```

## Acceptance criteria

| Criterion | Result |
|---|---|
| `/live` exists, anonymous, no dependency checks, 200 + small JSON | Pass - `200`, `{"status":"Healthy"}`, no `Authorization` header sent |
| `/ready` exists, anonymous, 200 when DB reachable, 503 when not | Pass - `200` / `503` above |
| `/ready` probes the `Person` entity | Pass - `GetAllAsync()` + `AnyAsync()`, the ticket's "equivalent lightweight query"; cheaper than `GetFirstOrDefault` since it materialises no entity |
| Failures leak no connection strings or stack traces | Pass - body carries only `"Database unreachable"`; covered by two tests that assert a planted `Password=hunter2;` never appears |
| Both excluded from global auth filters | Pass - `MapHealthChecks` endpoints are not MVC actions, so `SheshaAuthorizationFilter` (which returns early for non-controller actions) and `ApiAuthorizationHelper`'s default-deny never apply; there is no `FallbackPolicy` anywhere in `shesha-core` |
| Both respond consistently fast under normal load | Pass - 3-56ms healthy; and now bounded at ~3.05s even with the DB hung |
| Documented incl. "point Azure at /live, not /ready" | Pass - `shesha-core/docs/health-checks.md` |

## Known limitations (documented, not fixed)

- If the database is unreachable *during startup*, ABP module initialization fails before the
  request pipeline is registered, so neither endpoint exists to answer. Startup-time constraint of
  the ABP/NHibernate bootstrap.
- An abandoned probe holds a thread, an NHibernate session and a connection attempt until it gives
  up (up to `Connection Timeout`). Bounded to one at a time by the single-flight gate, so it does
  not scale with how hard `/ready` is polled.
- Downstream applications get the endpoints only once their own `Startup` calls
  `AddSheshaHealthChecks()` and `MapSheshaHealthChecks()`. Adding those calls to the starter
  template would be a separate change.
