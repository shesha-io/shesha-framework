import { badRequest, notFound } from '../../abp/ajaxResponse';
import { configItemsRepo, configNodesRepo, modulesRepo } from '../../db/repositories';
import { GatewayRequestContext } from '../../gateway/native';
import { pickArg } from '../../utils/dto';
import { configItemId, moduleId as toModuleId } from '../../utils/guid';
import {
  ConfigItemInfo,
  ensureModuleEditable,
  getConfigItemByFullName,
  listConfigItems,
  md5,
  readItemContent,
} from '../configStore';
import { allRows, EntityRef } from '../entityStore';
import { entityRefOf } from '../crud/entityCrud';
import { BehaviourHandler } from './types';

/**
 * The permission / permissioned-object trees.
 *
 * Two services, two stores, both hierarchical:
 *
 *  - `PermissionedObject` is a real table in shesha-core (`frwk.permissioned_objects`), so it maps
 *    onto the generic row store. Rows are flat and the tree is derived on read from each row's
 *    dotted `object` path.
 *  - `Permission` is *not* a table: `PermissionAppService` is a CRUD-looking façade over
 *    `PermissionDefinition`, which is a `permission-definition` configuration item. Binding the
 *    service to that item type means the Permission Configurator and the Configuration Studio tree
 *    edit the same objects instead of two copies that drift.
 *
 * Both expose hierarchies, so neither uses the generic CRUD engine — the shapes differ (`id` is the
 * permission *name*, `GetAll` returns a bare array) and the nesting has to be assembled on read.
 */

const PERMISSION_ITEM_TYPE = 'permission-definition';

/** `PermissionDto.Id` is the permission name (Abp's `Permission.Id`), not a GUID. */
const EMPTY_ID = '_';

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

interface TreeNode {
  [key: string]: unknown;
}

/**
 * Assembles flat rows into a tree, matching each row's `parentKey` field against the parent's
 * `identityKey` field. Roots are rows whose parent is missing or self-referential; rows whose
 * parent is unknown are appended at the end rather than dropped, which is what
 * `PermissionAppService.GetAllTreeAsync` does with its leftover list.
 */
const buildTree = (rows: TreeNode[], identityKey: string, parentKey: string, childrenKey: string): TreeNode[] => {
  const byIdentity = new Map<string, TreeNode>();
  for (const row of rows) {
    byIdentity.set(str(row[identityKey]).toLowerCase(), { ...row, [childrenKey]: [] });
  }

  const roots: TreeNode[] = [];
  const orphans: TreeNode[] = [];
  for (const row of rows) {
    const node = byIdentity.get(str(row[identityKey]).toLowerCase()) as TreeNode;
    const parentIdentity = str(row[parentKey]).toLowerCase();
    const parent = parentIdentity ? byIdentity.get(parentIdentity) : undefined;
    if (!parentIdentity) {
      roots.push(node);
      continue;
    }
    if (!parent || parent === node) {
      orphans.push(node);
      continue;
    }
    (parent[childrenKey] as TreeNode[]).push(node);
  }

  const sortRecursive = (nodes: TreeNode[]): TreeNode[] => {
    nodes.sort((a, b) => str(a.name ?? a.object).localeCompare(str(b.name ?? b.object)));
    for (const node of nodes) sortRecursive(node[childrenKey] as TreeNode[]);
    return nodes;
  };
  return [...sortRecursive(roots), ...orphans];
};

/* ------------------------------------------------------------------ PermissionedObject */

/** GET /api/services/app/PermissionedObject/GetAllTree?type=&showHidden= */
export const permissionedObjectGetAllTree: BehaviourHandler = (ctx, resource) => {
  const ref: EntityRef = entityRefOf(resource);
  const type = str(ctx.query.type);
  const showHidden = String(ctx.query.showHidden ?? '').toLowerCase() === 'true';

  const rows = allRows(ref).filter((row) => {
    if (type && str(row.type).toLowerCase() !== type.toLowerCase()) return false;
    if (!showHidden && row.hidden === true) return false;
    return true;
  });

  // `parent` holds the parent's dotted `object` path.
  return buildTree(rows, 'object', 'parent', 'children');
};

/* ------------------------------------------------------------------ Permission */

/** `EntityReferenceDto<Guid>` — the shape `PermissionDto.Module` carries. */
const moduleReference = (moduleName: string): TreeNode | null =>
  moduleName
    ? {
        id: toModuleId(moduleName),
        name: moduleName,
        _className: 'Shesha.Module',
        _displayName: moduleName,
      }
    : null;

/** Maps a `permission-definition` config item onto `PermissionDto`. */
const toPermissionDto = (item: ConfigItemInfo, content: Record<string, unknown>): TreeNode => {
  const parentName = str(content.parent ?? content.parentName) || null;
  return {
    // `PermissionAppService.GetAsync(string id)` looks the permission up by name.
    id: item.name,
    name: item.name,
    displayName: str(content.label ?? item.label) || item.name,
    description: (content.description as string | null) ?? item.description,
    parentName,
    isDbPermission: true,
    moduleId: null,
    module: moduleReference(item.module),
    parent: null,
    child: [],
  };
};

const allPermissions = (): { item: ConfigItemInfo; content: Record<string, unknown> }[] =>
  listConfigItems()
    .filter((i) => i.itemType === PERMISSION_ITEM_TYPE)
    .map((item) => ({ item, content: readItemContent(item) }));

/** Finds a permission by its name (which is also its id), in any module. */
const findPermission = (name: string): { item: ConfigItemInfo; content: Record<string, unknown> } | undefined => {
  const needle = str(name).toLowerCase();
  if (!needle) return undefined;
  return allPermissions().find(({ item }) => item.name.toLowerCase() === needle);
};

/**
 * `PermissionDto.Module` is an `EntityReferenceDto<Guid>`, so callers may send either the module
 * name or its (derived) GUID. `Shesha` is the default because that is where every framework
 * permission definition lives.
 */
const resolveModuleName = (body: Record<string, unknown>, fallback: string): string => {
  const reference = body.module as { id?: unknown; name?: unknown } | undefined;
  const idOrName = str(reference?.name) || str(reference?.id) || str(body.moduleName);
  if (!idOrName) return fallback;

  const modules = modulesRepo.all();
  const byId = modules.find((m) => toModuleId(m.name).toLowerCase() === idOrName.toLowerCase());
  if (byId) return byId.name;
  const byName = modules.find((m) => m.name.toLowerCase() === idOrName.toLowerCase());
  return byName ? byName.name : idOrName;
};

/** Writes the `permission-definition` item and registers it in the Configuration Studio tree. */
const writePermission = (
  moduleName: string,
  name: string,
  fields: { label: string | null; description: string | null; parent: string | null },
): ConfigItemInfo => {
  ensureModuleEditable(moduleName);
  const id = configItemId(PERMISSION_ITEM_TYPE, moduleName, name);
  const content = {
    id,
    itemType: PERMISSION_ITEM_TYPE,
    module: moduleName,
    name,
    label: fields.label ?? name,
    description: fields.description,
    parent: fields.parent,
    suppress: false,
    hardLinkToApplication: false,
  };
  configItemsRepo.upsert({
    itemType: PERMISSION_ITEM_TYPE,
    module: moduleName,
    name,
    label: fields.label ?? name,
    description: fields.description,
    json: content,
    md5: md5(content),
  });
  configNodesRepo.upsert({
    id,
    nodeKind: 'item',
    itemType: PERMISSION_ITEM_TYPE,
    discriminator: PERMISSION_ITEM_TYPE,
    module: moduleName,
    name,
    label: fields.label ?? name,
    description: fields.description,
  });
  return getConfigItemByFullName(PERMISSION_ITEM_TYPE, moduleName, name) as ConfigItemInfo;
};

/** GET /api/services/app/Permission/GetAll — a bare array in core, not a paged result. */
export const permissionGetAll: BehaviourHandler = () =>
  allPermissions()
    .map(({ item, content }): TreeNode => ({ ...toPermissionDto(item, content), child: null }))
    .sort((a, b) => str(a.displayName).localeCompare(str(b.displayName)));

/** GET /api/services/app/Permission/GetAllTree */
export const permissionGetAllTree: BehaviourHandler = () => {
  const rows = allPermissions().map(({ item, content }) => toPermissionDto(item, content));
  return buildTree(rows, 'name', 'parentName', 'child');
};

/**
 * GET /api/services/app/Permission/Autocomplete?term= — `AutocompleteItemDto{value, displayText}`,
 * capped at 10 like every other Shesha picker.
 */
export const permissionAutocomplete: BehaviourHandler = (ctx) => {
  const term = str(pickArg(ctx, 'term', 'Term')).toLowerCase();
  return allPermissions()
    .map(({ item, content }) => toPermissionDto(item, content))
    .filter(
      (permission) =>
        !term ||
        [permission.name, permission.displayName, permission.description].some((value) =>
          str(value).toLowerCase().includes(term),
        ),
    )
    .sort((a, b) => str(a.name).localeCompare(str(b.name)))
    .slice(0, 10)
    .map((permission) => ({
      value: str(permission.name),
      displayText: `${str(permission.displayName)} (${str(permission.name)})`,
    }));
};

/** GET /api/services/app/Permission/Get?id= — the id IS the permission name. */
export const permissionGet: BehaviourHandler = (ctx) => {
  const id = str(pickArg(ctx, 'id', 'Id', 'name', 'Name'));
  const match = findPermission(id);
  if (!match) throw notFound(`There is no permission '${id}'`);
  return toPermissionDto(match.item, match.content);
};

/** POST /api/services/app/Permission/Create — `PermissionDto`. */
export const permissionCreate: BehaviourHandler = (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>;
  const name = str(body.name ?? body.id).trim();
  if (!name) throw badRequest('A permission name is required');
  if (findPermission(name)) throw badRequest(`Permission '${name}' already exists`);

  const moduleName = resolveModuleName(body, 'Shesha');
  const item = writePermission(moduleName, name, {
    label: body.displayName === undefined ? name : str(body.displayName) || name,
    description: body.description === undefined ? null : str(body.description) || null,
    parent: str(body.parentName ?? (body.parent as { name?: unknown } | undefined)?.name) || null,
  });
  return toPermissionDto(item, readItemContent(item));
};

/** PUT /api/services/app/Permission/Update — core routes `id == '_'` to Create. */
export const permissionUpdate: BehaviourHandler = (ctx, resource) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>;
  const id = str(body.id ?? pickArg(ctx, 'id', 'Id'));
  if (id === EMPTY_ID) return permissionCreate(ctx, resource);

  const existing = findPermission(id) ?? findPermission(str(body.name));
  if (!existing) throw notFound(`There is no permission '${id || str(body.name)}'`);

  const name = str(body.name ?? existing.item.name).trim();
  const moduleName = resolveModuleName(body, existing.item.module);
  const renaming = name.toLowerCase() !== existing.item.name.toLowerCase();

  const item = writePermission(moduleName, name, {
    label: body.displayName === undefined ? str(existing.content.label) : str(body.displayName),
    description:
      body.description === undefined ? (existing.content.description as string | null) ?? null : str(body.description) || null,
    parent:
      body.parentName === undefined
        ? str(existing.content.parent) || null
        : str(body.parentName ?? (body.parent as { name?: unknown } | undefined)?.name) || null,
  });

  // A rename has to move the item and re-point every child that referenced the old name,
  // otherwise the tree silently loses a branch.
  if (renaming || moduleName.toLowerCase() !== existing.item.module.toLowerCase()) {
    configItemsRepo.delete(existing.item.itemType, existing.item.module, existing.item.name);
    configNodesRepo.delete(existing.item.id);
    for (const child of allPermissions()) {
      if (str(child.content.parent).toLowerCase() !== existing.item.name.toLowerCase()) continue;
      const childModule = child.item.module;
      writePermission(childModule, child.item.name, {
        label: str(child.content.label),
        description: (child.content.description as string | null) ?? null,
        parent: name,
      });
    }
  }

  return toPermissionDto(item, readItemContent(item));
};

/** PUT /api/services/app/Permission/UpdateParent — `PermissionDto{name, parentName}`. */
export const permissionUpdateParent: BehaviourHandler = (ctx) => {
  const body = (ctx.body ?? {}) as Record<string, unknown>;
  const name = str(body.name ?? pickArg(ctx, 'name', 'Name'));
  const target = findPermission(name);
  if (!target) throw notFound(`There is no permission '${name}'`);

  const parentName = body.parentName === undefined ? null : str(body.parentName) || null;
  if (parentName && parentName.toLowerCase() === name.toLowerCase()) {
    throw badRequest(`Permission '${name}' cannot be its own parent`);
  }

  const item = writePermission(target.item.module, target.item.name, {
    label: str(target.content.label) || target.item.name,
    description: (target.content.description as string | null) ?? null,
    parent: parentName,
  });
  return toPermissionDto(item, readItemContent(item));
};

/**
 * DELETE /api/services/app/Permission/Delete?name=
 * Keyed by name, not id — `PermissionAppService.DeleteAsync(string name)`.
 */
export const permissionDeleteByName: BehaviourHandler = (ctx) => {
  const name = str(pickArg(ctx, 'name', 'Name', 'id', 'Id'));
  const target = findPermission(name);
  if (!target) throw notFound(`There is no permission '${name}'`);

  ensureModuleEditable(target.item.module);
  configItemsRepo.delete(target.item.itemType, target.item.module, target.item.name);
  configNodesRepo.delete(target.item.id);
  return null;
};
