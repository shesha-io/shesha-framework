import { badRequest, notFound } from '../../abp/ajaxResponse';
import { configItemsRepo, configNodesRepo, modulesRepo } from '../../db/repositories';
import { GatewayRequestContext } from '../../gateway/native';
import { configItemId, moduleId as toModuleId } from '../../utils/guid';
import { pagedResult, pickArg } from '../../utils/dto';
import { applyJsonLogic, parseFilter } from '../../utils/jsonLogic';
import { parseQueryOptions, Row } from '../entityStore';
import {
  ConfigItemInfo,
  ensureModuleEditable,
  getItemTypeDefinition,
  ITEM_TYPES,
  listConfigItems,
  md5,
  requireConfigItemById,
  readItemContent,
} from '../configStore';
import { saveForm } from '../formsStore';
import { BehaviourHandler } from './types';

/**
 * Exposing configuration items.
 *
 * `ConfigurationItemToExpose` is a read-only view over every item that can be surfaced into another
 * module, and `ConfigurationStudio/Expose` performs the copy. Both are here because the pair is what
 * the studio's "Expose existing" dialog drives: list, pick, copy into the destination module.
 */

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

/** `CreateFolderRequest.ModuleId` and `ExposeRequest.ModuleId` are the flat tree's module GUIDs. */
const resolveModuleName = (idOrName: string): string => {
  const value = str(idOrName);
  const modules = modulesRepo.all();
  const byId = modules.find((m) => toModuleId(m.name).toLowerCase() === value.toLowerCase());
  if (byId) return byId.name;
  const byName = modules.find((m) => m.name.toLowerCase() === value.toLowerCase());
  if (byName) return byName.name;
  throw notFound(`Module '${value}' not found`);
};

const currentUserName = (ctx: GatewayRequestContext): string | null =>
  ctx.user ? str(ctx.user.userName ?? ctx.user.sub) || null : null;

/**
 * GET /api/services/app/ConfigurationItemToExpose/GetAll
 *
 * `ConfigurationItemToExposeDto`: `{ id, name, itemType, originModuleName, overrideModuleName,
 * dateUpdated }`. shesha-core restricts this to item types carrying `[Exposable]`; the gateway
 * treats every item type it knows about as exposable, since `ITEM_TYPES` is already the curated
 * list `ConfigurationStudio/GetAvailableItemTypes` publishes.
 */
export const configurationItemToExposeGetAll: BehaviourHandler = (ctx) => {
  const exposable = new Set(ITEM_TYPES.map((t) => t.itemType));
  const options = parseQueryOptions(ctx);
  const logic = parseFilter(options.filter);

  let rows: Row[] = listConfigItems()
    .filter((item) => exposable.has(item.itemType))
    .map((item) => ({
      id: item.id,
      name: item.name,
      itemType: item.itemType,
      label: item.label,
      description: item.description,
      originModuleName: item.module,
      overrideModuleName: null,
      dateUpdated: item.lastModificationTime,
    }));

  rows = rows.filter((row) => applyJsonLogic(logic, row));

  if (options.quickSearch) {
    const needle = options.quickSearch.toLowerCase();
    const keys = options.quickSearchProperties?.length
      ? options.quickSearchProperties
      : ['name', 'itemType', 'originModuleName', 'label'];
    rows = rows.filter((row) => keys.some((key) => str(row[key]).toLowerCase().includes(needle)));
  }

  const totalCount = rows.length;
  const skip = options.skipCount ?? 0;
  if (skip > 0) rows = rows.slice(skip);
  if (options.maxResultCount !== undefined && options.maxResultCount >= 0) {
    rows = rows.slice(0, options.maxResultCount);
  }

  return pagedResult(rows, totalCount);
};

/** Writes the exposed copy and returns its id. */
const exposeOne = (
  item: ConfigItemInfo,
  destinationModule: string,
  folderId: string | null,
  userName: string | null,
): string => {
  if (getItemTypeDefinition(item.itemType) === undefined) {
    throw badRequest(`Unsupported configuration item type '${item.itemType}'`);
  }
  const existing = listConfigItems().find(
    (i) => i.itemType === item.itemType && i.module === destinationModule && i.name === item.name,
  );
  if (existing) {
    // `ConfigurationItemManager.ExposeAsync` refuses to overwrite an item of the same name.
    throw badRequest(`${item.itemType} '${item.name}' already exists in module '${destinationModule}'`);
  }

  const content = readItemContent(item);
  let newId: string;

  if (item.itemType === 'form') {
    const form = saveForm({
      module: destinationModule,
      name: item.name,
      label: item.label,
      description: item.description,
      markup: str(content.markup, JSON.stringify({ components: [], formSettings: {} })),
      modelType: content.modelType === undefined ? null : str(content.modelType),
    });
    newId = form.id;
  } else {
    newId = configItemId(item.itemType, destinationModule, item.name);
    const copy = { ...content, module: destinationModule, exposedFrom: item.id };
    configItemsRepo.upsert({
      itemType: item.itemType,
      module: destinationModule,
      name: item.name,
      label: item.label,
      description: item.description,
      json: copy,
      md5: md5(copy),
    });
  }

  configNodesRepo.upsert({
    id: newId,
    nodeKind: 'item',
    itemType: item.itemType,
    discriminator: item.discriminator,
    module: destinationModule,
    name: item.name,
    label: item.label,
    description: item.description,
    folderId,
    applicationId: item.applicationId,
    isExposed: true,
    lastModifierUser: userName,
  });
  return newId;
};

/**
 * POST /api/services/app/ConfigurationStudio/Expose — `ExposeRequest{moduleId, folderId, itemIds[]}`.
 * Returns void in core, so `null` is the faithful result.
 *
 * This is the batch variant the studio's "Expose existing" dialog calls; `ExposeItem` (mapped
 * explicitly) is the single-item one that takes `{module, name, itemType}`.
 */
export const configurationStudioExpose: BehaviourHandler = (ctx) => {
  const body = ctx.body ?? {};
  const destinationModule = resolveModuleName(str(body.moduleId ?? body.module ?? pickArg(ctx, 'moduleId')));
  ensureModuleEditable(destinationModule);

  const folderId = body.folderId ? str(body.folderId) : null;
  if (folderId) {
    const folder = configNodesRepo.get(folderId);
    if (!folder || folder.nodeKind !== 'folder') throw notFound(`Folder '${folderId}' not found`);
    if (folder.module !== destinationModule) {
      throw badRequest(`Selected folder '${folder.name}' doesn't belong to module '${destinationModule}'`);
    }
  }

  const itemIds = Array.isArray(body.itemIds) ? (body.itemIds as unknown[]).map((value) => str(value)) : [];
  if (!itemIds.length) throw badRequest('At least one item id is required');

  const userName = currentUserName(ctx);
  for (const id of itemIds) {
    exposeOne(requireConfigItemById(id), destinationModule, folderId, userName);
  }
  return null;
};
