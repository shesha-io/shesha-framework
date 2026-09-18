# Issue #4904 - Azure App Service health check endpoints

Branch: `nhlakanipho/en/4904`

## Scope

Two anonymous endpoints on `Shesha.Web.Host`, split so that Azure App Service Health Check pings
a path with no dependencies and never auto-recycles instances over a transient database outage:

| Path | Checks | For |
|---|---|---|
| `/api/health/live` | none | Azure App Service Health Check |
| `/api/health/ready` | `Person` query over the app's own NHibernate session | internal monitoring only |

## What changed

| File | Change |
|---|---|
| `Shesha.Web.Host/Startup/Startup.cs` | registers the `person-db` check tagged `ready`, maps both paths |
| `Shesha.Web.Host/HealthChecks/PersonReadinessHealthCheck.cs` | the DB probe, bounded to 3s |
| `Shesha.Web.Host/HealthChecks/SheshaHealthCheckResponseWriter.cs` | sanitized JSON payload |
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
singleton (`services.AddSingleton<PersonReadinessHealthCheck>()`) so the gate is process-wide;
`AddCheck<T>` resolves through `GetServiceOrCreateInstance`, so it picks up that registration.

`IUnitOfWorkManager` moved out of the constructor at the same time - it is transient in ABP, so a
singleton holding one is a captive dependency. It and the repository are now resolved per probe
via `ResolveAsDisposable`, which also fixes a leak: the repository resolved from `IIocResolver` was
never released.

## Evidence

Host: `Shesha.Web.Host` on `http://localhost:21021`, SQL Server 2025 in Docker (`sheshadb-sql`).
A hung database was simulated with `docker pause sheshadb-sql`, which drops packets rather than
refusing connections - the case a timeout has to cover.

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
| `/ready` probes the `Person` entity | Pass - `GetAll().AnyAsync()`, the ticket's "equivalent lightweight query"; cheaper than `GetFirstOrDefault` since it materialises no entity |
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
- The endpoints live in `Shesha.Web.Host`, which downstream applications do not reference. They
  reach the framework's own host only. Promoting them to a packaged project plus the starter
  template would be a separate change.
