import { notFound } from '../abp/ajaxResponse';
import { metadataRepo, modulesRepo } from '../db/repositories';
import { NativeHandler } from '../gateway/native';
import { moduleId as toModuleId } from '../utils/guid';
import {
  getConfigItemByFullName,
  getConfigItemById,
  md5,
  normalizeItemType,
  readItemContent,
} from './configStore';

const str = (v: unknown, fallback = ''): string => (v === undefined || v === null ? fallback : String(v));

/** GET /api/services/app/Metadata/Get */
export const metadataGet: NativeHandler = (ctx) => {
  const q = ctx.query;
  const entityType = (q.entityType ?? q.modelType) as string | undefined;
  const name = q.name as string | undefined;
  const module = q.module as string | undefined;
  const id = q.id as string | undefined;

  let row = id ? metadataRepo.get(id) : undefined;
  if (!row && entityType) row = metadataRepo.getByEntityType(entityType, module);
  if (!row && name) row = metadataRepo.getByEntityType(name, module);
  if (!row) throw notFound(`Metadata not found for '${entityType ?? name ?? id ?? ''}'`);

  const stored = JSON.parse(row.json) as Record<string, unknown>;
  return {
    specifications: [],
    apiEndpoints: {},
    properties: [],
    ...stored,
    name: (stored.name as string) ?? row.entityType,
    module: (stored.module as string) ?? row.module ?? module ?? '',
  };
};

/**
 * GET /api/services/app/Metadata/Autocomplete?type=&term=&selectedValue=
 * Backs the `entityTypeAutocomplete` settings input (IMetadataAutocompleteDto:
 * `{ id, name, description, module, className, alias }`).
 */
export const metadataAutocomplete: NativeHandler = (ctx) => {
  const term = str(ctx.query.term).trim().toLowerCase();
  const selectedValue = str(ctx.query.selectedValue).trim().toLowerCase();

  return metadataRepo
    .all()
    .map((row) => {
      const stored = JSON.parse(row.json) as Record<string, unknown>;
      const className = str(stored.fullClassName ?? row.entityType);
      const name = str(stored.name ?? className.substring(className.lastIndexOf('.') + 1));
      return {
        id: row.id,
        name,
        description: stored.description ?? null,
        module: row.module ?? null,
        className,
        alias: stored.typeShortAlias ?? null,
      };
    })
    .filter((item) => {
      const haystack = `${item.name} ${item.className} ${item.module ?? ''}`.toLowerCase();
      // The selected value is always returned so the control can render its current label.
      return !term || haystack.includes(term) || item.className.toLowerCase() === selectedValue;
    });
};

/** GET /api/services/app/ConfigurationItem/GetCurrent?itemType=&module=&name= */
export const configurationItemGetCurrent: NativeHandler = (ctx) => {
  const itemType = normalizeItemType(str(ctx.query.itemType));
  const name = str(ctx.query.name);
  const module = str(ctx.query.module);

  const item = getConfigItemByFullName(itemType, module, name);
  if (!item) throw notFound(`${itemType} '${module}.${name}' not found`);

  // Forms live on disk (config/forms/*.json) and are read per request, so markup edits
  // apply without a gateway restart. The DB backs every other item type.
  const configuration = readItemContent(item);
  return { cacheMd5: md5(configuration), configuration };
};

/** GET /api/services/app/ConfigurationItem/Get?itemType=&id= */
export const configurationItemGet: NativeHandler = (ctx) => {
  const id = str(ctx.query.id);
  const item = getConfigItemById(id);
  if (!item) throw notFound(`Configuration item '${id}' not found`);

  const configuration = readItemContent(item);
  return { cacheMd5: md5(configuration), configuration };
};

/**
 * GET /api/services/app/EntityConfig/GetEntityConfigForm?entityType=&typeName=
 * shesha-core returns an empty result when the entity has no form of that type configured,
 * which the client turns into a clean "not configured" error — better than a proxy failure.
 */
export const getEntityConfigForm: NativeHandler = () => null;

/** GET /api/services/app/ConfigurationStudio/GetModules */
export const getModules: NativeHandler = () => ({
  modules: modulesRepo.all().map((m) => ({
    // `id` is the same deterministic GUID the flat tree reports for the module node, so the
    // studio can send it back as `moduleId` when creating folders/items.
    id: toModuleId(m.name),
    name: m.name,
    alias: m.accessor,
    accessor: m.accessor,
    description: m.description,
    isEditable: Boolean(m.isEditable),
    permissions: [],
  })),
});

export const configurationHandlers: Record<string, NativeHandler> = {
  'metadata.get': metadataGet,
  'metadata.autocomplete': metadataAutocomplete,
  'configurationItem.getCurrent': configurationItemGetCurrent,
  'configurationItem.get': configurationItemGet,
  'entityConfig.getEntityConfigForm': getEntityConfigForm,
  'configurationStudio.getModules': getModules,
};
