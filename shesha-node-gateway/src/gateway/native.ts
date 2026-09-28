import { OperationDefinition } from '../config/types';
import { AccessClaims } from '../auth/jwt';

/** Everything a native handler (or the transform engine) needs about a request. */
export interface GatewayRequestContext {
  method: string;
  path: string;
  query: Record<string, unknown>;
  body: Record<string, unknown>;
  /** path params captured by the operation map (`:name` and `wildcard`) */
  params: Record<string, string>;
  headers: Record<string, string>;
  /** raw bearer token (no scheme), if present */
  token: string | null;
  /** decoded access-token claims when the token is valid */
  user: AccessClaims | null;
  operation: OperationDefinition;
}

/**
 * A native handler returns the Shesha `result` payload; the dispatcher wraps it
 * in the ABP envelope. Throw a GatewayError to return a structured failure.
 */
export type NativeHandler = (ctx: GatewayRequestContext) => Promise<unknown> | unknown;

/**
 * Escape hatch for the handful of Shesha endpoints that return a file rather than JSON
 * (`FormConfiguration/GetJson`, `ConfigurationStudio/GetRevisionJson`). The frontend asks
 * for `responseType: 'blob'` and reads the file name from `Content-Disposition`, so these
 * must bypass the ABP envelope.
 */
export interface RawFileResponse {
  readonly __rawFile: true;
  content: string | Buffer;
  contentType?: string;
  fileName?: string;
}

export const rawFile = (
  content: string | Buffer,
  opts: { contentType?: string; fileName?: string } = {},
): RawFileResponse => ({
  __rawFile: true,
  content,
  contentType: opts.contentType ?? 'application/json',
  fileName: opts.fileName,
});

export const isRawFileResponse = (value: unknown): value is RawFileResponse =>
  typeof value === 'object' && value !== null && (value as { __rawFile?: unknown }).__rawFile === true;

/**
 * Escape hatch for wildcard routes.
 *
 * A catch-all like `/api/services/:serviceModule/:service/:action` can only claim the services it
 * actually knows about. Returning this marker tells the dispatcher to hand the request to the
 * upstream instead of answering 501 — which is what keeps "transition via config" honest: an
 * unmapped service still reaches the .NET backend rather than breaking.
 */
export interface ProxyFallbackResponse {
  readonly __proxyFallback: true;
  /** included in the debug log so a missing resource is easy to spot */
  readonly reason: string;
}

export const proxyFallback = (reason: string): ProxyFallbackResponse => ({ __proxyFallback: true, reason });

export const isProxyFallbackResponse = (value: unknown): value is ProxyFallbackResponse =>
  typeof value === 'object' && value !== null && (value as { __proxyFallback?: unknown }).__proxyFallback === true;

/** Registry of native handlers keyed by `operation.native`. */
export class NativeRegistry {
  private readonly map = new Map<string, NativeHandler>();

  register(key: string, handler: NativeHandler): void {
    this.map.set(key, handler);
  }

  registerAll(entries: Record<string, NativeHandler>): void {
    for (const [k, v] of Object.entries(entries)) this.map.set(k, v);
  }

  get(key: string): NativeHandler | undefined {
    return this.map.get(key);
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  keys(): string[] {
    return [...this.map.keys()];
  }
}
