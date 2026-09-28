import { config } from './config';
import { migrate } from './db';
import { seed } from './db/seed';
import { buildApp } from './server/app';

const bootstrap = async (): Promise<void> => {
  // 1. Data layer (native fallback persistence).
  migrate();
  if (config.db.seed) {
    await seed();
  }

  // 2. Build the data-driven gateway app.
  const { app, operations, backends } = buildApp();

  // 3. Listen.
  app.listen(config.port, config.host, () => {
    const ops = operations.all();
    // eslint-disable-next-line no-console
    console.log('────────────────────────────────────────────────────────────');
    // eslint-disable-next-line no-console
    console.log('  Shesha Node Gateway (backend-agnostic integration layer)');
    // eslint-disable-next-line no-console
    console.log(`  Listening on      : http://${config.host}:${config.port}`);
    // eslint-disable-next-line no-console
    console.log(`  Upstream (.NET)   : ${config.upstreamUrl}`);
    // eslint-disable-next-line no-console
    console.log(`  Operations mapped : ${ops.length} (default mode: ${operations.defaultMode})`);
    // eslint-disable-next-line no-console
    console.log(`  Backends registry : ${backends.list().map((b) => b.name).join(', ') || '(none)'}`);
    // eslint-disable-next-line no-console
    console.log(`  Health / status   : GET /health , GET /api/gateway/status`);
    // eslint-disable-next-line no-console
    console.log('  Point the React app BACKEND_URL at this gateway to transition.');
    // eslint-disable-next-line no-console
    console.log('────────────────────────────────────────────────────────────');
  });
};

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[gateway] failed to start:', err);
  process.exit(1);
});
