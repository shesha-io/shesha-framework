import fs from 'fs';
import path from 'path';
import { config, FormConfigurationSeed } from '../config';
import { newGuid } from '../utils/guid';

interface CachedForm {
  mtimeMs: number;
  form: FormConfigurationSeed;
}

/**
 * Forms are authored as files under `config/forms/*.json` (real Shesha markup dropped in
 * as-is). They are resolved from disk on every request — cached by file mtime — so editing
 * or adding a form takes effect immediately without restarting the gateway.
 *
 * The Form Designer writes back to the same files: `config/forms` is the single source of
 * truth for markup, so a save in the browser is a save on disk and the next request serves it.
 */
const cache = new Map<string, CachedForm>();

const formsDir = (): string => path.join(config.configDir, 'forms');

const readForm = (file: string): FormConfigurationSeed | undefined => {
  const cached = cache.get(file);
  let mtimeMs: number;
  try {
    mtimeMs = fs.statSync(file).mtimeMs;
  } catch {
    cache.delete(file);
    return undefined;
  }
  if (cached && cached.mtimeMs === mtimeMs) return cached.form;
  try {
    const form = JSON.parse(fs.readFileSync(file, 'utf-8')) as FormConfigurationSeed;
    cache.set(file, { mtimeMs, form });
    return form;
  } catch {
    cache.delete(file);
    return undefined;
  }
};

const formFiles = (): string[] => {
  try {
    return fs
      .readdirSync(formsDir())
      .filter((f) => f.toLowerCase().endsWith('.json'))
      .map((f) => path.join(formsDir(), f));
  } catch {
    return [];
  }
};

export interface StoredForm {
  file: string;
  form: FormConfigurationSeed;
}

/** Every form on disk, ordered by module then name. */
export const listForms = (): StoredForm[] => {
  const result: StoredForm[] = [];
  for (const file of formFiles()) {
    const form = readForm(file);
    if (form) result.push({ file, form });
  }
  return result.sort((a, b) =>
    `${a.form.module}/${a.form.name}`.localeCompare(`${b.form.module}/${b.form.name}`),
  );
};

/** Finds a form file by full name (module + name), case-insensitive. */
export const findStoredForm = (module: string, name: string): StoredForm | undefined => {
  const wantModule = String(module ?? '').toLowerCase();
  const wantName = String(name ?? '').toLowerCase();
  return listForms().find(
    ({ form }) =>
      String(form.module ?? '').toLowerCase() === wantModule && String(form.name ?? '').toLowerCase() === wantName,
  );
};

/** Finds a form by its GUID (the id the frontend caches and saves against). */
export const findStoredFormById = (id: string): StoredForm | undefined => {
  const wantId = String(id ?? '').toLowerCase();
  return wantId ? listForms().find(({ form }) => String(form.id ?? '').toLowerCase() === wantId) : undefined;
};

export const findForm = (module: string, name: string): FormConfigurationSeed | undefined =>
  findStoredForm(module, name)?.form;

export const findFormById = (id: string): FormConfigurationSeed | undefined => findStoredFormById(id)?.form;

const safeFileName = (name: string): string => {
  const cleaned = String(name ?? '')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-');
  return `${cleaned || `form-${newGuid()}`}.json`;
};

const writeFile = (file: string, form: FormConfigurationSeed): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(form, null, 2)}\n`, 'utf-8');
  cache.delete(file);
};

export interface SaveFormInput {
  /** existing form id; when omitted a new file with a fresh id is created */
  id?: string | null;
  module?: string | null;
  name?: string | null;
  label?: string | null;
  description?: string | null;
  /** serialized `{ components, formSettings }` */
  markup?: string | null;
  modelType?: string | null;
  access?: number | null;
  permissions?: string[] | null;
}

/**
 * Creates or updates a form file. Locating by id keeps the file name stable when only the
 * markup changes; a name change rewrites the file under the new name.
 */
export const saveForm = (input: SaveFormInput): FormConfigurationSeed => {
  const existing = input.id ? findStoredFormById(input.id) : undefined;
  const base = existing?.form;

  const form: FormConfigurationSeed = {
    id: base?.id ?? input.id ?? newGuid(),
    module: input.module ?? base?.module ?? 'Shesha',
    name: input.name ?? base?.name ?? '',
    label: input.label !== undefined ? input.label : base?.label ?? null,
    description: input.description !== undefined ? input.description : base?.description ?? null,
    markup: input.markup ?? base?.markup ?? JSON.stringify({ components: [], formSettings: {} }),
    modelType: input.modelType !== undefined ? input.modelType : base?.modelType ?? null,
    access: input.access !== undefined && input.access !== null ? input.access : base?.access ?? 0,
    permissions: input.permissions ?? base?.permissions ?? [],
  };
  if (!form.name) throw new Error('Form name is required');

  const target = path.join(formsDir(), safeFileName(form.name));
  if (existing && existing.file !== target) fs.rmSync(existing.file, { force: true });
  writeFile(target, form);
  return form;
};

export const deleteForm = (id: string): boolean => {
  const existing = findStoredFormById(id);
  if (!existing) return false;
  fs.rmSync(existing.file, { force: true });
  cache.delete(existing.file);
  return true;
};

export const renameFormFile = (id: string, name: string): FormConfigurationSeed | undefined => {
  const existing = findStoredFormById(id);
  if (!existing) return undefined;
  return saveForm({ ...existing.form, name });
};
