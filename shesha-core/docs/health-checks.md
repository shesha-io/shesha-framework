# Health check endpoints

`Shesha.Web.Host` exposes two health check endpoints, registered in `Startup.cs`:

| Path | Purpose | Checks | Auth |
|---|---|---|---|
| `/api/health/live` | Liveness - is the process up? | None | Anonymous |
| `/api/health/ready` | Readiness - can the app serve requests that need the DB? | Queries the `Person` table | Anonymous |

Both return a small JSON payload, e.g. `{"status":"Healthy"}`, or on failure
`{"status":"Unhealthy","checks":[{"name":"person-db","status":"Unhealthy","description":"Database unreachable"}]}`.
Failure descriptions never include the underlying exception, connection string, or stack trace.

Neither endpoint requires authentication, and neither needs a session, cookie or CSRF token. They
are mapped with `MapHealthChecks` rather than as controller actions, so `SheshaAuthorizationFilter`
and the default-deny policy in `ApiAuthorizationHelper` - both of which only apply to MVC actions -
never see them.

## Which path to point Azure at

**Use `/api/health/live` for Azure App Service Health Check.** It has no dependencies and reports
the process is up regardless of the state of the database.

**Do not point Azure App Service Health Check at `/api/health/ready`.** Azure treats consecutive
failed health check pings as a signal to recycle the instance. `/ready` fails whenever the
database is briefly unreachable (a deploy, a failover, a network blip) - exactly the kind of
transient condition auto-recycling should not react to, since recycling the app does nothing to
fix a database outage and only adds churn on top of it. `/ready` is intended for internal
monitoring (e.g. an uptime dashboard or alert that a human reviews) where a DB-down signal is
meaningful without triggering an automatic recycle.

Setting the path is an operator step - nothing in this repository configures it. Set the App
Service Health Check path to `/api/health/live` in the Azure portal (Monitoring > Health check),
or in whatever infrastructure-as-code provisions the app. Until that is done both endpoints are
served but nothing pings them.

## How the readiness probe queries the database

`PersonReadinessHealthCheck` runs `GetAll().AnyAsync()` against `Person`, through the same
NHibernate session and repository the rest of the app uses, inside an explicit unit of work.
Issue #4904 asks for "a `GetFirstOrDefault` (or equivalent lightweight query)" - `AnyAsync` is
that equivalent, and is the cheaper of the two: it emits an existence check instead of
materialising a `Person`, so there is no entity hydration, no discriminator resolution and no
lazy proxies to initialise.

## Response time when the database is down

`/api/health/live` is unaffected - it runs no checks and keeps answering `200` in a few
milliseconds, which is the whole point of the split.

`/api/health/ready` answers `503` after about 3 seconds. That bound is enforced by
`PersonReadinessHealthCheck` itself, racing the probe against a `Task.Delay`, because the probe
cannot be cancelled - the connection open it ends up in takes no `CancellationToken`. Neither
ASP.NET Core's built-in per-check `timeout:` nor the request's own cancellation token can shorten
it, since both work by cancelling a token the probe never observes.

The probe therefore also runs on a thread-pool thread. It blocks before it yields, so without that
offload the race is only set up after the blocking work has already finished, and the response
waits out the connection string's `Connection Timeout` instead - measured at 35s with
`Connection Timeout=30`, against 3.0s once offloaded.

One consequence: when a timed-out probe is abandoned, it keeps a thread, an NHibernate session and
a unit of work until its connection attempt finally gives up. At a one-minute monitoring cadence
against a dead database that is at most one or two at a time, and each one logs a warning when it
settles.

## Not the same as the startup database health check

Shesha has an older, unrelated mechanism with a confusingly similar name: `IDbHealthChecker` /
`DefaultDbHealthChecker` (`Shesha.NHibernate/NHibernate/DbHealth/`) runs the
`frwk.check_db_health` stored procedure once during `DatabaseSeeder.CheckDbHealthAsync()` and
throws if the schema has integrity problems. It is a startup-time schema check, is never routed
over HTTP, and has nothing to do with the endpoints above.

## Known limitation

Both endpoints assume the app has already finished starting. If the database is unreachable
*during startup*, ABP's module initialization (which builds the NHibernate `SessionFactory`) can
fail before the request pipeline - including these health check routes - is ever registered, in
which case both endpoints fail regardless of the distinction above. This is a startup-time
constraint in the current ABP/NHibernate bootstrap, not something either endpoint's own logic can
route around.
