import { Router } from 'express';
import { config } from '../config';
import { BackendRegistry } from '../adapter/backends';
import { OperationMap } from '../adapter/operationMap';
import { registeredBehaviours, registeredServices } from '../modules/resourceRouter';
import { NativeRegistry } from './native';

export interface StatusDeps {
  operations: OperationMap;
  backends: BackendRegistry;
  natives: NativeRegistry;
  startedAt: number;
}

/**
 * Health + gateway status ("check"). Reports the full route table with each
 * operation's mode and mapped backend, plus live connectivity probes so you can
 * verify a config-driven transition at a glance.
 */
export const createStatusRouter = (deps: StatusDeps): Router => {
  const { operations, backends, natives, startedAt } = deps;
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptimeSeconds: Math.round((Date.now() - startedAt) / 1000) });
  });

  router.get('/api/gateway/status', async (_req, res) => {
    const ops = operations.all().map((op) => ({
      id: op.id,
      method: op.shesha.method.toUpperCase(),
      path: op.shesha.path,
      mode: op.mode,
      backend: op.adapter?.target.backend ?? (op.mode === 'adapter' ? operations.defaultBackend : undefined),
      native: op.mode === 'native' ? (op.native ?? op.id) : undefined,
      nativeAvailable: op.mode === 'native' ? natives.has(op.native ?? op.id) : undefined,
      requiresAuth: Boolean(op.requiresAuth),
      tags: op.tags ?? [],
    }));

    const modeCounts = ops.reduce<Record<string, number>>((acc, o) => {
      acc[o.mode] = (acc[o.mode] ?? 0) + 1;
      return acc;
    }, {});

    const backendReports = await Promise.all(
      backends.list().map(async (b) => ({
        name: b.name,
        baseUrl: b.baseUrl,
        description: b.description,
        ...(await backends.probe(b.name)),
      })),
    );

    res.json({
      gateway: {
        name: '@shesha-io/node-gateway',
        nodeEnv: config.nodeEnv,
        upstreamUrl: config.upstreamUrl,
        defaultMode: operations.defaultMode,
        defaultBackend: operations.defaultBackend,
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      },
      modeCounts,
      // The generic routes are data, so the data is what has to be inspectable: which services
      // `appService.dispatch` will answer for, and which behaviours a resource may name.
      resources: registeredServices(),
      behaviours: registeredBehaviours(),
      backends: backendReports,
      operations: ops,
    });
  });

  // Lightweight route table without live probes (fast, no network).
  router.get('/api/gateway/operations', (_req, res) => {
    res.json({
      defaultMode: operations.defaultMode,
      operations: operations.all().map((op) => ({
        id: op.id,
        method: op.shesha.method.toUpperCase(),
        path: op.shesha.path,
        mode: op.mode,
      })),
    });
  });

  return router;
};
