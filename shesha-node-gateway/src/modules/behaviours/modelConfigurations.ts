import { badRequest, notFound } from '../../abp/ajaxResponse';
import { ResourceDefinition } from '../../config/types';
import { metadataRepo } from '../../db/repositories';
import { GatewayRequestContext, NativeHandler } from '../../gateway/native';
import { pagedResult, pickArg } from '../../utils/dto';
import { configItemId } from '../../utils/guid';
import {
  ConfigItemInfo,
  ensureModuleEditable,
  getConfigItemById,
  listConfigItems,
  readItemContent,
} from '../configStore';
import { configItemCrud } from '../crud/configItemCrud';
import { parseQueryOptions, Row } from '../entityStore';
import { applyJsonLogic, parseFilter } from '../../utils/jsonLogic';
import { BehaviourHandler } from './types';

/**
 * `api/ModelConfigurations` — the Entity Designer's read/write API.
 *
 * In shesha-core a `ModelConfiguration` *is* the `EntityConfig` configuration item, which is why
 * this is bound to the `entity` item type rather than to its own store: the designer, the
 * Configuration Studio tree and this API then all edit the same document. The route shape is the
 * odd one out (`/api/ModelConfigurations/{id}` instead of `/api/services/app/...`), so the CRUD
 * verbs delegate to `configItemCrud` and only the two lookups are bespoke.
 */

/** `MetadataSourceType`: Application = 1, UserDefined = 2. */
const SOURCE_APPLICATION = 1;
const SOURCE_USER_DEFINED = 2;
/** `EntityConfigTypes`: Class = 1, Interface = 2. */
const ENTITY_CONFIG_TYPE_CLASS = 1;

/**
 * The `entity` config item type, described as a resource so the generic CRUD engine can be reused
 * for the write verbs. `config/resources.json` carries the same entry for routing; this copy exists
 * because `create`/`update`/`merge` call `configItemCrud` directly and would otherwise have to
 * import the registry they are being dispatched from.
 */
export const ENTITY_CONFIG_RESOURCE: ResourceDefinition = {
  service: 'ModelConfigurations',
  serviceModule: '*',
  description: 'Entity Designer model configurations, stored as `entity` configuration items',
  storage: { kind: 'configItem', itemType: 'entity' },
};

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

const bool = (value: unknown, fallback: boolean): boolean => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

/** `ModelConfigurationDto`, with the fields the gateway does not model defaulted as core does. */
export const toModelConfigurationDto = (item: ConfigItemInfo, content: Record<string, unknown>): Row => ({
  id: item.id,
  className: content.className ?? item.name,
  namespace: content.namespace ?? item.module,
  generateAppService: bool(content.generateAppService, false),
  allowConfigureAppService: bool(content.allowConfigureAppService, !item.isCodeBased),
  properties: Array.isArray(content.properties) ? content.properties : [],
  moduleId: null,
  module: item.module,
  name: item.name,
  label: item.label,
  description: item.description,
  versionNo: null,
  suppress: bool(content.suppress, false),
  notImplemented: false,
  source: item.isCodeBased ? SOURCE_APPLICATION : SOURCE_USER_DEFINED,
  entityConfigType: ENTITY_CONFIG_TYPE_CLASS,
  permission: null,
  permissionGet: null,
  permissionCreate: null,
  permissionUpdate: null,
  permissionDelete: null,
  viewConfigurations: [],
  initStatus: null,
  initMessage: null,
});

const entityItems = (): { item: ConfigItemInfo; content: Record<string, unknown> }[] =>
  listConfigItems()
    .filter((item) => item.itemType === 'entity')
    .map((item) => ({ item, content: readItemContent(item) }));

const lastSegment = (value: string): string => {
  const trimmed = str(value);
  return trimmed.slice(trimmed.lastIndexOf('.') + 1);
};

/**
 * Code-based entities as model configurations.
 *
 * A CLR entity has no `entity` configuration item — it only exists as metadata — yet core still
 * lists it in the Entity Designer as an `EntityConfig` with `Source = Application`. Without this
 * the designer would show nothing but user-defined models, and `?className=Shesha.Core.Person`
 * would 404 for every entity the framework itself declares. These are read-only: there is no
 * document behind them to write to, so the id is the one a user-defined item of the same natural
 * key would have, and the write verbs keep going through `configItemCrud`.
 */
const codeBasedItems = (): { item: ConfigItemInfo; content: Record<string, unknown> }[] => {
  const configured = new Set(entityItems().map(({ item }) => item.name.toLowerCase()));
  return metadataRepo.all()
    .map((row) => {
      const stored = JSON.parse(row.json) as Record<string, unknown>;
      const className = str(stored.fullClassName ?? row.entityType);
      const moduleName = str(stored.moduleAccessor ?? row.module) || 'Shesha';
      const name = lastSegment(className);
      return { stored, className, moduleName, name };
    })
    .filter(({ name }) => !configured.has(name.toLowerCase()))
    .map(({ stored, className, moduleName, name }) => ({
      item: {
        id: configItemId('entity', moduleName, name),
        itemType: 'entity',
        discriminator: 'entity',
        module: moduleName,
        name,
        label: str(stored.label) || name,
        description: (stored.description as string | null) ?? null,
        folderId: null,
        applicationId: null,
        isCodeBased: true,
        isExposed: false,
        lastModificationTime: null,
        lastModifierUser: null,
        source: 'config-items',
      } satisfies ConfigItemInfo,
      content: { ...stored, className, namespace: moduleName },
    }));
};

/** Every model configuration the designer can see: user-defined items plus code-based entities. */
const allModelConfigurations = (): { item: ConfigItemInfo; content: Record<string, unknown> }[] => [
  ...entityItems(),
  ...codeBasedItems(),
];

/** GET /api/ModelConfigurations?className=&namespace=&module=&useExposed= */
export const getByName: BehaviourHandler = (ctx) => {
  const className = str(pickArg(ctx, 'className', 'ClassName', 'name', 'Name'));
  if (!className) throw badRequest('`className` is required');
  const moduleName = str(pickArg(ctx, 'module', 'Module'));

  const needle = className.toLowerCase();
  const shortNeedle = lastSegment(className).toLowerCase();

  const match = allModelConfigurations().find(({ item, content }) => {
    if (moduleName && item.module.toLowerCase() !== moduleName.toLowerCase()) return false;
    const candidate = str(content.className ?? item.name).toLowerCase();
    return candidate === needle || candidate === shortNeedle || item.name.toLowerCase() === shortNeedle;
  });
  if (!match) throw notFound('Model configuration not found');

  return toModelConfigurationDto(match.item, match.content);
};

/** GET /api/ModelConfigurations/{id} */
export const getById: BehaviourHandler = (ctx) => {
  const id = str(ctx.params.id ?? pickArg(ctx, 'id', 'Id'));
  const configured = getConfigItemById(id);
  if (configured?.itemType === 'entity') return toModelConfigurationDto(configured, readItemContent(configured));

  const wanted = id.toLowerCase();
  const codeBased = codeBasedItems().find(({ item }) => item.id.toLowerCase() === wanted);
  if (!codeBased) throw notFound('Model configuration not found');
  return toModelConfigurationDto(codeBased.item, codeBased.content);
};

/**
 * GET /api/ModelConfigurations/GetAll — not part of shesha-core's surface, but the designer's
 * entity list needs one, and it is the same paged contract as every other `GetAll`.
 */
export const getAll: BehaviourHandler = (ctx) => {
  const options = parseQueryOptions(ctx);
  const logic = parseFilter(options.filter);

  let rows = allModelConfigurations().map(({ item, content }) => toModelConfigurationDto(item, content));
  rows = rows.filter((row) => applyJsonLogic(logic, row));

  if (options.quickSearch) {
    const needle = options.quickSearch.toLowerCase();
    rows = rows.filter((row) =>
      [row.name, row.label, row.className, row.module].some((value) => str(value).toLowerCase().includes(needle)),
    );
  }

  const totalCount = rows.length;
  const skip = options.skipCount ?? 0;
  if (skip > 0) rows = rows.slice(skip);
  if (options.maxResultCount !== undefined && options.maxResultCount >= 0) {
    rows = rows.slice(0, options.maxResultCount);
  }
  return pagedResult(rows, totalCount);
};

/** POST /api/ModelConfigurations — `ModelConfigurationCreateDto`. */
export const create: BehaviourHandler = (ctx) => {
  const body = ctx.body ?? {};
  const className = str(body.className ?? body.name).trim();
  if (!className) throw badRequest('`className` is required');

  const moduleName = str(body.module ?? body.namespace) || 'Shesha';
  ensureModuleEditable(moduleName);

  const result = configItemCrud(
    { ...ctx, body: { ...body, module: moduleName, name: lastSegment(className), className } },
    ENTITY_CONFIG_RESOURCE,
    'create',
  ) as Row;
  return getByIdResult(str(result.id));
};

/** PUT /api/ModelConfigurations — `ModelConfigurationDto`. */
export const update: BehaviourHandler = (ctx) => {
  const result = configItemCrud(ctx, ENTITY_CONFIG_RESOURCE, 'update') as Row;
  return getByIdResult(str(result.id));
};

const getByIdResult = (id: string): Row => {
  const item = getConfigItemById(id);
  if (!item) throw notFound('Model configuration not found');
  return toModelConfigurationDto(item, readItemContent(item));
};

/**
 * POST /api/ModelConfigurations/merge — `MergeConfigurationDto{sourceId, destinationId,
 * deleteAfterMerge}`. Properties are what actually differs between two configurations, so the
 * merge is a property-list replacement keyed by `id`, preserving the destination's other fields.
 */
export const merge: BehaviourHandler = (ctx: GatewayRequestContext) => {
  const body = ctx.body ?? {};
  const sourceId = str(body.sourceId);
  const destinationId = str(body.destinationId);
  if (!sourceId || !destinationId) throw badRequest('`sourceId` and `destinationId` are required');

  const source = getConfigItemById(sourceId);
  const destination = getConfigItemById(destinationId);
  if (!source || source.itemType !== 'entity') throw notFound(`Model configuration '${sourceId}' not found`);
  if (!destination || destination.itemType !== 'entity') throw notFound(`Model configuration '${destinationId}' not found`);
  ensureModuleEditable(destination.module);

  const sourceContent = readItemContent(source);
  const destinationContent = readItemContent(destination);
  const merged = {
    ...destinationContent,
    properties: Array.isArray(sourceContent.properties) ? sourceContent.properties : [],
    id: destination.id,
    module: destination.module,
    name: destination.name,
  };

  const result = configItemCrud(
    { ...ctx, body: { ...merged, id: destinationId } },
    ENTITY_CONFIG_RESOURCE,
    'update',
  ) as Row;

  if (bool(body.deleteAfterMerge, false)) {
    configItemCrud({ ...ctx, query: { ...ctx.query, id: sourceId } }, ENTITY_CONFIG_RESOURCE, 'delete');
  }
  return result;
};

/**
 * `/api/ModelConfigurations/{id}` cannot be expressed by the generic wildcards — the id lands in
 * the `:action` segment of `/api/:service/:action`, where it is indistinguishable from a real
 * action name. So it keeps one explicit operation entry, and this is the native handler it names.
 */
export const modelConfigurationHandlers: Record<string, NativeHandler> = {
  'modelConfigurations.getById': (ctx) => getById(ctx, ENTITY_CONFIG_RESOURCE),
};
