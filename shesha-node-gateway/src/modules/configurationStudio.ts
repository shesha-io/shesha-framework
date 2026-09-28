import { badRequest, notFound } from '../abp/ajaxResponse';
import { configItemsRepo, configNodesRepo, itemRevisionsRepo, modulesRepo, usersRepo } from '../db/repositories';
import { rawFile } from '../gateway/native';
import { NativeHandler } from '../gateway/native';
import { configItemId, folderId as toFolderId, moduleId as toModuleId, newGuid } from '../utils/guid';
import {
  ConfigItemInfo,
  ensureModuleEditable,
  getItemTypeDefinition,
  ITEM_TYPES,
  listConfigItems,
  md5,
  normalizeItemType,
  readItemContent,
  requireConfigItemById,
  writeItemContent,
} from './configStore';
import { deleteForm, saveForm } from './formsStore';

/** ConfigurationItemTreeNodeType (shesha-core) mirrored for the flat tree. */
const NODE_TYPE = { Module: 1, ConfigurationItem: 2, Folder: 3 } as const;

const str = (v: unknown, fallback = ''): string => (v === undefined || v === null ? fallback : String(v));

const currentUserName = (ctx: { user: { sub?: string } | null }): string | null => {
  if (!ctx.user) return null;
  return usersRepo.findById(Number(ctx.user.sub))?.userName ?? null;
};

/**
 * `CreateFolderRequest.ModuleId` / `CreateConfigurationItemRequest.ModuleId` are the GUIDs the
 * flat tree handed out, which are derived from the module name — so resolve them back the same way.
 */
const resolveModuleName = (idOrName: string): string => {
  const value = str(idOrName);
  const modules = modulesRepo.all();
  const byId = modules.find((m) => toModuleId(m.name).toLowerCase() === value.toLowerCase());
  if (byId) return byId.name;
  const byName = modules.find((m) => m.name.toLowerCase() === value.toLowerCase());
  if (byName) return byName.name;
  throw notFound(`Module '${value}' not found`);
};

interface FlatNode {
  id: string;
  parentId: string | null;
  moduleId: string;
  applicationId: string | null;
  name: string;
  label: string;
  description: string | null;
  nodeType: number;
  itemType?: string | null;
  discriminator?: string | null;
  isCodeBased: boolean;
  isCodegenPending: boolean;
  isUpdated: boolean;
  isExposed: boolean;
  isUpdatedByMe: boolean;
  lastModifierUser: string | null;
  lastModificationTime: string | null;
  baseModule: string | null;
}

/**
 * GET /api/services/app/ConfigurationStudio/GetFlatTree
 *
 * shesha-core reads this from the `ConfigurationItemTreeNode` table; the gateway derives it from
 * what it actually stores — modules, disk forms and `config_items`, with `config_nodes` supplying
 * folders and per-item tree metadata. `itemType` and `discriminator` are mandatory on item nodes:
 * `flatNode2TreeNode` throws without them.
 */
export const getFlatTree: NativeHandler = () => {
  const nodes: FlatNode[] = [];
  const modules = modulesRepo.all();
  const moduleIds = new Map<string, string>();

  for (const module of modules) {
    const id = toModuleId(module.name);
    moduleIds.set(module.name, id);
    nodes.push({
      id,
      parentId: null,
      moduleId: id,
      applicationId: null,
      name: module.name,
      label: module.name,
      description: module.description,
      nodeType: NODE_TYPE.Module,
      isCodeBased: false,
      isCodegenPending: false,
      isUpdated: false,
      isExposed: false,
      isUpdatedByMe: false,
      lastModifierUser: null,
      lastModificationTime: null,
      baseModule: null,
    });
  }

  const folders = configNodesRepo.folders();
  for (const folder of folders) {
    const modId = moduleIds.get(folder.module) ?? toModuleId(folder.module);
    nodes.push({
      id: folder.id,
      parentId: folder.folderId ?? modId,
      moduleId: modId,
      applicationId: folder.applicationId,
      name: folder.name,
      label: folder.label ?? folder.name,
      description: folder.description,
      nodeType: NODE_TYPE.Folder,
      isCodeBased: false,
      isCodegenPending: false,
      isUpdated: false,
      isExposed: false,
      isUpdatedByMe: false,
      lastModifierUser: folder.lastModifierUser,
      lastModificationTime: folder.lastModificationTime,
      baseModule: null,
    });
  }

  for (const item of listConfigItems()) {
    const modId = moduleIds.get(item.module) ?? toModuleId(item.module);
    nodes.push({
      id: item.id,
      parentId: item.folderId ?? modId,
      moduleId: modId,
      applicationId: item.applicationId,
      name: item.name,
      label: item.label,
      description: item.description,
      nodeType: NODE_TYPE.ConfigurationItem,
      itemType: item.itemType,
      discriminator: item.discriminator,
      isCodeBased: item.isCodeBased,
      isCodegenPending: false,
      isUpdated: false,
      isExposed: item.isExposed,
      isUpdatedByMe: false,
      lastModifierUser: item.lastModifierUser,
      lastModificationTime: item.lastModificationTime,
      baseModule: null,
    });
  }

  // Same ordering shesha-core uses: by parent, folders/modules before items, then by name.
  return nodes.sort((a, b) => {
    const byParent = String(a.parentId ?? '').localeCompare(String(b.parentId ?? ''));
    if (byParent !== 0) return byParent;
    const aItem = a.nodeType === NODE_TYPE.ConfigurationItem ? 1 : 0;
    const bItem = b.nodeType === NODE_TYPE.ConfigurationItem ? 1 : 0;
    if (aItem !== bItem) return aItem - bItem;
    return a.name.localeCompare(b.name);
  });
};

/** GET /api/services/app/ConfigurationStudio/GetAvailableItemTypes */
export const getAvailableItemTypes: NativeHandler = () => ITEM_TYPES;

/** GET /api/services/app/ConfigurationStudio/GetItem?itemType=&module=&name= */
export const getItem: NativeHandler = (ctx) => {
  const itemType = normalizeItemType(str(ctx.query.itemType ?? ctx.body.itemType));
  const moduleName = str(ctx.query.module ?? ctx.body.module);
  const name = str(ctx.query.name ?? ctx.body.name);

  const item = findItemByFullName(itemType, moduleName, name);
  if (!item) throw notFound(`Requested configuration not found (${itemType} - ${moduleName}: ${name})`);
  const configuration = readItemContent(item);
  return { cacheMd5: md5(configuration), configuration };
};

const findItemByFullName = (itemType: string, moduleName: string, name: string): ConfigItemInfo | undefined => {
  const t = normalizeItemType(itemType);
  const m = moduleName.toLowerCase();
  const n = name.toLowerCase();
  return listConfigItems().find(
    (i) => i.itemType === t && i.module.toLowerCase() === m && i.name.toLowerCase() === n,
  );
};

/** An empty but valid document per item type, so a newly created item opens in its editor. */
const defaultContent = (itemType: string, moduleName: string, name: string, label: string, description: string | null): Record<string, unknown> => {
  const base = { module: moduleName, name, label, description };
  switch (itemType) {
    case 'reference-list':
      return { ...base, hardLinkToApplication: false, namespace: moduleName, noSelectionValue: null, suppress: false, items: [] };
    case 'entity':
      return { ...base, className: name, tableName: name, properties: [] };
    case 'role':
      return { ...base, nameSorter: null, permissions: [], permissionedObjects: [] };
    case 'setting-configuration':
      return { ...base, accessor: name, dataType: 'string', category: null, module: { name: moduleName, accessor: moduleName } };
    case 'permission-definition':
      return { ...base, permissionName: name, description };
    case 'notification-type':
      return { ...base, notificationCategory: null, templates: [] };
    case 'notification-channel':
      return { ...base, className: null };
    default:
      return base;
  }
};

/** POST /api/services/app/ConfigurationStudio/CreateItem */
export const createItem: NativeHandler = (ctx) => {
  const moduleName = resolveModuleName(str(ctx.body.moduleId ?? ctx.body.module));
  ensureModuleEditable(moduleName);

  const itemType = normalizeItemType(str(ctx.body.itemType ?? ctx.body.discriminator));
  if (!getItemTypeDefinition(itemType)) throw badRequest(`Unsupported configuration item type '${itemType}'`);

  const name = str(ctx.body.name).trim();
  if (!name) throw badRequest('Item name is required');
  if (findItemByFullName(itemType, moduleName, name)) throw badRequest(`Item '${moduleName}:${name}' already exists`);

  const label = str(ctx.body.label) || name;
  const description = ctx.body.description === undefined ? null : str(ctx.body.description);
  const folderIdValue = ctx.body.folderId ? str(ctx.body.folderId) : null;
  const applicationId = ctx.body.frontEndAppId ? str(ctx.body.frontEndAppId) : null;

  let id: string;
  if (itemType === 'form') {
    const form = saveForm({
      module: moduleName,
      name,
      label,
      description,
      markup: JSON.stringify({ components: [], formSettings: {} }),
    });
    id = form.id;
  } else {
    id = configItemId(itemType, moduleName, name);
    const content = { id, itemType, ...defaultContent(itemType, moduleName, name, label, description) };
    configItemsRepo.upsert({
      itemType,
      module: moduleName,
      name,
      label,
      description,
      json: content,
      md5: md5(content),
    });
  }

  configNodesRepo.upsert({
    id,
    nodeKind: 'item',
    itemType,
    discriminator: itemType,
    module: moduleName,
    name,
    label,
    description,
    folderId: folderIdValue,
    applicationId,
    lastModifierUser: currentUserName(ctx),
  });

  const item = requireConfigItemById(id);
  const configuration = readItemContent(item);
  return { cacheMd5: md5(configuration), configuration };
};

/**
 * PUT /api/services/app/ConfigurationStudio/UpdateItem
 * Body is `{ id, _jObject }` — shesha-core maps the dynamic DTO onto the entity, so the
 * gateway merges `_jObject` into the stored document.
 */
export const updateItem: NativeHandler = (ctx) => {
  const id = str(ctx.body.id);
  const item = requireConfigItemById(id);
  ensureModuleEditable(item.module);

  const previous = readItemContent(item);
  const patch = flattenDynamicDto(ctx.body._jObject);
  const content: Record<string, unknown> = { ...previous, ...patch, id: item.id, module: item.module, name: item.name };

  writeItemContent(item, content);
  itemRevisionsRepo.add({
    id: newGuid(),
    itemId: item.id,
    moduleName: item.module,
    configHash: md5(previous),
    json: previous,
    creatorUserName: currentUserName(ctx),
  });
  configNodesRepo.upsert({
    id: item.id,
    nodeKind: 'item',
    itemType: item.itemType,
    discriminator: item.discriminator,
    module: item.module,
    name: item.name,
    label: str(content.label) || item.label,
    description: (content.description as string | null) ?? item.description,
    folderId: item.folderId,
    applicationId: item.applicationId,
    isCodeBased: item.isCodeBased,
    isExposed: item.isExposed,
    lastModifierUser: currentUserName(ctx),
  });

  const updated = readItemContent(requireConfigItemById(id));
  return { cacheMd5: md5(updated), configuration: updated };
};

/** `DynamicDto` posts the editable fields under a single type-named key; unwrap it. */
const flattenDynamicDto = (jObject: unknown): Record<string, unknown> => {
  if (!jObject || typeof jObject !== 'object') return {};
  const entries = Object.entries(jObject as Record<string, unknown>);
  const single = entries.length === 1 ? entries[0][1] : undefined;
  const source = single && typeof single === 'object' ? (single as Record<string, unknown>) : (jObject as Record<string, unknown>);
  const { _jObject, ...rest } = source as Record<string, unknown> & { _jObject?: unknown };
  return rest;
};

/** PUT /api/services/app/ConfigurationStudio/RenameItem */
export const renameItem: NativeHandler = (ctx) => {
  const id = str(ctx.body.itemId);
  const name = str(ctx.body.name).trim();
  if (!name) throw badRequest('Item name is required');

  const item = requireConfigItemById(id);
  ensureModuleEditable(item.module);

  const content = readItemContent(item);
  const renamed: Record<string, unknown> = { ...content, name, label: content.label === item.name ? name : content.label };

  if (item.itemType === 'form') {
    saveForm({
      id,
      name,
      label: renamed.label === undefined ? item.label : str(renamed.label),
      description: renamed.description === undefined ? item.description : (renamed.description as string | null),
      markup: renamed.markup === undefined ? undefined : str(renamed.markup),
      modelType: renamed.modelType === undefined ? undefined : (renamed.modelType as string | null),
      access: renamed.access === undefined ? undefined : (renamed.access as number | null),
      permissions: Array.isArray(renamed.permissions) ? (renamed.permissions as string[]) : undefined,
    });
  } else {
    // The id is derived from the natural key, so the document has to be re-keyed with it —
    // otherwise the stored copy (and the md5 computed from it) still names the old key.
    renamed.id = configItemId(item.itemType, item.module, name);
    configItemsRepo.delete(item.itemType, item.module, item.name);
    configItemsRepo.upsert({
      itemType: item.itemType,
      module: item.module,
      name,
      label: str(renamed.label) || name,
      description: item.description,
      json: renamed,
      md5: md5(renamed),
    });
  }

  // Non-form ids are derived from the natural key, so a rename re-keys the tree node.
  const newId = item.itemType === 'form' ? id : configItemId(item.itemType, item.module, name);
  configNodesRepo.delete(id);
  itemRevisionsRepo.deleteForItem(id);
  configNodesRepo.upsert({
    id: newId,
    nodeKind: 'item',
    itemType: item.itemType,
    discriminator: item.discriminator,
    module: item.module,
    name,
    label: str(renamed.label) || name,
    description: item.description,
    folderId: item.folderId,
    applicationId: item.applicationId,
    isCodeBased: item.isCodeBased,
    isExposed: item.isExposed,
    lastModifierUser: currentUserName(ctx),
  });
  return null;
};

/** DELETE /api/services/app/ConfigurationStudio/DeleteItem?itemId= */
export const deleteItem: NativeHandler = (ctx) => {
  const id = str(ctx.query.itemId ?? ctx.body.itemId);
  const item = requireConfigItemById(id);
  ensureModuleEditable(item.module);

  if (item.itemType === 'form') {
    deleteForm(id);
  } else {
    configItemsRepo.delete(item.itemType, item.module, item.name);
  }
  configNodesRepo.delete(id);
  itemRevisionsRepo.deleteForItem(id);
  return null;
};

/** POST /api/services/app/ConfigurationStudio/DuplicateItem */
export const duplicateItem: NativeHandler = (ctx) => {
  const id = str(ctx.body.itemId);
  const item = requireConfigItemById(id);
  ensureModuleEditable(item.module);

  const content = readItemContent(item);
  const name = uniqueName(item.itemType, item.module, item.name);
  const label = `${item.label} (copy)`;

  let newId: string;
  if (item.itemType === 'form') {
    const form = saveForm({
      module: item.module,
      name,
      label,
      description: item.description,
      markup: str(content.markup),
      modelType: content.modelType === undefined ? null : str(content.modelType),
    });
    newId = form.id;
  } else {
    newId = configItemId(item.itemType, item.module, name);
    const copy = { ...content, name, label };
    configItemsRepo.upsert({
      itemType: item.itemType,
      module: item.module,
      name,
      label,
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
    module: item.module,
    name,
    label,
    description: item.description,
    folderId: item.folderId,
    applicationId: item.applicationId,
    lastModifierUser: currentUserName(ctx),
  });

  return { itemId: newId };
};

const uniqueName = (itemType: string, moduleName: string, baseName: string): string => {
  for (let i = 1; i < 1000; i++) {
    const candidate = `${baseName}-copy${i > 1 ? i : ''}`;
    if (!findItemByFullName(itemType, moduleName, candidate)) return candidate;
  }
  return `${baseName}-copy-${newGuid().slice(0, 8)}`;
};

/** POST /api/services/app/ConfigurationStudio/CreateFolder */
export const createFolder: NativeHandler = (ctx) => {
  const moduleName = resolveModuleName(str(ctx.body.moduleId ?? ctx.body.module));
  ensureModuleEditable(moduleName);

  const name = str(ctx.body.name).trim();
  if (!name) throw badRequest('Folder name is required');

  const parentId = ctx.body.folderId ? str(ctx.body.folderId) : null;
  const id = toFolderId(moduleName, parentId, name);
  configNodesRepo.upsert({
    id,
    nodeKind: 'folder',
    module: moduleName,
    name,
    label: name,
    folderId: parentId,
    lastModifierUser: currentUserName(ctx),
  });

  // FolderTreeNode: { noteType, id, name, label, childNodes }
  return { noteType: NODE_TYPE.Folder, id, name, label: name, childNodes: [] };
};

/** PUT /api/services/app/ConfigurationStudio/RenameFolder */
export const renameFolder: NativeHandler = (ctx) => {
  const id = str(ctx.body.folderId);
  const name = str(ctx.body.name).trim();
  const folder = configNodesRepo.get(id);
  if (!folder || folder.nodeKind !== 'folder') throw notFound(`Folder '${id}' not found`);
  ensureModuleEditable(folder.module);
  if (!name) throw badRequest('Folder name is required');

  configNodesRepo.rename(id, name, name, currentUserName(ctx));
  return null;
};

/** DELETE /api/services/app/ConfigurationStudio/DeleteFolder?folderId= */
export const deleteFolder: NativeHandler = (ctx) => {
  const id = str(ctx.query.folderId ?? ctx.body.folderId);
  const folder = configNodesRepo.get(id);
  if (!folder || folder.nodeKind !== 'folder') throw notFound(`Folder '${id}' not found`);
  ensureModuleEditable(folder.module);

  // shesha-core deletes the folder recursively: items inside it, then sub-folders.
  const deleteRecursive = (folderId: string): void => {
    for (const child of configNodesRepo.children(folderId)) {
      if (child.nodeKind === 'folder') deleteRecursive(child.id);
      else deleteItemById(child.id);
    }
    configNodesRepo.delete(folderId);
  };
  deleteRecursive(id);
  return null;
};

const deleteItemById = (id: string): void => {
  const item = listConfigItems().find((i) => i.id === id);
  if (!item) return;
  if (item.itemType === 'form') {
    deleteForm(id);
  } else {
    configItemsRepo.delete(item.itemType, item.module, item.name);
  }
  configNodesRepo.delete(id);
  itemRevisionsRepo.deleteForItem(id);
};

/** POST /api/services/app/ConfigurationStudio/MoveNodeToFolder */
export const moveNodeToFolder: NativeHandler = (ctx) => {
  const nodeType = Number(ctx.body.nodeType);
  const nodeId = str(ctx.body.nodeId);
  const targetFolder = ctx.body.folderId ? str(ctx.body.folderId) : null;

  if (nodeType === NODE_TYPE.Folder || nodeType === NODE_TYPE.ConfigurationItem) {
    const node = configNodesRepo.get(nodeId);
    const item = node ? undefined : listConfigItems().find((i) => i.id === nodeId);
    if (!node && !item) throw notFound(`Node '${nodeId}' not found`);

    const moduleName = node?.module ?? item?.module ?? '';
    ensureModuleEditable(moduleName);

    if (node) {
      configNodesRepo.move(nodeId, targetFolder, currentUserName(ctx));
    } else if (item) {
      configNodesRepo.upsert({
        id: item.id,
        nodeKind: 'item',
        itemType: item.itemType,
        discriminator: item.discriminator,
        module: item.module,
        name: item.name,
        label: item.label,
        description: item.description,
        folderId: targetFolder,
        applicationId: item.applicationId,
        isCodeBased: item.isCodeBased,
        isExposed: item.isExposed,
        lastModifierUser: currentUserName(ctx),
      });
    }
    return null;
  }

  if (nodeType === NODE_TYPE.Module) return null;
  throw badRequest(`Unsupported node type '${nodeType}'`);
};

/** POST /api/services/app/ConfigurationStudio/ReorderNode — ordering is name-based, so a no-op. */
export const reorderNode: NativeHandler = () => null;

const toRevisionDto = (row: ReturnType<typeof itemRevisionsRepo.get>, moduleName: string, isEditable: boolean) => ({
  id: row!.id,
  moduleName: row!.moduleName || moduleName,
  isEditable,
  versionNo: row!.versionNo,
  versionName: row!.versionName,
  comments: row!.comments,
  configHash: row!.configHash ?? '',
  isCompressed: Boolean(row!.isCompressed),
  creationMethod: row!.creationMethod,
  dllVersionNo: null,
  creationTime: row!.creationTime,
  creatorUserId: row!.creatorUserId ? Number(row!.creatorUserId) : null,
  creatorUserName: row!.creatorUserName ?? '',
});

/** GET /api/services/app/ConfigurationStudio/GetItemRevisions?itemId= */
export const getItemRevisions: NativeHandler = (ctx) => {
  const itemId = str(ctx.query.itemId ?? ctx.body.itemId);
  const item = requireConfigItemById(itemId);
  const module = modulesRepo.get(item.module);
  const isEditable = Boolean(module?.isEditable);

  return {
    revisions: itemRevisionsRepo.forItem(itemId).map((row) => toRevisionDto(row, item.module, isEditable)),
  };
};

/** PUT /api/services/app/ConfigurationStudio/RenameRevision */
export const renameRevision: NativeHandler = (ctx) => {
  const revisionId = str(ctx.body.revisionId);
  const revision = itemRevisionsRepo.get(revisionId);
  if (!revision) throw notFound(`Revision '${revisionId}' not found`);
  const item = requireConfigItemById(revision.itemId);
  ensureModuleEditable(item.module);

  itemRevisionsRepo.rename(revisionId, str(ctx.body.versionName));
  return null;
};

/** POST /api/services/app/ConfigurationStudio/RestoreItemRevision */
export const restoreItemRevision: NativeHandler = (ctx) => {
  const itemId = str(ctx.body.itemId);
  const revisionId = str(ctx.body.revisionId);

  const item = requireConfigItemById(itemId);
  ensureModuleEditable(item.module);

  const revision = itemRevisionsRepo.get(revisionId);
  if (!revision) throw notFound(`Revision '${revisionId}' not found`);
  if (revision.itemId !== itemId) throw badRequest("Selected revision doesn't belong to the item hierarchy");

  const current = readItemContent(item);
  const restored = JSON.parse(revision.json) as Record<string, unknown>;
  writeItemContent(item, { ...restored, id: item.id, module: item.module, name: item.name });

  // The replaced version becomes history, exactly as shesha-core does on update.
  itemRevisionsRepo.add({
    id: newGuid(),
    itemId,
    moduleName: item.module,
    configHash: md5(current),
    json: current,
    creatorUserName: currentUserName(ctx),
  });
  return null;
};

/** GET /api/services/app/ConfigurationStudio/GetRevisionJson?id= — file download. */
export const getRevisionJson: NativeHandler = (ctx) => {
  const id = str(ctx.query.id);
  const revision = itemRevisionsRepo.get(id);
  if (!revision) throw notFound(`Revision '${id}' not found`);

  return rawFile(revision.json, {
    contentType: 'application/json',
    fileName: `revision-${revision.versionNo}.json`,
  });
};

/** POST /api/services/app/ConfigurationStudio/ExposeItem */
export const exposeItem: NativeHandler = (ctx) => {
  const moduleName = str(ctx.body.module);
  ensureModuleEditable(moduleName);
  const itemType = normalizeItemType(str(ctx.body.itemType));
  const name = str(ctx.body.name);

  const item = findItemByFullName(itemType, moduleName, name);
  if (!item) throw notFound(`Requested configuration not found (${itemType} - ${moduleName}: ${name})`);

  configNodesRepo.upsert({
    id: item.id,
    nodeKind: 'item',
    itemType: item.itemType,
    discriminator: item.discriminator,
    module: item.module,
    name: item.name,
    label: item.label,
    description: item.description,
    folderId: item.folderId,
    applicationId: item.applicationId,
    isCodeBased: item.isCodeBased,
    isExposed: true,
    lastModifierUser: currentUserName(ctx),
  });
  return { item };
};

export const configurationStudioHandlers: Record<string, NativeHandler> = {
  'configurationStudio.getFlatTree': getFlatTree,
  'configurationStudio.getAvailableItemTypes': getAvailableItemTypes,
  'configurationStudio.getItem': getItem,
  'configurationStudio.createItem': createItem,
  'configurationStudio.updateItem': updateItem,
  'configurationStudio.renameItem': renameItem,
  'configurationStudio.deleteItem': deleteItem,
  'configurationStudio.duplicateItem': duplicateItem,
  'configurationStudio.createFolder': createFolder,
  'configurationStudio.renameFolder': renameFolder,
  'configurationStudio.deleteFolder': deleteFolder,
  'configurationStudio.moveNodeToFolder': moveNodeToFolder,
  'configurationStudio.reorderNode': reorderNode,
  'configurationStudio.getItemRevisions': getItemRevisions,
  'configurationStudio.renameRevision': renameRevision,
  'configurationStudio.restoreItemRevision': restoreItemRevision,
  'configurationStudio.getRevisionJson': getRevisionJson,
  'configurationStudio.exposeItem': exposeItem,
};
