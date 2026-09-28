import { badRequest, notFound } from '../../abp/ajaxResponse';
import { ResourceDefinition } from '../../config/types';
import { GatewayRequestContext } from '../../gateway/native';
import { flattenDynamicDto, pickArg } from '../../utils/dto';
import {
  createRow,
  deleteRow,
  EntityRef,
  findByField,
  getRow,
  listRows,
  parseQueryOptions,
  updateRow,
} from '../entityStore';

/**
 * Generic CRUD over the `entity_rows` store.
 *
 * This is what makes the dynamic API generic: an entity created in the Entity Designer is
 * immediately queryable through `/api/dynamic/{module}/{entity}/Crud/*` and through any resource
 * bound to `storage.kind: "entity"`, with no table, repository or handler written for it.
 */

export type CrudAction = 'get' | 'getAll' | 'create' | 'update' | 'delete';

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

export const entityRefOf = (resource: ResourceDefinition): EntityRef => ({
  module: resource.storage.module ?? 'Shesha',
  entity: resource.storage.entity ?? resource.service,
});

/** `?id=` for most services, `?name=` for the name-keyed ones (`Permission`). */
export const resolveRowId = (ctx: GatewayRequestContext, resource: ResourceDefinition, ref: EntityRef): string => {
  const id = str(pickArg(ctx, 'id', 'Id'));
  if (id) return id;

  const nameField = resource.nameField;
  if (nameField) {
    const name = str(pickArg(ctx, nameField, 'name', 'Name'));
    if (name) {
      const row = findByField(ref, nameField, name);
      if (row?.id) return str(row.id);
      throw notFound(`There is no ${ref.entity} with ${nameField} '${name}'`);
    }
  }
  throw badRequest(`An id is required for ${resource.service}`);
};

export const entityCrud = (
  ctx: GatewayRequestContext,
  resource: ResourceDefinition,
  action: CrudAction,
): unknown => {
  const ref = entityRefOf(resource);

  switch (action) {
    case 'get': {
      const id = resolveRowId(ctx, resource, ref);
      const row = getRow(ref, id);
      if (!row) throw notFound(`There is no ${ref.entity} with id '${id}'`);
      return row;
    }

    case 'getAll': {
      const options = parseQueryOptions(ctx);
      return listRows(ref, { ...options, sorting: options.sorting ?? resource.defaultSorting });
    }

    case 'create':
      return createRow(ref, flattenDynamicDto(ctx.body), ctx);

    case 'update': {
      const patch = flattenDynamicDto(ctx.body);
      const id = str(patch.id) || resolveRowId(ctx, resource, ref);
      return updateRow(ref, id, patch, ctx);
    }

    case 'delete': {
      const id = resolveRowId(ctx, resource, ref);
      if (!deleteRow(ref, id, ctx)) throw notFound(`There is no ${ref.entity} with id '${id}'`);
      return null;
    }

    default:
      throw badRequest(`Unsupported CRUD action '${action}'`);
  }
};
