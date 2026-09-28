import { badRequest, notFound } from '../abp/ajaxResponse';
import { itemRevisionsRepo, usersRepo } from '../db/repositories';
import { rawFile } from '../gateway/native';
import { NativeHandler } from '../gateway/native';
import { newGuid } from '../utils/guid';
import {
  ConfigItemInfo,
  ensureModuleEditable,
  md5,
  readItemContent,
  requireConfigItemById,
  writeItemContent,
} from './configStore';
import { findForm, findFormById, deleteForm, listForms, saveForm } from './formsStore';

const str = (v: unknown, fallback = ''): string => (v === undefined || v === null ? fallback : String(v));

/**
 * A form as the frontend's `FormConfigurationDto` expects it: `markup` is a JSON *string*
 * (the client does `JSON.parse(markup)`), and label/description must be present.
 */
const toFormDto = (form: Record<string, unknown>): Record<string, unknown> => ({
  id: form.id,
  module: form.module ?? '',
  name: form.name ?? '',
  label: form.label ?? form.name ?? null,
  description: form.description ?? null,
  markup: typeof form.markup === 'string' ? form.markup : JSON.stringify(form.markup ?? { components: [], formSettings: {} }),
  modelType: form.modelType ?? null,
  access: form.access ?? null,
  permissions: Array.isArray(form.permissions) ? form.permissions : [],
  version: form.version ?? 1,
  isPublished: form.isPublished ?? true,
  suppress: form.suppress ?? false,
});

const requireFormById = (id: string): Record<string, unknown> => {
  const form = findFormById(id);
  if (!form) throw notFound(`Form '${id}' not found`);
  return { ...form } as unknown as Record<string, unknown>;
};

const currentUserName = (ctx: { user: { sub?: string } | null }): string | null => {
  if (!ctx.user) return null;
  const user = usersRepo.findById(Number(ctx.user.sub));
  return user?.userName ?? null;
};

/** Snapshots the content being replaced so the studio's history panel has real entries. */
const addRevision = (item: ConfigItemInfo, previous: Record<string, unknown>, user: string | null): void => {
  itemRevisionsRepo.add({
    id: newGuid(),
    itemId: item.id,
    moduleName: item.module,
    configHash: md5(previous),
    json: previous,
    creatorUserId: user,
    creatorUserName: user,
  });
};

/** GET /api/services/Shesha/FormConfiguration/Get?id= */
export const get: NativeHandler = (ctx) => toFormDto(requireFormById(str(ctx.query.id)));

/** GET /api/services/Shesha/FormConfiguration/GetAll */
export const getAll: NativeHandler = () => {
  const items = listForms().map(({ form }) => toFormDto(form as unknown as Record<string, unknown>));
  return { totalCount: items.length, items };
};

/** POST /api/services/Shesha/FormConfiguration/Create */
export const create: NativeHandler = (ctx) => {
  const moduleName = str(ctx.body.module, 'Shesha');
  ensureModuleEditable(moduleName);

  const form = saveForm({
    module: moduleName,
    name: str(ctx.body.name) || undefined,
    label: str(ctx.body.label) || str(ctx.body.name) || null,
    description: ctx.body.description === undefined ? null : str(ctx.body.description),
    markup: str(ctx.body.markup) || JSON.stringify({ components: [], formSettings: {} }),
    modelType: ctx.body.modelType === undefined ? null : str(ctx.body.modelType),
  });
  return toFormDto(form as unknown as Record<string, unknown>);
};

/** PUT /api/services/Shesha/FormConfiguration/Update */
export const update: NativeHandler = (ctx) => {
  const id = str(ctx.body.id);
  const previous = requireFormById(id);
  ensureModuleEditable(str(previous.module, 'Shesha'));

  const form = saveForm({
    id,
    module: ctx.body.module === undefined ? str(previous.module) : str(ctx.body.module),
    name: ctx.body.name === undefined ? str(previous.name) : str(ctx.body.name),
    label: ctx.body.label === undefined ? null : str(ctx.body.label),
    description: ctx.body.description === undefined ? null : str(ctx.body.description),
    markup: ctx.body.markup === undefined ? str(previous.markup) : str(ctx.body.markup),
    modelType: ctx.body.modelType === undefined ? null : str(ctx.body.modelType),
  });

  const item: ConfigItemInfo = {
    id: form.id,
    itemType: 'form',
    discriminator: 'form',
    module: form.module,
    name: form.name,
    label: form.label ?? form.name,
    description: form.description ?? null,
    folderId: null,
    applicationId: null,
    isCodeBased: false,
    isExposed: false,
    lastModificationTime: null,
    lastModifierUser: null,
    source: 'form-file',
  };
  addRevision(item, previous, currentUserName(ctx));
  return toFormDto(form as unknown as Record<string, unknown>);
};

/**
 * PUT /api/services/Shesha/FormConfiguration/UpdateMarkup
 * This is the Form Designer's save button (formPersister.saveForm). shesha-core's
 * `UpdateMarkupAsync` loads the form by id, calls `Module.EnsureEditable()`, then replaces
 * markup/modelType/access/permissions — mirrored here, writing back to `config/forms`.
 */
export const updateMarkup: NativeHandler = (ctx) => {
  const id = str(ctx.body.id);
  if (!id) throw badRequest('Form id is required');

  const previous = requireFormById(id);
  ensureModuleEditable(str(previous.module, 'Shesha'));

  const markup = ctx.body.markup;
  if (typeof markup !== 'string') throw badRequest('Markup must be a JSON string');
  try {
    JSON.parse(markup);
  } catch {
    throw badRequest('Markup is not valid JSON');
  }

  const permissions = Array.isArray(ctx.body.permissions) ? (ctx.body.permissions as string[]) : undefined;
  const form = saveForm({
    id,
    markup,
    modelType: ctx.body.modelType === undefined || ctx.body.modelType === null ? null : str(ctx.body.modelType),
    access: ctx.body.access === undefined || ctx.body.access === null ? null : Number(ctx.body.access),
    permissions: permissions ?? null,
  });

  addRevision(
    requireConfigItemById(form.id) ?? formItemOf(form),
    previous,
    currentUserName(ctx),
  );
  return null;
};

const formItemOf = (form: { id: string; module: string; name: string; label?: string | null; description?: string | null }): ConfigItemInfo => ({
  id: form.id,
  itemType: 'form',
  discriminator: 'form',
  module: form.module,
  name: form.name,
  label: form.label ?? form.name,
  description: form.description ?? null,
  folderId: null,
  applicationId: null,
  isCodeBased: false,
  isExposed: false,
  lastModificationTime: null,
  lastModifierUser: null,
  source: 'form-file',
});

/** DELETE /api/services/Shesha/FormConfiguration/Delete?id= */
export const remove: NativeHandler = (ctx) => {
  const id = str(ctx.query.id ?? ctx.body.id);
  const form = findFormById(id);
  if (!form) throw notFound(`Form '${id}' not found`);
  ensureModuleEditable(form.module);
  deleteForm(id);
  itemRevisionsRepo.deleteForItem(id);
  return null;
};

/**
 * POST /api/services/Shesha/FormConfiguration/CheckPermissions
 * Body: `[{module, name}]`. shesha-core returns only the forms that actually have
 * permissions, so with unpermissioned seed forms the answer is an empty array — which is
 * what the main-menu provider needs to finish resolving menu items.
 */
export const checkPermissions: NativeHandler = (ctx) => {
  const input = Array.isArray(ctx.body) ? (ctx.body as Record<string, unknown>[]) : [];
  return input
    .map((entry) => {
      const moduleName = str(entry?.module);
      const name = str(entry?.name);
      const form = findFormByName(moduleName, name);
      const permissions = Array.isArray(form?.permissions) ? (form!.permissions as string[]) : [];
      return permissions.length > 0 ? { module: moduleName, name, permissions } : null;
    })
    .filter((entry) => entry !== null);
};

const findFormByName = (module: string, name: string) => findForm(module, name);

/**
 * GET /api/services/Shesha/FormConfiguration/GetJson?id=
 * Returns the configuration document as a downloadable file (not an ABP envelope).
 */
export const getJson: NativeHandler = (ctx) => {
  const id = str(ctx.query.id);
  const item = requireConfigItemById(id);
  const content = readItemContent(item);
  return rawFile(JSON.stringify(content, null, 2), {
    contentType: 'application/json',
    fileName: `${item.module}-${item.name}-${item.itemType}.json`,
  });
};

/** GET /api/services/Shesha/FormConfiguration/GetAnonymousForms */
export const getAnonymousForms: NativeHandler = () => [];

/** Re-reads and rewrites an item's document — used by the studio after a rename/duplicate. */
export const persistContent = (item: ConfigItemInfo, content: Record<string, unknown>): void =>
  writeItemContent(item, content);

export const formConfigurationHandlers: Record<string, NativeHandler> = {
  'formConfiguration.get': get,
  'formConfiguration.getAll': getAll,
  'formConfiguration.create': create,
  'formConfiguration.update': update,
  'formConfiguration.delete': remove,
  'formConfiguration.updateMarkup': updateMarkup,
  'formConfiguration.checkPermissions': checkPermissions,
  'formConfiguration.getJson': getJson,
  'formConfiguration.getAnonymousForms': getAnonymousForms,
};
