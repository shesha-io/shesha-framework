# Health check endpoints

`Shesha.Web.Host` exposes two health check endpoints, registered in `Startup.cs`:

| Path | Purpose | Checks | Auth |
|---|---|---|---|
| `/api/health/live` | Liveness - is the process up? | None | Anonymous |
| `/api/health/ready` | Readiness - can the app serve requests that need the DB? | Queries the `Person` table | Anonymous |

Both return a small JSON payload, e.g. `{"status":"Healthy"}`, or on failure
`{"status":"Unhealthy","checks":[{"name":"person-db","status":"Unhealthy","description":"Database unreachable"}]}`.
Failure descriptions never include the underlying exception, connection string, or stack trace.

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

## Known limitation

Both endpoints assume the app has already finished starting. If the database is unreachable
*during startup*, ABP's module initialization (which builds the NHibernate `SessionFactory`) can
fail before the request pipeline - including these health check routes - is ever registered, in
which case both endpoints fail regardless of the distinction above. This is a startup-time
constraint in the current ABP/NHibernate bootstrap, not something either endpoint's own logic can
route around.
