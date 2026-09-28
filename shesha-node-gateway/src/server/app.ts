import express, { Express } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config, loadBackends, loadOperations } from '../config';
import { BackendRegistry } from '../adapter/backends';
import { OperationMap } from '../adapter/operationMap';
import { createDispatcher } from '../gateway/dispatcher';
import { NativeRegistry } from '../gateway/native';
import { createStatusRouter } from '../gateway/status';
import { registerBootstrapHandlers, registerGenericRoutes } from '../modules';

export interface BuiltApp {
  app: Express;
  operations: OperationMap;
  backends: BackendRegistry;
  natives: NativeRegistry;
}

export const buildApp = (): BuiltApp => {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
      credentials: true,
      exposedHeaders: ['content-disposition', 'abp-token-refreshtime'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Abp.TenantId',
        '.AspNetCore.Culture',
        'sha-frontend-application',
        'X-Requested-With',
      ],
    }),
  );
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Data-driven wiring.
  const backends = new BackendRegistry(loadBackends().backends);
  const operations = new OperationMap(loadOperations());
  const natives = new NativeRegistry();
  registerBootstrapHandlers(natives);
  registerGenericRoutes(natives);

  // Reverse proxy to the upstream (.NET) backend for `proxy` mode / default passthrough.
  const proxyHandler = createProxyMiddleware({
    target: config.upstreamUrl,
    changeOrigin: true,
    xfwd: true,
  });

  // Health + status take precedence over the generic dispatcher.
  app.use(createStatusRouter({ operations, backends, natives, startedAt: Date.now() }));

  // The single generic dispatcher for every Shesha API call.
  const dispatcher = createDispatcher({ operations, backends, natives, proxyHandler });
  app.all('*', dispatcher);

  return { app, operations, backends, natives };
};
