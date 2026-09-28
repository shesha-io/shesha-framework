import { badRequest, notFound } from '../../abp/ajaxResponse';
import { configItemsRepo, configNodesRepo } from '../../db/repositories';
import { GatewayRequestContext } from '../../gateway/native';
import { newGuid } from '../../utils/guid';
import { pickArg } from '../../utils/dto';
import {
  ConfigItemInfo,
  ensureModuleEditable,
  getConfigItemById,
  getConfigItemByFullName,
  md5,
  readItemContent,
  writeItemContent,
} from '../configStore';
import { BehaviourHandler } from './types';

/**
 * Reference lists.
 *
 * A `ReferenceList` is a Configuration Studio item (`reference-list`) whose document already holds
 * the `items[]` array — that is what `ConfigurationItem/GetCurrent` serves and what the runtime
 * reference-list provider caches by md5. shesha-core also exposes `ReferenceListItem` as its own
 * CRUD service, so the item endpoints mutate that same array instead of keeping a parallel copy
 * that could drift from what the forms render.
 */

interface RefListItem {
  id: string;
  item: string | null;
  itemValue: number;
  description: string | null;
  orderIndex: number;
  color: string | null;
  icon: string | null;
  shortAlias: string | null;
}

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

const toInt = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
};

/** Finds the list an item call refers to, from whichever key the caller had handy. */
const findList = (ctx: GatewayRequestContext): ConfigItemInfo => {
  const byId = str(pickArg(ctx, 'referenceListId', 'ownerListItemId', 'referenceList.id'));
  if (byId) {
    const list = getConfigItemById(byId);
    if (!list) throw notFound(`There is no reference list with id '${byId}'`);
    return list;
  }

  const module = str(pickArg(ctx, 'module')) || 'Shesha';
  const name = str(pickArg(ctx, 'referenceListName', 'name'));
  if (!name) throw badRequest('A referenceListId or a module+name pair is required');

  const list = getConfigItemByFullName('reference-list', module, name);
  if (!list) throw notFound(`There is no reference list '${module}/${name}'`);
  return list;
};

const itemsOf = (content: Record<string, unknown>): RefListItem[] =>
  Array.isArray(content.items) ? (content.items as RefListItem[]) : [];

/** Persists the mutated list and keeps the studio tree node's label in step. */
const persist = (list: ConfigItemInfo, content: Record<string, unknown>): void => {
  ensureModuleEditable(list.module);
  writeItemContent(list, content);
  configNodesRepo.upsert({
    id: list.id,
    nodeKind: 'item',
    itemType: 'reference-list',
    discriminator: 'reference-list',
    module: list.module,
    name: list.name,
    label: str(content.label) || list.label,
    description: (content.description as string | null) ?? list.description,
    folderId: list.folderId,
    applicationId: list.applicationId,
  });
};

/** GET /api/services/app/ReferenceList/GetByName?module=&name=&md5= */
export const getByName: BehaviourHandler = (ctx) => {
  const module = str(ctx.query.module) || 'Shesha';
  const name = str(ctx.query.name);
  if (!name) throw badRequest('A reference list name is required');

  const list = getConfigItemByFullName('reference-list', module, name);
  if (!list) throw notFound(`There is no reference list '${module}/${name}'`);

  const configuration = readItemContent(list);
  return { ...configuration, cacheMd5: md5(configuration) };
};

/** POST /api/services/app/ReferenceListItem/Create */
export const createItem: BehaviourHandler = (ctx) => {
  const list = findList(ctx);
  const content = readItemContent(list);
  const items = itemsOf(content);

  const body = ctx.body ?? {};
  const itemValue = toInt(body.itemValue, items.length ? Math.max(...items.map((i) => i.itemValue)) + 1 : 1);
  if (items.some((i) => i.itemValue === itemValue)) {
    throw badRequest(`Item value ${itemValue} is already used in '${list.name}'`);
  }

  const created: RefListItem = {
    id: str(body.id) || newGuid(),
    item: body.item === undefined ? null : str(body.item),
    itemValue,
    description: body.description === undefined ? null : str(body.description),
    orderIndex: toInt(body.orderIndex, items.length),
    color: body.color === undefined ? null : str(body.color),
    icon: body.icon === undefined ? null : str(body.icon),
    shortAlias: body.shortAlias === undefined ? null : str(body.shortAlias),
  };

  persist(list, { ...content, items: [...items, created] });
  return created;
};

/** PUT /api/services/app/ReferenceListItem/Update */
export const updateItem: BehaviourHandler = (ctx) => {
  const list = findList(ctx);
  const content = readItemContent(list);
  const items = itemsOf(content);
  const id = str(pickArg(ctx, 'id', 'Id'));

  const index = items.findIndex((i) => str(i.id) === id);
  if (index < 0) throw notFound(`There is no reference list item with id '${id}'`);

  const body = ctx.body ?? {};
  const updated: RefListItem = {
    ...items[index],
    ...(body.item !== undefined ? { item: str(body.item) } : {}),
    ...(body.itemValue !== undefined ? { itemValue: toInt(body.itemValue, items[index].itemValue) } : {}),
    ...(body.description !== undefined ? { description: str(body.description) } : {}),
    ...(body.orderIndex !== undefined ? { orderIndex: toInt(body.orderIndex, items[index].orderIndex) } : {}),
    ...(body.color !== undefined ? { color: str(body.color) } : {}),
    ...(body.icon !== undefined ? { icon: str(body.icon) } : {}),
    ...(body.shortAlias !== undefined ? { shortAlias: str(body.shortAlias) } : {}),
  };

  const next = [...items];
  next[index] = updated;
  persist(list, { ...content, items: next });
  return updated;
};

/** DELETE /api/services/app/ReferenceListItem/Delete?id=&referenceListId= */
export const deleteItem: BehaviourHandler = (ctx) => {
  const list = findList(ctx);
  const content = readItemContent(list);
  const items = itemsOf(content);
  const id = str(pickArg(ctx, 'id', 'Id'));

  const next = items.filter((i) => str(i.id) !== id);
  if (next.length === items.length) throw notFound(`There is no reference list item with id '${id}'`);

  persist(list, { ...content, items: next });
  return null;
};

/**
 * DELETE /api/services/app/ReferenceList/Delete?module=&name=
 * The Configuration Studio delete goes through `ConfigurationStudio/DeleteItem`; this is the
 * CRUD-service path the reference-list management table uses.
 */
export const deleteList: BehaviourHandler = (ctx) => {
  const module = str(ctx.query.module) || 'Shesha';
  const name = str(ctx.query.name);
  const list = name ? getConfigItemByFullName('reference-list', module, name) : getConfigItemById(str(ctx.query.id));
  if (!list) throw notFound(`There is no reference list '${module}/${name}'`);

  ensureModuleEditable(list.module);
  configItemsRepo.delete(list.itemType, list.module, list.name);
  configNodesRepo.delete(list.id);
  return null;
};
