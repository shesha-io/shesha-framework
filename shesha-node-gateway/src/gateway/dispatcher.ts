import { Request, RequestHandler, Response } from 'express';
import { config } from '../config';
import { success, failure, GatewayError } from '../abp/ajaxResponse';
import { verifyAccessToken, AccessClaims } from '../auth/jwt';
import { OperationDefinition } from '../config/types';
import { BackendRegistry } from '../adapter/backends';
import { OperationMap } from '../adapter/operationMap';
import { applyMap, resolveValue } from '../adapter/transform';
import { GatewayRequestContext, isProxyFallbackResponse, isRawFileResponse, NativeRegistry } from './native';

export interface DispatcherDeps {
  operations: OperationMap;
  backends: BackendRegistry;
  natives: NativeRegistry;
  /** reverse-proxy handler for the upstream (.NET) backend, used by `proxy` mode */
  proxyHandler: RequestHandler;
}

const sendAbp = (res: Response, status: number, body: unknown): void => {
  res.status(status).json(body);
};

const extractBearer = (headers: Record<string, unknown>): string | null => {
  const raw = headers['authorization'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match ? match[1] : null;
};

const buildContext = (req: Request, op: OperationDefinition, params: Record<string, string>): GatewayRequestContext => {
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string') headers[k] = v;
    else if (Array.isArray(v)) headers[k] = v.join(', ');
  }
  const token = extractBearer(req.headers as Record<string, unknown>);
  const user: AccessClaims | null = token ? verifyAccessToken(token) : null;

  return {
    method: req.method.toUpperCase(),
    path: req.path,
    query: (req.query ?? {}) as Record<string, unknown>,
    body: (req.body ?? {}) as Record<string, unknown>,
    params,
    headers,
    token,
    user,
    operation: op,
  };
};

const is2xx = (status: number): boolean => status >= 200 && status < 300;

/**
 * The single generic dispatch routine. Every Shesha call flows through here:
 * resolve -> (native | adapter | proxy | mock) -> ABP envelope. This is what
 * makes the gateway reusable for any backend without bespoke per-route code.
 */
export const createDispatcher = (deps: DispatcherDeps): RequestHandler => {
  const { operations, backends, natives, proxyHandler } = deps;

  const runAdapter = async (ctx: GatewayRequestContext, op: OperationDefinition, res: Response): Promise<void> => {
    const adapter = op.adapter;
    if (!adapter) throw new GatewayError(500, `Operation '${op.id}' is in adapter mode but has no adapter definition`);

    const backendName = adapter.target.backend || operations.defaultBackend || '';
    const reqSource = { ...ctx, operation: op };

    const targetPath = String(resolveValue(adapter.target.path, reqSource));
    const targetMethod = String(resolveValue(adapter.target.method, reqSource));
    const targetQuery = adapter.target.query ? (applyMap(adapter.target.query, reqSource) as Record<string, unknown>) : undefined;
    const targetHeaders = adapter.target.headers ? (applyMap(adapter.target.headers, reqSource) as Record<string, string>) : undefined;
    const targetBody = adapter.target.body ? applyMap(adapter.target.body, reqSource) : undefined;

    const resp = await backends.call(backendName, {
      method: targetMethod,
      path: targetPath,
      query: targetQuery,
      headers: targetHeaders,
      body: targetBody,
      callerToken: ctx.token,
    });

    const okStatuses = adapter.successStatuses ?? [];
    const ok = okStatuses.length ? okStatuses.includes(resp.status) : is2xx(resp.status);

    if (adapter.passthroughEnvelope) {
      sendAbp(res, resp.status, resp.body);
      return;
    }

    if (!ok) {
      let message = `Backend '${backendName}' returned ${resp.status}`;
      if (resp.body && typeof resp.body === 'object' && 'message' in resp.body) {
        const m = (resp.body as { message?: unknown }).message;
        if (typeof m === 'string' && m) message = m;
      }
      throw new GatewayError(resp.status, message, { details: `${targetMethod} ${targetPath}` });
    }

    const respSource = { status: resp.status, headers: resp.headers, body: resp.body };
    const result = adapter.response ? applyMap(adapter.response, respSource) : resp.body;
    sendAbp(res, 200, success(result));
  };

  return async (req: Request, res: Response): Promise<void> => {
    const resolved = operations.resolve(req.method, req.path);

    // No explicit operation: fall back to the configured default mode.
    if (!resolved) {
      if (operations.defaultMode === 'proxy') {
        proxyHandler(req, res, () => sendAbp(res, 404, failure({ message: `No route for ${req.method} ${req.path}` })));
        return;
      }
      sendAbp(res, 404, failure({ message: `No operation mapped for ${req.method} ${req.path}` }));
      return;
    }

    const { operation, params } = resolved;

    // `proxy` mode: transparently reverse-proxy to the upstream backend.
    if (operation.mode === 'proxy') {
      proxyHandler(req, res, () => sendAbp(res, 502, failure({ message: 'Proxy handler did not respond' })));
      return;
    }

    const ctx = buildContext(req, operation, params);

    try {
      if (operation.requiresAuth && !ctx.user) {
        throw new GatewayError(401, 'You are not authenticated', { unAuthorizedRequest: true });
      }

      switch (operation.mode) {
        case 'native': {
          const key = operation.native ?? operation.id;
          const handler = natives.get(key);
          if (!handler) throw new GatewayError(501, `No native handler registered for '${key}'`);
          const result = await handler(ctx);
          // A wildcard route declined the call: let the upstream answer it instead of 501-ing.
          if (isProxyFallbackResponse(result)) {
            if (config.logLevel === 'debug')
              // eslint-disable-next-line no-console
              console.debug(`[gateway] ${req.method} ${req.path} -> upstream (${result.reason})`);
            proxyHandler(req, res, () =>
              sendAbp(res, 502, failure({ message: 'Proxy handler did not respond' })),
            );
            return;
          }
          // File downloads bypass the ABP envelope (the client reads a blob).
          if (isRawFileResponse(result)) {
            res.status(200);
            res.setHeader('Content-Type', result.contentType ?? 'application/json');
            if (result.fileName)
              res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
            res.send(result.content);
            return;
          }
          sendAbp(res, 200, success(result));
          return;
        }
        case 'adapter': {
          await runAdapter(ctx, operation, res);
          return;
        }
        case 'mock': {
          const status = operation.mock?.status ?? 200;
          sendAbp(res, status, success(operation.mock?.result ?? null));
          return;
        }
        default:
          throw new GatewayError(500, `Unsupported mode '${operation.mode}' for operation '${operation.id}'`);
      }
    } catch (err) {
      if (err instanceof GatewayError) {
        sendAbp(res, err.status, err.toAjax());
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error(`[gateway] ${req.method} ${req.path} failed:`, message);
      sendAbp(res, 500, failure({ message: 'Internal gateway error', details: message }));
    }
  };
};
