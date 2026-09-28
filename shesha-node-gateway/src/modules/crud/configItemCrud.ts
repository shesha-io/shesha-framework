import { badRequest, notFound } from '../../abp/ajaxResponse';
import { ResourceDefinition } from '../../config/types';
import { configItemsRepo, configNodesRepo } from '../../db/repositories';
import { GatewayRequestContext } from '../../gateway/native';
import { configItemId } from '../../utils/guid';
import { pagedResult, pickArg, flattenDynamicDto } from '../../utils/dto';
import { applyJsonLogic, parseFilter } from '../../utils/jsonLogic';
import {
  ConfigItemInfo,
  ensureModuleEditable,
  getConfigItemById,
  getConfigItemByFullName,
  listConfigItems,
  md5,
  normalizeItemType,
  readItemContent,
  writeItemContent,
} from '../configStore';
import { CrudAction } from './entityCrud';
import { parseQueryOptions, Row } from '../entityStore';

/**
 * Generic CRUD bound to a Configuration Studio item type rather than to `entity_rows`.
 *
 * Some Shesha app-services are really configuration items wearing a CRUD costume — `ReferenceList`
 * is the canonical example: the rows are `reference-list` items whose content already lives in
 * `config_items`. Binding the service to that storage means the designer, the runtime provider and
 * the CRUD API all read and write the same document, so there is no second copy to drift.
 */

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

const itemTypeOf = (resource: ResourceDefinition): string =>
  normalizeItemType(resource.storage.itemType ?? resource.service);

/**
 * Keeps the Configuration Studio tree node in step with the item's document.
 *
 * `listConfigItems` layers `config_nodes` over `config_items`, so a node left holding the label the
 * item was created with wins over every later edit — and the item's label is what the tree, the
 * DTOs and `toModelConfigurationDto` all read. Registering the node on create is not enough.
 */
const syncNode = (id: string, itemType: string, module: string, name: string, content: Row): void => {
  configNodesRepo.upsert({
    id,
    nodeKind: 'item',
    itemType,
    discriminator: itemType,
    module,
    name,
    label: str(content.label) || name,
    description: content.description === undefined ? null : (content.description as string | null),
  });
};

/** Locates the item by id, or by the `module` + `name` pair ABP's `GetByName`-style calls use. */
const findItem = (ctx: GatewayRequestContext, resource: ResourceDefinition): ConfigItemInfo => {
  const itemType = itemTypeOf(resource);
  const id = str(pickArg(ctx, 'id', 'Id'));
  if (id) {
    const byId = getConfigItemById(id);
    if (!byId || byId.itemType !== itemType) throw notFound(`There is no ${resource.service} with id '${id}'`);
    return byId;
  }

  const module = str(pickArg(ctx, 'module', 'Module')) || resource.storage.module || 'Shesha';
  const name = str(pickArg(ctx, 'name', 'Name'));
  if (!name) throw badRequest(`An id or a module+name pair is required for ${resource.service}`);

  const item = getConfigItemByFullName(itemType, module, name);
  if (!item) throw notFound(`There is no ${resource.service} '${module}/${name}'`);
  return item;
};

export const configItemCrud = (
  ctx: GatewayRequestContext,
  resource: ResourceDefinition,
  action: CrudAction,
): unknown => {
  const itemType = itemTypeOf(resource);

  switch (action) {
    case 'get':
      return readItemContent(findItem(ctx, resource));

    case 'getAll': {
      const module = str(pickArg(ctx, 'module', 'Module'));
      const options = parseQueryOptions(ctx);
      const logic = parseFilter(options.filter);

      // Each row is the item's own configuration document, not a projection of the tree metadata:
      // core's `GetAll` for these services returns the type's DTO (`ShaRoleDto` carries
      // `Permissions`, `ReferenceListDto` carries `Items`), so a caller editing straight from the
      // list would otherwise lose every field the tree does not happen to store.
      let rows: Row[] = listConfigItems()
        .filter((item) => item.itemType === itemType)
        .filter((item) => !module || item.module.toLowerCase() === module.toLowerCase())
        .map((item) => readItemContent(item));

      // The management tables send the same `PropsFilteredPagedAndSortedResultRequestDto` they send
      // to any other `GetAll`, so filtering and paging have to be honoured here too.
      rows = rows.filter((row) => applyJsonLogic(logic, row));
      if (options.quickSearch) {
        const needle = options.quickSearch.toLowerCase();
        const keys = options.quickSearchProperties?.length
          ? options.quickSearchProperties
          : ['name', 'label', 'description', 'module'];
        rows = rows.filter((row) => keys.some((key) => str(row[key]).toLowerCase().includes(needle)));
      }

      const totalCount = rows.length;
      const skip = options.skipCount ?? 0;
      if (skip > 0) rows = rows.slice(skip);
      if (options.maxResultCount !== undefined && options.maxResultCount >= 0) {
        rows = rows.slice(0, options.maxResultCount);
      }
      return pagedResult(rows, totalCount);
    }

    case 'create': {
      const body = flattenDynamicDto(ctx.body);
      const module = str(body.module) || resource.storage.module || 'Shesha';
      const name = str(body.name).trim();
      if (!name) throw badRequest('A name is required');
      ensureModuleEditable(module);
      if (getConfigItemByFullName(itemType, module, name)) {
        throw badRequest(`${resource.service} '${module}/${name}' already exists`);
      }

      const id = configItemId(itemType, module, name);
      const content = { id, ...body, module, name, itemType };
      configItemsRepo.upsert({
        itemType,
        module,
        name,
        label: str(body.label) || name,
        description: body.description === undefined ? null : str(body.description),
        json: content,
        md5: md5(content),
      });
      // Register it in the Configuration Studio tree so it is visible/editable there too.
      syncNode(id, itemType, module, name, content);
      return readItemContent(getConfigItemById(id) as ConfigItemInfo);
    }

    case 'update': {
      const item = findItem(ctx, resource);
      ensureModuleEditable(item.module);
      const previous = readItemContent(item);
      // The dynamic CRUD route posts a `DynamicDto`, the service routes post a flat body; both mean
      // "merge these fields into the stored document".
      const content = {
        ...previous,
        ...flattenDynamicDto(ctx.body),
        id: item.id,
        module: item.module,
        name: item.name,
        itemType: item.itemType,
      };
      writeItemContent(item, content);
      syncNode(item.id, item.itemType, item.module, item.name, content);
      return readItemContent(getConfigItemById(item.id) as ConfigItemInfo);
    }

    case 'delete': {
      const item = findItem(ctx, resource);
      ensureModuleEditable(item.module);
      configItemsRepo.delete(item.itemType, item.module, item.name);
      configNodesRepo.delete(item.id);
      return null;
    }

    default:
      throw badRequest(`Unsupported CRUD action '${action}'`);
  }
};
