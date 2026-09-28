import { ResourceDefinition } from '../config/types';
import { GatewayRequestContext, NativeHandler, proxyFallback } from '../gateway/native';
import { dispatchResource, findResource } from './resourceRouter';

/**
 * The dynamic-entity route: `/api/dynamic/{module}/{entity}/Crud/{action}`.
 *
 * shesha-core generates this URL for every entity (`DefaultEntityActionRouteProvider` builds
 * `api/dynamic/{moduleName}/{entityType.Name}/Crud/{action.ActionName}`), including entities that
 * only ever existed in the Entity Designer. That is why it is one operation rather than one per
 * entity: the set of entities is data, so the route has to be too.
 *
 * Resolution goes through the *same* registry the `/api/services/...` wildcard uses. An entity that
 * has a registered resource gets that resource's storage, permissions and named actions — which is
 * what keeps `/api/dynamic/Shesha/Module/Crud/Get` reading the authoritative `modules` table
 * instead of a parallel copy in the generic row store. Anything unregistered falls back to a
 * synthesized `entity` resource, so a brand-new designer entity works with no configuration at all.
 */

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

/** Builds the resource an unregistered entity is served through. */
const synthesizedResource = (moduleName: string, entityName: string): ResourceDefinition => ({
  service: entityName,
  serviceModule: moduleName,
  description: `Dynamic entity ${moduleName}.${entityName} (generic row store)`,
  storage: { kind: 'entity', module: moduleName, entity: entityName },
});

export const dynamicCrudDispatch: NativeHandler = (ctx) => {
  const moduleName = str(ctx.params.module);
  const entityName = str(ctx.params.entity);
  const action = str(ctx.params.action);

  if (!moduleName || !entityName || !action) {
    return proxyFallback('malformed dynamic CRUD route');
  }

  const resource = findResource(moduleName, entityName) ?? synthesizedResource(moduleName, entityName);
  return dispatchResource(ctx, resource, action);
};
