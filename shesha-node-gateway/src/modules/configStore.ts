import { createHash } from 'crypto';
import { forbidden, notFound } from '../abp/ajaxResponse';
import { configItemsRepo, configNodesRepo, modulesRepo } from '../db/repositories';
import { configItemId, moduleId as toModuleId } from '../utils/guid';
import { findStoredFormById, findStoredForm, listForms, saveForm, SaveFormInput, StoredForm } from './formsStore';

export const md5 = (value: unknown): string =>
  createHash('md5').update(JSON.stringify(value)).digest('hex');

/**
 * The frontend uses canonical lowercase item types (`form`, `reference-list`), but callers
 * and older configs may vary in casing/alias. Normalize so lookups always match the seed.
 */
export const normalizeItemType = (raw: string): string => {
  const t = String(raw ?? '').trim().toLowerCase();
  if (t === 'referencelist' || t === 'reflist') return 'reference-list';
  return t;
};

/**
 * The configuration item types shesha-core exposes through
 * `ConfigurationItemHelper.GetAvailableItemTypesAsync()`. `discriminator` equals `itemType`
 * because every domain class is decorated with `[DiscriminatorValue(ItemTypeName)]`, and the
 * create forms come from each class' `[FixedView(ConfigurationItemsViews.Create, ...)]`.
 * `renameFormId` defaults to `Shesha/cs-item-rename` (see ConfigurationItemHelper).
 */
export interface ItemTypeDefinition {
  itemType: string;
  discriminator: string;
  entityClassName: string;
  friendlyName: string;
  description: string | null;
  createFormId: { module: string; name: string } | null;
  renameFormId: { module: string; name: string } | null;
  parentType: string | null;
}

const RENAME_FORM = { module: 'Shesha', name: 'cs-item-rename' };
const createForm = (name: string): { module: string; name: string } => ({ module: 'Shesha', name });

export const ITEM_TYPES: ItemTypeDefinition[] = [
  {
    itemType: 'form',
    discriminator: 'form',
    entityClassName: 'Shesha.Domain.FormConfiguration',
    friendlyName: 'Form',
    description: 'Form configuration',
    createFormId: createForm('cs-form-create'),
    renameFormId: RENAME_FORM,
    parentType: null,
  },
  {
    itemType: 'entity',
    discriminator: 'entity',
    entityClassName: 'Shesha.Domain.EntityConfig',
    friendlyName: 'Entity',
    description: 'Entity configuration',
    createFormId: createForm('cs-entity-create'),
    renameFormId: RENAME_FORM,
    parentType: null,
  },
  {
    itemType: 'reference-list',
    discriminator: 'reference-list',
    entityClassName: 'Shesha.Domain.ReferenceList',
    friendlyName: 'List of Values',
    description: 'Reference list (list of values)',
    createFormId: createForm('cs-reflist-create'),
    renameFormId: RENAME_FORM,
    parentType: null,
  },
  {
    itemType: 'role',
    discriminator: 'role',
    entityClassName: 'Shesha.Domain.ShaRole',
    friendlyName: 'Role',
    description: 'Security role',
    createFormId: createForm('cs-role-create'),
    renameFormId: RENAME_FORM,
    parentType: null,
  },
  {
    itemType: 'notification-type',
    discriminator: 'notification-type',
    entityClassName: 'Shesha.Domain.NotificationTypeConfig',
    friendlyName: 'Notification',
    description: 'Notification type configuration',
    createFormId: createForm('cs-notification-type-create'),
    renameFormId: RENAME_FORM,
    parentType: null,
  },
  {
    itemType: 'notification-channel',
    discriminator: 'notification-channel',
    entityClassName: 'Shesha.Domain.NotificationChannelConfig',
    friendlyName: 'Notification Channel',
    description: 'Notification channel configuration',
    createFormId: null,
    renameFormId: RENAME_FORM,
    parentType: null,
  },
  {
    itemType: 'permission-definition',
    discriminator: 'permission-definition',
    entityClassName: 'Shesha.Domain.PermissionDefinition',
    friendlyName: 'Permission',
    description: 'Permission definition',
    createFormId: null,
    renameFormId: RENAME_FORM,
    parentType: null,
  },
  {
    itemType: 'setting-configuration',
    discriminator: 'setting-configuration',
    entityClassName: 'Shesha.Domain.SettingConfiguration',
    friendlyName: 'Setting',
    description: 'Setting configuration',
    createFormId: null,
    renameFormId: RENAME_FORM,
    parentType: null,
  },
];

export const getItemTypeDefinition = (itemType: string): ItemTypeDefinition | undefined => {
  const normalized = normalizeItemType(itemType);
  return ITEM_TYPES.find((t) => t.itemType === normalized);
};

export const moduleId = toModuleId;

/** Where an item's content physically lives. */
export type ItemContentSource = 'form-file' | 'config-items';

/** A configuration item as the Configuration Studio tree and `ConfigurationItem/Get` see it. */
export interface ConfigItemInfo {
  id: string;
  itemType: string;
  discriminator: string;
  module: string;
  name: string;
  label: string;
  description: string | null;
  folderId: string | null;
  applicationId: string | null;
  isCodeBased: boolean;
  isExposed: boolean;
  lastModificationTime: string | null;
  lastModifierUser: string | null;
  source: ItemContentSource;
}

/**
 * shesha-core marks the framework module non-editable in release builds only
 * (`SheshaFrameworkModule`: `#if !DEBUG IsEditable = false`), and every Configuration Studio
 * write path calls `module.EnsureEditable()`. The gateway is a development backend, so the
 * seed marks Shesha editable; this mirrors the guard for any module that is not.
 */
export const ensureModuleEditable = (moduleName: string): void => {
  const row = modulesRepo.get(moduleName);
  if (!row) throw notFound(`Module '${moduleName}' not found`);
  if (!row.isEditable) throw forbidden(`Module '${moduleName}' is not editable`);
};

const toItemInfo = (
  id: string,
  itemType: string,
  module: string,
  name: string,
  label: string | null | undefined,
  description: string | null | undefined,
  source: ItemContentSource,
): ConfigItemInfo => ({
  id,
  itemType,
  discriminator: itemType,
  module,
  name,
  label: label ?? name,
  description: description ?? null,
  folderId: null,
  applicationId: null,
  isCodeBased: false,
  isExposed: false,
  lastModificationTime: null,
  lastModifierUser: null,
  source,
});

/**
 * Every configuration item the gateway knows about. Forms are enumerated from
 * `config/forms/*.json` (they carry their own GUID), everything else from `config_items`
 * with a deterministic id derived from its natural key. `config_nodes` layers tree metadata
 * (folder placement, flags, labels) on top of both.
 */
export const listConfigItems = (): ConfigItemInfo[] => {
  const items = new Map<string, ConfigItemInfo>();

  for (const { form } of listForms()) {
    if (!form?.id) continue;
    items.set(
      form.id,
      toItemInfo(form.id, 'form', form.module ?? '', form.name ?? '', form.label, form.description, 'form-file'),
    );
  }

  for (const row of configItemsRepo.all()) {
    const itemType = normalizeItemType(row.itemType);
    const id = configItemId(itemType, row.module, row.name);
    items.set(id, toItemInfo(id, itemType, row.module, row.name, row.label, row.description, 'config-items'));
  }

  for (const node of configNodesRepo.items()) {
    const existing = items.get(node.id);
    const itemType = normalizeItemType(node.itemType);
    const info: ConfigItemInfo = existing
      ? { ...existing, itemType, discriminator: node.discriminator || itemType }
      : toItemInfo(
        node.id,
        itemType,
        node.module,
        node.name,
        node.label,
        node.description,
        itemType === 'form' ? 'form-file' : 'config-items',
      );
    items.set(node.id, {
      ...info,
      label: node.label ?? info.label,
      description: node.description ?? info.description,
      folderId: node.folderId,
      applicationId: node.applicationId,
      isCodeBased: Boolean(node.isCodeBased),
      isExposed: Boolean(node.isExposed),
      lastModificationTime: node.lastModificationTime,
      lastModifierUser: node.lastModifierUser,
    });
  }

  return [...items.values()];
};

export const getConfigItemById = (id: string): ConfigItemInfo | undefined => {
  const wanted = String(id ?? '').toLowerCase();
  return wanted ? listConfigItems().find((i) => i.id.toLowerCase() === wanted) : undefined;
};

export const requireConfigItemById = (id: string): ConfigItemInfo => {
  const item = getConfigItemById(id);
  if (!item) throw notFound(`Configuration item '${id}' not found`);
  return item;
};

export const getConfigItemByFullName = (itemType: string, module: string, name: string): ConfigItemInfo | undefined => {
  const t = normalizeItemType(itemType);
  const m = String(module ?? '').toLowerCase();
  const n = String(name ?? '').toLowerCase();
  return listConfigItems().find(
    (i) => i.itemType === t && i.module.toLowerCase() === m && i.name.toLowerCase() === n,
  );
};

const storedFormOf = (item: ConfigItemInfo): StoredForm | undefined =>
  findStoredFormById(item.id) ?? findStoredForm(item.module, item.name);

/**
 * Reads an item's configuration document (the `configuration` half of IConfigurationItemDto).
 *
 * shesha-core builds that document by mapping the *entity* to its DTO, so it always carries the
 * item's identity (`ConfigurationItemDto : EntityDto<Guid>` with `Module`/`Name`/`Label`). Stored
 * documents here are written by several paths and not all of them repeat it, so the identity is
 * filled in on read and callers can hand the result straight back as an id-bearing DTO.
 *
 * `id` and `itemType` are authoritative rather than defaults: ids for non-form items are derived
 * from the natural key, so a rename leaves the stored copy pointing at the old key and letting it
 * win would hand out an id that no longer resolves. `module` is *not* authoritative — a
 * `setting-configuration` stores it as a `ModuleDto` reference, not a name.
 */
export const readItemContent = (item: ConfigItemInfo): Record<string, unknown> => {
  const identity = { id: item.id, itemType: item.itemType };
  const defaults = { label: item.label, description: item.description, module: item.module, name: item.name };

  if (item.itemType === 'form') {
    const stored = storedFormOf(item);
    if (!stored) throw notFound(`Form '${item.module}/${item.name}' not found`);
    return { ...defaults, ...stored.form, ...identity };
  }
  const row = configItemsRepo.get(item.itemType, item.module, item.name);
  if (!row) throw notFound(`${item.itemType} '${item.module}/${item.name}' not found`);
  const content = JSON.parse(row.json) as Record<string, unknown>;
  return { ...defaults, ...content, ...identity };
};

/** Persists an item's configuration document. */
export const writeItemContent = (item: ConfigItemInfo, content: Record<string, unknown>): void => {
  if (item.itemType === 'form') {
    saveForm(content as unknown as SaveFormInput);
    return;
  }
  configItemsRepo.upsert({
    itemType: item.itemType,
    module: item.module,
    name: item.name,
    label: (content.label as string) ?? item.label,
    description: (content.description as string | null) ?? item.description,
    json: content,
    md5: md5(content),
  });
};
