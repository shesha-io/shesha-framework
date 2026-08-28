# Issue #4623 — security response headers

Branch: `fix/4623-security-headers-all-hosts` (based on `main`)

## Why the headers were still wrong

@yuliaGradova tested `main` and found `Referrer-Policy` and `Permissions-Policy` missing, plus
`X-Frame-Options: SAMEORIGIN` and `X-XSS-Protection: 1; mode=block` instead of the expected values.
@zukidlomo had already reported the same: the fix never reached the functional-test app.

On `main` only two of the three hosts had the middleware:

| Host | Before | After |
|---|---|---|
| `Shesha.Web.Host` | `app.UseSecurityHeaders()`, registered first | unchanged |
| `Boxfusion.SheshaFunctionalTests.Web.Host` (the environment that was tested) | **nothing** | `app.UseSecurityHeaders()`, registered first |
| starter template | inline middleware, registered late, plain header assignment | inline middleware moved to the front and moved into `Response.OnStarting` |

The starter keeps its own inline copy on purpose — it builds against the published
`Shesha.Framework` 0.40.0 package, which does not contain `UseSecurityHeaders()` yet.

Values written (unchanged, per the issue): `X-Content-Type-Options: nosniff`,
`X-Frame-Options: DENY`, `X-XSS-Protection: 0`,
`Referrer-Policy: strict-origin-when-cross-origin`,
`Permissions-Policy: camera=(), microphone=(), geolocation=()`.
No HSTS and no CSP — deliberately out of scope for this issue.

`Shesha.Extensions.SheshaMiddlewareExtensions.UseSecurityHeaders` sets the headers inside
`Response.OnStarting`, which runs after every other middleware has finished with the response, so
values set elsewhere in the app are replaced rather than merged.

## Test 1 — headers on the API

Deploy the branch to the functional-test API, then:

```bash
curl -s -D - -o /dev/null https://<api-host>/swagger/index.html | grep -iE "^(x-|referrer|permissions)"
```

- [ ] `x-content-type-options: nosniff`
- [ ] `x-frame-options: DENY`
- [ ] `x-xss-protection: 0`
- [ ] `referrer-policy: strict-origin-when-cross-origin`
- [ ] `permissions-policy: camera=(), microphone=(), geolocation=()`

Repeat against several response types — all of them must carry the headers:

- [ ] an authenticated API call (200)
- [ ] an unauthenticated API call (401)
- [ ] a validation error (400) and a server error (500) if you can trigger one
- [ ] a static file
- [ ] the Elmah page and the GraphQL playground

**Fail:** `SAMEORIGIN` or `1; mode=block` still present, or any header missing. If they persist after
this deploy, the values are being injected outside the application (reverse proxy / App Service
platform setting) — say so in the ticket, it then needs a platform change, not a code change.

## Test 2 — the app still works with the headers on

`X-Frame-Options: DENY` means the app can no longer be embedded in an iframe by anyone, including
itself.

- [ ] Log in and click through the main screens — no blank panels, no console errors about frames.
- [ ] Anything that uses an iframe (embedded reports, document/PDF preview, rich text editors,
      the Hangfire dashboard, the Elmah UI, Swagger "try it out") still renders.
- [ ] File download and file upload still work.
- [ ] The front end (separate host) still calls the API — CORS unaffected.

## Test 3 — starter template

- [ ] Build and run the starter backend.
- [ ] Same `curl` check as Test 1 — all five headers present with the same values.

## Notes

- If an app legitimately needs to be framed, `X-Frame-Options` has to become configurable —
  raise it as a separate ticket rather than loosening it here.
