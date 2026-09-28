import { BackendDefinition } from '../config/types';
import { GatewayError } from '../abp/ajaxResponse';

export interface BackendResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export interface CallOptions {
  method: string;
  /** absolute or backend-relative path (already templated) */
  path: string;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: unknown;
  /** the caller's Shesha bearer token (without scheme) */
  callerToken?: string | null;
  timeoutMs?: number;
}

const buildQuery = (query?: Record<string, unknown>): string => {
  if (!query) return '';
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    usp.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
};

const joinUrl = (baseUrl: string, p: string): string => {
  const b = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const suffix = p.startsWith('/') ? p : `/${p}`;
  return `${b}${suffix}`;
};

/** Registry of named upstream backends. Any language that speaks HTTP works. */
export class BackendRegistry {
  private readonly map = new Map<string, BackendDefinition>();

  constructor(backends: BackendDefinition[]) {
    for (const b of backends) this.map.set(b.name, b);
  }

  list(): BackendDefinition[] {
    return [...this.map.values()];
  }

  get(name: string): BackendDefinition {
    const b = this.map.get(name);
    if (!b) throw new GatewayError(500, `Unknown backend '${name}'. Register it in config/backends.json.`);
    return b;
  }

  has(name: string): boolean {
    return this.map.has(name);
  }

  private authHeaders(backend: BackendDefinition, callerToken?: string | null): Record<string, string> {
    const auth = backend.auth ?? { type: 'none' };
    const withScheme = (scheme: string | undefined, token: string): string =>
      scheme ? `${scheme} ${token}` : token;
    switch (auth.type) {
      case 'bearer-passthrough':
        return callerToken ? { Authorization: `Bearer ${callerToken}` } : {};
      case 'static-bearer':
        return auth.token ? { Authorization: withScheme(auth.scheme ?? 'Bearer', auth.token) } : {};
      case 'header':
        return auth.token ? { [auth.header ?? 'Authorization']: withScheme(auth.scheme ?? 'Bearer', auth.token) } : {};
      default:
        return {};
    }
  }

  /** Execute a call against a named backend and normalize the response. */
  async call(backendName: string, opts: CallOptions): Promise<BackendResponse> {
    const backend = this.get(backendName);
    const url = joinUrl(backend.baseUrl, opts.path) + buildQuery(opts.query);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(backend.headers ?? {}),
      ...this.authHeaders(backend, opts.callerToken),
      ...(opts.headers ?? {}),
    };

    const hasBody = opts.body !== undefined && opts.body !== null && opts.method.toUpperCase() !== 'GET';
    if (hasBody && !Object.keys(headers).some((h) => h.toLowerCase() === 'content-type')) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      opts.timeoutMs ?? backend.timeoutMs ?? 30000,
    );

    try {
      const res = await fetch(url, {
        method: opts.method.toUpperCase(),
        headers,
        body: hasBody ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });

      const respHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => (respHeaders[k] = v));

      const text = await res.text();
      let body: unknown = text;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }
      return { status: res.status, headers: respHeaders, body };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new GatewayError(502, `Backend '${backendName}' call failed: ${message}`, {
        details: `${opts.method.toUpperCase()} ${url}`,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Lightweight connectivity probe used by the health/status endpoint. */
  async probe(backendName: string): Promise<{ ok: boolean; status?: number; error?: string; ms: number }> {
    const backend = this.get(backendName);
    const started = Date.now();
    try {
      const res = await fetch(joinUrl(backend.baseUrl, backend.healthPath ?? '/'), {
        method: 'GET',
        signal: AbortSignal.timeout(backend.timeoutMs ?? 5000),
      });
      return { ok: res.ok, status: res.status, ms: Date.now() - started };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err), ms: Date.now() - started };
    }
  }
}
