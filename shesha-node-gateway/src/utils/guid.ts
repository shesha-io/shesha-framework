import { createHash, randomUUID } from 'crypto';

/** A random GUID (v4), used for items created at runtime. */
export const newGuid = (): string => randomUUID();

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isGuid = (value: unknown): value is string =>
  typeof value === 'string' && GUID_RE.test(value);

/**
 * Derives a stable GUID from a key (md5, formatted as v4-shaped).
 *
 * Configuration Studio nodes are identified by GUID, but the gateway keeps forms on disk
 * and configuration items under a natural key (`itemType` + `module` + `name`). Deriving
 * the id from that key means ids survive restarts — including on the default `:memory:`
 * database — so bookmarks, caches and open designer documents keep resolving.
 */
export const guidFrom = (key: string): string => {
  const hex = createHash('md5').update(key).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

/** Canonical id for a module tree node. */
export const moduleId = (moduleName: string): string => guidFrom(`shesha:module:${moduleName}`);

/** Canonical id for a non-form configuration item (forms carry their own id in the JSON). */
export const configItemId = (itemType: string, module: string, name: string): string =>
  guidFrom(`shesha:config-item:${itemType}:${module}:${name}`);

/** Canonical id for a configuration folder. */
export const folderId = (module: string, parentId: string | null, name: string): string =>
  guidFrom(`shesha:folder:${module}:${parentId ?? ''}:${name}`);
