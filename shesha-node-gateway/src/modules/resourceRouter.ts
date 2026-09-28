import { forbidden, notFound, unauthorized } from '../abp/ajaxResponse';
import { loadResources } from '../config';
import { ResourceDefinition } from '../config/types';
import { usersRepo } from '../db/repositories';
import { GatewayRequestContext, NativeHandler, proxyFallback } from '../gateway/native';
import { hasPermission } from '../auth/permissions';
import { behaviours } from './behaviours';
import { configItemCrud } from './crud/configItemCrud';
import { entityCrud, CrudAction } from './crud/entityCrud';
import { moduleCrud } from './crud/moduleCrud';
import { userCrud } from './crud/userCrud';

/**
 * The generic app-service router — the "single endpoint" half of the gateway.
 *
 * Instead of declaring one operation per Shesha action, `operations.json` declares ONE wildcard
 * route per verb (`/api/services/:serviceModule/:service/:action`) and this module resolves it
 * against `config/resources.json`. A resource entry says where its rows live; from that the router
 * derives the whole ABP CRUD surface (`Get`, `GetAll`, `Create`, `Update`, `Delete`) with the
 * filtering/paging/sorting contract `SheshaCrudServiceBase` implements. Anything non-standard is a
 * named behaviour.
 *
 * Two things keep this from becoming a black hole that swallows the whole API:
 *  - an unknown service or action returns `proxyFallback`, so the request still reaches the .NET
 *    upstream (the gateway stays a transition layer, not a wall);
 *  - exact operation entries outrank the wildcard, so anything needing bespoke handling is just
 *    an explicit mapping.
 */

/** Action names the router serves generically. Keys are lower-cased for matching. */
export const CRUD_ALIASES: Record<string, CrudAction> = {
  get: 'get',
  getbyid: 'get',
  query: 'get',
  getall: 'getAll',
  getlist: 'getAll',
  getallpaged: 'getAll',
  queryall: 'getAll',
  create: 'create',
  update: 'update',
  delete: 'delete',
};

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

/**
 * When a route carries no `{action}` segment (`/api/ModelConfigurations`, the ABP convention for a
 * service's default member) the verb is the action.
 */
const VERB_ACTION: Record<string, CrudAction> = {
  GET: 'get',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

/**
 * Case-insensitive resource lookup.
 *
 * A resource may omit `serviceModule` or set it to `'*'` to claim the service in every module —
 * `Sms` and `ModelConfigurations` live outside `/api/services/app/...`, and framework services are
 * reachable under both `app` and `Shesha` depending on how the caller was generated. An exact
 * module match always wins over a wildcard one, so a module-specific override is possible.
 */
export const findResource = (serviceModule: string, service: string): ResourceDefinition | undefined => {
  const wantedModule = (serviceModule || 'app').toLowerCase();
  const wantedService = service.toLowerCase();

  let wildcardMatch: ResourceDefinition | undefined;
  for (const resource of loadResources().resources) {
    if (resource.service.toLowerCase() !== wantedService) continue;
    const module = (resource.serviceModule ?? 'app').toLowerCase();
    if (module === wantedModule) return resource;
    if (module === '*' && !wildcardMatch) wildcardMatch = resource;
  }
  return wildcardMatch;
};

/**
 * Splits an app-service route into the three things the registry is keyed by.
 *
 * The wildcard operations capture these as route params, but an *exact* operation may also point at
 * `appService.dispatch` — and an exact match captures nothing, only the path. That is not a corner
 * case: `/api/ModelConfigurations/GetAll` has to outrank `/api/ModelConfigurations/:id`, and the
 * only way to outrank a param pattern is to be exact. Reading the segments off the path when the
 * params are absent keeps both shapes going through the one dispatcher.
 */
const routeSegments = (ctx: GatewayRequestContext): { serviceModule: string; service: string; action: string } => {
  const captured = str(ctx.params.service);
  if (captured) {
    return {
      serviceModule: str(ctx.params.serviceModule, 'app'),
      service: captured,
      action: str(ctx.params.action),
    };
  }

  const parts = str(ctx.path).split('?')[0].split('/').filter(Boolean);
  const isServiceModuleRoute = parts[0] === 'api' && parts[1] === 'services';
  const rest = parts.slice(isServiceModuleRoute ? 2 : 1);
  return {
    serviceModule: isServiceModuleRoute ? str(rest[0], 'app') : 'app',
    service: str(isServiceModuleRoute ? rest[1] : rest[0]),
    action: str(isServiceModuleRoute ? rest[2] : rest[1]),
  };
};

/**
 * The action a request is asking for: the `{action}` segment when the route has one, otherwise
 * inferred from the verb.
 */
export const resolveAction = (ctx: GatewayRequestContext, action?: string): string => {
  const explicit = str(action ?? ctx.params.action);
  if (explicit) return explicit;
  return VERB_ACTION[ctx.method.toUpperCase()] ?? explicit;
};

/**
 * Case-insensitive member lookup, used for `resource.actions` and `auth.actions`.
 *
 * Presence decides the match, not truthiness: in `auth.actions` an empty string is a real value
 * ("this action needs a token but no specific permission"), so a truthiness test would silently
 * fall through to the resource-level permission instead.
 */
export const pickActionKey = (map: Record<string, string> | undefined, action: string): string | undefined => {
  if (!map) return undefined;
  if (Object.prototype.hasOwnProperty.call(map, action)) return map[action];
  const lowered = action.toLowerCase();
  const key = Object.keys(map).find((name) => name.toLowerCase() === lowered);
  return key === undefined ? undefined : map[key];
};

const currentUser = (ctx: GatewayRequestContext) =>
  ctx.user ? usersRepo.findById(Number(ctx.user.sub)) : undefined;

/**
 * Enforces the resource's auth rules. The wildcard operation itself cannot declare
 * `requiresAuth` (that is per-resource), so this is where authorization actually happens.
 *
 * Shared by every generic route: an action either belongs to the anonymous set (the reset/OTP
 * flows), or it needs a token plus whatever permission the resource declares. Behaviours that need
 * to know *who* is calling go through `requireUser(ctx)` themselves, so an anonymous action can
 * still serve a logged-in user correctly.
 */
export const authorize = (ctx: GatewayRequestContext, resource: ResourceDefinition, action: string): void => {
  const auth = resource.auth ?? {};
  const lowered = action.toLowerCase();
  const anonymous =
    auth.requiresAuth === false || (auth.anonymousActions ?? []).some((name) => name.toLowerCase() === lowered);
  if (anonymous) return;

  if (!ctx.user) throw unauthorized();

  const permission = pickActionKey(auth.actions, action) ?? auth.permission;
  if (!permission) return;

  const user = currentUser(ctx);
  const granted = user ? hasPermission(usersRepo.permissionsOf(user), permission) : false;
  if (!granted) throw forbidden(`Required permission '${permission}' is not granted`);
};

/**
 * Native handler for the generic app-service routes:
 * `/api/services/:serviceModule/:service/:action`, `/api/:service/:action` and `/api/:service`.
 * All three resolve to the same thing; only the segments captured differ — and an exact operation
 * naming this handler resolves from the path instead (see `routeSegments`).
 */
export const appServiceDispatch: NativeHandler = (ctx) => {
  const { serviceModule, service, action } = routeSegments(ctx);

  const resource = findResource(serviceModule, service);
  if (!resource) {
    // Not ours — let the upstream handle it rather than failing the call.
    return proxyFallback(`no resource registered for ${serviceModule}/${service}`);
  }

  return dispatchResource(ctx, resource, resolveAction(ctx, action));
};

/**
 * Runs one action against one resource: named behaviour first, otherwise the CRUD derived from the
 * resource's storage. This is the whole of the "single endpoint" idea — every route shape that can
 * name a resource and an action ends up here, so there is exactly one place where authorization,
 * behaviour lookup and storage dispatch happen.
 */
export const dispatchResource = (
  ctx: GatewayRequestContext,
  resource: ResourceDefinition,
  action: string,
): unknown => {
  const behaviourName = pickActionKey(resource.actions, action);
  const crudAction = CRUD_ALIASES[action.toLowerCase()];

  if (!behaviourName && !crudAction) {
    return proxyFallback(`resource '${resource.service}' has no action '${action}'`);
  }

  authorize(ctx, resource, action);

  if (behaviourName) {
    const behaviour = behaviours[behaviourName];
    if (!behaviour) {
      throw notFound(`Behaviour '${behaviourName}' referenced by resource '${resource.service}' is not registered`);
    }
    return behaviour(ctx, resource);
  }

  if (resource.storage.kind === 'behaviour') {
    return proxyFallback(`resource '${resource.service}' has no generic CRUD`);
  }

  return runCrud(ctx, resource, crudAction as CrudAction);
};

/** Storage-agnostic CRUD. Each storage kind supplies the same five operations. */
export const runCrud = (ctx: GatewayRequestContext, resource: ResourceDefinition, action: CrudAction): unknown => {
  switch (resource.storage.kind) {
    case 'entity':
      return entityCrud(ctx, resource, action);
    case 'configItem':
      return configItemCrud(ctx, resource, action);
    case 'user':
      return userCrud(ctx, resource, action);
    case 'module':
      return moduleCrud(ctx, resource, action);
    default:
      return proxyFallback(`unsupported storage kind '${resource.storage.kind}'`);
  }
};

/** Every registered service name — surfaced by `/api/gateway/status` so the registry is inspectable. */
export const registeredServices = (): string[] =>
  loadResources().resources.map((resource) => `${resource.serviceModule ?? 'app'}/${resource.service}`);

/** Every behaviour name a resource may reference — the same endpoint, so a typo is diagnosable. */
export const registeredBehaviours = (): string[] => Object.keys(behaviours).sort();
