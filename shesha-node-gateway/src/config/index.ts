import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { BackendsConfig, OperationsConfig, ResourcesConfig } from './types';

dotenv.config();

const projectRoot = path.resolve(__dirname, '..', '..');

const toBool = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const toInt = (value: string | undefined, fallback: number): number => {
  const n = value === undefined ? NaN : parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

export interface GatewayConfig {
  port: number;
  host: string;
  nodeEnv: string;
  upstreamUrl: string;
  jwt: {
    secret: string;
    issuer: string;
    audience: string;
    accessTokenTtlSeconds: number;
    refreshTokenTtlSeconds: number;
  };
  db: {
    path: string;
    seed: boolean;
  };
  configDir: string;
  corsOrigins: string[];
  logLevel: string;
}

const corsOrigins = (process.env.CORS_ORIGINS ?? '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const config: GatewayConfig = {
  port: toInt(process.env.PORT, 21022),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  upstreamUrl: process.env.SHESHA_UPSTREAM_URL ?? 'http://localhost:21021',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'shesha-node-gateway-dev-secret',
    issuer: process.env.JWT_ISSUER ?? 'shesha-node-gateway',
    audience: process.env.JWT_AUDIENCE ?? 'shesha-app',
    accessTokenTtlSeconds: toInt(process.env.ACCESS_TOKEN_TTL_SECONDS, 3600),
    refreshTokenTtlSeconds: toInt(process.env.REFRESH_TOKEN_TTL_SECONDS, 604800),
  },
  db: {
    path: process.env.DB_PATH ?? ':memory:',
    seed: toBool(process.env.DB_SEED, true),
  },
  configDir: process.env.CONFIG_DIR
    ? path.resolve(process.cwd(), process.env.CONFIG_DIR)
    : path.resolve(projectRoot, 'config'),
  corsOrigins,
  logLevel: process.env.LOG_LEVEL ?? 'info',
};

const readJson = <T>(file: string, fallback: T): T => {
  const full = path.join(config.configDir, file);
  if (!fs.existsSync(full)) {
    // eslint-disable-next-line no-console
    console.warn(`[config] ${full} not found, using fallback`);
    return fallback;
  }
  return JSON.parse(fs.readFileSync(full, 'utf-8')) as T;
};

export const loadBackends = (): BackendsConfig =>
  readJson<BackendsConfig>('backends.json', { backends: [] });

export const loadOperations = (): OperationsConfig =>
  readJson<OperationsConfig>('operations.json', { defaultMode: 'native', operations: [] });

/**
 * Resource registry for the generic app-service route.
 *
 * Read on first use and cached by mtime, so editing `config/resources.json` takes effect on the
 * next request without a restart — the same runtime-editable behaviour `config/forms` has.
 * A missing or broken file degrades to an empty registry (the wildcard route then forwards
 * everything upstream) rather than taking the gateway down.
 */
let resourcesCache: { mtimeMs: number; config: ResourcesConfig } | null = null;

export const loadResources = (): ResourcesConfig => {
  const full = path.join(config.configDir, 'resources.json');
  if (!fs.existsSync(full)) return { resources: [] };

  const mtimeMs = fs.statSync(full).mtimeMs;
  if (resourcesCache && resourcesCache.mtimeMs === mtimeMs) return resourcesCache.config;

  try {
    const parsed = JSON.parse(fs.readFileSync(full, 'utf-8')) as ResourcesConfig;
    const loaded: ResourcesConfig = { resources: Array.isArray(parsed.resources) ? parsed.resources : [] };
    resourcesCache = { mtimeMs, config: loaded };
    return loaded;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[config] ${full} is not valid JSON, resource registry disabled:`, err);
    return resourcesCache?.config ?? { resources: [] };
  }
};

/** Shape of a Form configuration item as the frontend's `FormConfigurationDto` expects it. */
export interface FormConfigurationSeed {
  id: string;
  module: string;
  name: string;
  label?: string | null;
  description?: string | null;
  /** Serialized `{ components, formSettings }` — the frontend does `JSON.parse(markup)`. */
  markup: string;
  modelType?: string | null;
  access?: number | null;
  permissions?: string[];
}

export { projectRoot };
