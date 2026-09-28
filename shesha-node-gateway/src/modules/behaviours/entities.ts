import { badRequest } from '../../abp/ajaxResponse';
import { ResourceDefinition } from '../../config/types';
import { metadataRepo } from '../../db/repositories';
import { pickArg } from '../../utils/dto';
import { CrudAction, entityCrud } from '../crud/entityCrud';
import { loadResources } from '../../config';
import { BehaviourHandler } from './types';

/**
 * `api/services/app/Entities` — shesha-core's generic entity endpoint, and the purest form of the
 * idea this gateway is built on: ONE route serves EVERY entity, with the entity named by a query
 * parameter (`?entityType=Shesha.Domain.FrontEndApp`) rather than by the URL.
 *
 * `EntityTypeIdInput` accepts either the full class name or a `{module, name}` pair; both resolve
 * to the same `{module, entity}` the row store is keyed on, and the call is then handed to the
 * ordinary `entityCrud` engine over a synthesized resource. So there is no second CRUD
 * implementation for the generic endpoint — it is the resource router with the resource chosen at
 * request time instead of at configuration time.
 */

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

/** Namespace segments that sit between the module name and the entity name by convention. */
const CONTAINER_SEGMENTS = ['Domain', 'Domains', 'Entities', 'Entity'];

/**
 * Turns `Shesha.Domain.FrontEndApp` into `{module: 'Shesha', entity: 'FrontEndApp'}`.
 *
 * Resolution order is metadata, then the resource registry, then the naming convention — the first
 * two are authoritative, and the convention is what makes an entity nobody has described yet still
 * resolve (which is the whole point of a generic endpoint).
 */
export const resolveEntityType = (
  entityType: string,
  moduleName?: string,
  entityName?: string,
): { module: string; entity: string } => {
  const explicitModule = str(moduleName);
  const explicitName = str(entityName);
  if (explicitModule && explicitName) return { module: explicitModule, entity: explicitName };

  const className = str(entityType);
  if (!className) {
    if (explicitName) return { module: explicitModule || 'Shesha', entity: explicitName };
    throw badRequest('An `entityType` or a `module` + `name` pair is required');
  }

  const fromMetadata = metadataRepo.getByEntityType(className, explicitModule || null);
  if (fromMetadata?.module) {
    const last = className.slice(className.lastIndexOf('.') + 1);
    return { module: fromMetadata.module, entity: explicitName || last };
  }

  const parts = className.split('.');
  const entity = explicitName || str(parts.pop());
  while (parts.length > 1 && CONTAINER_SEGMENTS.includes(parts[parts.length - 1])) parts.pop();

  // A resource registered for this entity already knows which module its rows live in.
  const registered = loadResources().resources.find(
    (resource) =>
      resource.storage.kind === 'entity' &&
      (resource.storage.entity ?? resource.service).toLowerCase() === entity.toLowerCase(),
  );

  const module =
    explicitModule ||
    registered?.storage.module ||
    (registered?.serviceModule && registered.serviceModule !== '*' ? registered.serviceModule : '') ||
    parts.join('.') ||
    'Shesha';

  return { module, entity };
};

/** Builds the resource the call is dispatched against. */
const resourceFor = (module: string, entity: string): ResourceDefinition => ({
  service: entity,
  serviceModule: module,
  description: `Generic entity endpoint for ${module}.${entity}`,
  storage: { kind: 'entity', module, entity },
});

/**
 * The shared body of every `Entities` action. `action` is fixed per registered behaviour rather
 * than read from the request, so `Entities/GetAll` cannot be talked into deleting anything.
 *
 * `module`/`name` come from the query string only: `EntityTypeIdInput` identifies the entity type
 * there, while a body field called `name` is entity *data* (`FrontEndApp.name`) and must not be
 * mistaken for the type name.
 */
const dispatch = (action: CrudAction): BehaviourHandler => (ctx) => {
  const { module, entity } = resolveEntityType(
    str(pickArg(ctx, 'entityType', 'EntityType', 'modelType', 'ModelType')),
    str(ctx.query.module ?? ctx.query.Module),
    str(ctx.query.name ?? ctx.query.Name),
  );
  return entityCrud(ctx, resourceFor(module, entity), action);
};

export const get: BehaviourHandler = dispatch('get');
export const getAll: BehaviourHandler = dispatch('getAll');
export const create: BehaviourHandler = dispatch('create');
export const update: BehaviourHandler = dispatch('update');
export const remove: BehaviourHandler = dispatch('delete');

/**
 * GET /api/services/app/Entities/Specifications — the filters a data table offers for an entity.
 * Specifications are compiled C# predicates, so none exist here; an empty list is the truthful
 * answer and stops the filter editor from erroring.
 */
export const specifications: BehaviourHandler = () => [];
