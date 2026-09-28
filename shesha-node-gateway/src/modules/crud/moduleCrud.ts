import { badRequest, notFound } from '../../abp/ajaxResponse';
import { ResourceDefinition } from '../../config/types';
import { ModuleRow, modulesRepo } from '../../db/repositories';
import { GatewayRequestContext } from '../../gateway/native';
import { pagedResult, pickArg } from '../../utils/dto';
import { moduleId as toModuleId } from '../../utils/guid';
import { applyJsonLogic, parseFilter } from '../../utils/jsonLogic';
import { parseQueryOptions } from '../entityStore';
import { CrudAction } from './entityCrud';

/**
 * Generic CRUD bound to the gateway's `modules` table.
 *
 * `/api/dynamic/Shesha/Module/Crud/*` has to read the same rows `ConfigurationStudio/GetModules`
 * does, or the module picker and the module editor would disagree about what exists. Modules are
 * therefore their own storage kind rather than a set of rows in the generic entity store — the
 * table is already authoritative for the whole Configuration Studio.
 */

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

/** `ModuleDto`, shaped like the entries `ConfigurationStudio/GetModules` already returns. */
export const toModuleDto = (row: ModuleRow): Record<string, unknown> => ({
  // The same deterministic GUID the flat tree reports for the module node.
  id: toModuleId(row.name),
  name: row.name,
  alias: row.accessor,
  accessor: row.accessor,
  description: row.description,
  isEditable: Boolean(row.isEditable),
  permissions: [],
});

/** Modules are keyed by name; callers hold either the name or its deterministic GUID. */
const findModuleRow = (ctx: GatewayRequestContext): ModuleRow | undefined => {
  const key = str(pickArg(ctx, 'id', 'Id', 'name', 'Name'));
  if (!key) return undefined;
  const direct = modulesRepo.get(key);
  if (direct) return direct;
  return modulesRepo.all().find((row) => toModuleId(row.name).toLowerCase() === key.toLowerCase());
};

export const moduleCrud = (
  ctx: GatewayRequestContext,
  _resource: ResourceDefinition,
  action: CrudAction,
): unknown => {
  switch (action) {
    case 'get': {
      const row = findModuleRow(ctx);
      if (!row) throw notFound('There is no module with that id');
      return toModuleDto(row);
    }

    case 'getAll': {
      const options = parseQueryOptions(ctx);
      const logic = parseFilter(options.filter);
      let rows = modulesRepo.all().map(toModuleDto);
      rows = rows.filter((row) => applyJsonLogic(logic, row));
      if (options.quickSearch) {
        const needle = options.quickSearch.toLowerCase();
        rows = rows.filter((row) =>
          [row.name, row.alias, row.description].some((v) => str(v).toLowerCase().includes(needle)),
        );
      }
      const totalCount = rows.length;
      const skip = options.skipCount ?? 0;
      if (skip > 0) rows = rows.slice(skip);
      if (options.maxResultCount !== undefined && options.maxResultCount >= 0) rows = rows.slice(0, options.maxResultCount);
      return pagedResult(rows, totalCount);
    }

    case 'create':
    case 'update': {
      const body = ctx.body ?? {};
      const existing = findModuleRow(ctx);
      const name = str(body.name ?? existing?.name).trim();
      if (!name) throw badRequest('A module name is required');
      if (!existing && modulesRepo.get(name)) throw badRequest(`Module '${name}' already exists`);

      modulesRepo.upsert({
        name,
        accessor: body.alias === undefined && body.accessor === undefined
          ? (existing?.accessor ?? name)
          : str(body.alias ?? body.accessor),
        description: body.description === undefined ? (existing?.description ?? null) : str(body.description),
        // A module nobody marked non-editable is editable; framework modules opt out explicitly.
        isEditable: body.isEditable === undefined ? (existing ? Boolean(existing.isEditable) : true) : Boolean(body.isEditable),
      });
      const saved = modulesRepo.get(name);
      return saved ? toModuleDto(saved) : null;
    }

    case 'delete': {
      const row = findModuleRow(ctx);
      if (!row) throw notFound('There is no module with that id');
      if (row.isEditable !== 1) throw badRequest(`Module '${row.name}' is not editable and cannot be deleted`);
      // No hard delete: everything in the Configuration Studio is keyed by module name, and
      // removing the row would orphan those items rather than delete them.
      modulesRepo.upsert({ name: row.name, accessor: row.accessor, description: row.description, isEditable: false });
      return null;
    }

    default:
      throw badRequest(`Unsupported CRUD action '${action}'`);
  }
};
