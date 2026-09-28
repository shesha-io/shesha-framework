import { notFound } from '../abp/ajaxResponse';
import { entityAuditRepo, entityRowsRepo, usersRepo } from '../db/repositories';
import { GatewayRequestContext } from '../gateway/native';
import { newGuid } from '../utils/guid';
import { applyJsonLogic, parseFilter } from '../utils/jsonLogic';

/**
 * The generic entity store.
 *
 * shesha-core exposes every entity through the same five ABP actions (`Get`, `GetAll`, `Create`,
 * `Update`, `Delete` on `SheshaCrudServiceBase` / `DynamicCrudAppService`) with the same
 * `PropsFilteredPagedAndSortedResultRequestDto` in and `PagedResultDto<T>` out. That regularity is
 * what makes one engine enough: the resource registry only has to say *which* rows a service name
 * refers to, and everything else — filtering, quick search, sorting, paging, soft delete, audit —
 * is shared. Adding an entity is a declaration, not a new table plus a new handler.
 */

export type Row = Record<string, unknown>;

export interface EntityRef {
  module: string;
  entity: string;
}

/** `PagedResultDto<T>` — the shape every GetAll in shesha-core returns. */
export interface PagedResult<T> {
  totalCount: number;
  items: T[];
}

export interface QueryOptions {
  filter?: unknown;
  quickSearch?: string;
  quickSearchProperties?: string[];
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

/** Fields tried, in order, when a row needs a `_displayName` (Shesha's entity-reference contract). */
const DISPLAY_FIELDS = ['displayName', 'fullName', 'label', 'name', 'item', 'description', 'title', 'alias'];

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

const toInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : undefined;
};

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === 'string' && value.trim()) {
    // ABP binds `quickSearchProperties=a&quickSearchProperties=b` and also `?quickSearchProperties[]=a`.
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return [];
};

/** Pulls the `GetAll` input out of either the query string or the request body. */
export const parseQueryOptions = (ctx: GatewayRequestContext): QueryOptions => {
  const source: Row = { ...ctx.query, ...ctx.body };
  const pick = (name: string, ...aliases: string[]): unknown => {
    for (const key of [name, ...aliases]) {
      if (source[key] !== undefined) return source[key];
      const camel = key.charAt(0).toLowerCase() + key.slice(1);
      if (source[camel] !== undefined) return source[camel];
    }
    return undefined;
  };

  return {
    filter: pick('Filter', 'filter'),
    quickSearch: str(pick('QuickSearch', 'quickSearch')) || undefined,
    quickSearchProperties: toArray(pick('QuickSearchProperties', 'quickSearchProperties')),
    sorting: str(pick('Sorting', 'sorting')) || undefined,
    skipCount: toInt(pick('SkipCount', 'skipCount')),
    maxResultCount: toInt(pick('MaxResultCount', 'maxResultCount')),
  };
};

/** Reads an id from wherever ABP put it: `?id=`, `{ id }`, or a `Delete?id=` body. */
export const pickId = (ctx: GatewayRequestContext): string => {
  const raw = ctx.query.id ?? ctx.body.id ?? ctx.params.id;
  return str(raw);
};

export const currentUserName = (ctx: GatewayRequestContext): string | null => {
  if (!ctx.user) return null;
  const row = usersRepo.findById(Number(ctx.user.sub));
  if (!row) return null;
  return [row.firstName, row.lastName].filter(Boolean).join(' ') || row.userName;
};

const currentUserId = (ctx: GatewayRequestContext): string | null =>
  ctx.user ? String(ctx.user.sub) : null;

const parseRow = (row: { json: string }): Row => {
  try {
    const parsed = JSON.parse(row.json) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Row) : {};
  } catch {
    return {};
  }
};

const displayNameOf = (row: Row): string => {
  for (const field of DISPLAY_FIELDS) {
    const value = row[field];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return str(row.id);
};

/**
 * Shapes a stored row into a Shesha dynamic DTO. `_className` / `_displayName` are what the
 * frontend reads when the row is referenced from another entity (`GuidEntityReferenceDto`).
 */
export const toDto = (ref: EntityRef, row: Row): Row => ({
  ...row,
  _className: `${ref.module}.${ref.entity}`,
  _displayName: row._displayName ?? displayNameOf(row),
});

const matchesQuickSearch = (row: Row, term: string, properties: string[]): boolean => {
  const needle = term.toLowerCase();
  const keys = properties.length ? properties : Object.keys(row);
  return keys.some((key) => {
    const value = row[key];
    if (value === null || value === undefined) return false;
    if (typeof value === 'object') return JSON.stringify(value).toLowerCase().includes(needle);
    return String(value).toLowerCase().includes(needle);
  });
};

/** `"name desc, orderIndex"` -> [{field, desc}] — ABP's `Sorting` grammar. */
const parseSorting = (sorting: string | undefined): { field: string; desc: boolean }[] =>
  (sorting ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [field, direction] = part.split(/\s+/);
      return { field, desc: String(direction ?? '').toLowerCase() === 'desc' };
    });

const compareRows = (a: Row, b: Row, sorting: { field: string; desc: boolean }[]): number => {
  for (const { field, desc } of sorting) {
    const av = a[field];
    const bv = b[field];
    if (av === bv) continue;
    if (av === null || av === undefined) return desc ? 1 : -1;
    if (bv === null || bv === undefined) return desc ? -1 : 1;
    const an = typeof av === 'number' ? av : parseFloat(String(av));
    const bn = typeof bv === 'number' ? bv : parseFloat(String(bv));
    const result =
      Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(av).localeCompare(String(bv));
    if (result !== 0) return desc ? -result : result;
  }
  return 0;
};

/** `GetAll`: filter (JsonLogic) -> quick search -> sort -> page. */
export const listRows = (ref: EntityRef, options: QueryOptions = {}): PagedResult<Row> => {
  const rows = entityRowsRepo.all(ref.module, ref.entity).map((row) => parseRow(row));
  const logic = parseFilter(options.filter);

  let items = rows.filter((row) => applyJsonLogic(logic, row));

  if (options.quickSearch) {
    items = items.filter((row) =>
      matchesQuickSearch(row, options.quickSearch as string, options.quickSearchProperties ?? []),
    );
  }

  const sorting = parseSorting(options.sorting);
  if (sorting.length) items = [...items].sort((a, b) => compareRows(a, b, sorting));

  const totalCount = items.length;
  const skip = options.skipCount ?? 0;
  const take = options.maxResultCount;
  if (skip > 0) items = items.slice(skip);
  if (take !== undefined && take >= 0) items = items.slice(0, take);

  return { totalCount, items: items.map((row) => toDto(ref, row)) };
};

export const getRow = (ref: EntityRef, id: string): Row | undefined => {
  const row = entityRowsRepo.get(ref.module, ref.entity, id);
  return row ? toDto(ref, parseRow(row)) : undefined;
};

export const requireRow = (ref: EntityRef, id: string): Row => {
  const row = getRow(ref, id);
  if (!row) throw notFound(`There is no ${ref.entity} with id '${id}'`);
  return row;
};

/** Finds a row by any single field — how name-keyed services (`Permission/Delete?name=`) resolve. */
export const findByField = (ref: EntityRef, field: string, value: string): Row | undefined => {
  const needle = String(value).toLowerCase();
  const hit = entityRowsRepo
    .all(ref.module, ref.entity)
    .map((row) => parseRow(row))
    .find((row) => String(row[field] ?? '').toLowerCase() === needle);
  return hit ? toDto(ref, hit) : undefined;
};

export const allRows = (ref: EntityRef): Row[] =>
  entityRowsRepo.all(ref.module, ref.entity).map((row) => toDto(ref, parseRow(row)));

const audit = (
  ref: EntityRef,
  ctx: GatewayRequestContext | null,
  entityId: string,
  eventType: 'Created' | 'Updated' | 'Deleted',
  detail?: string,
): void => {
  entityAuditRepo.add({
    entityId,
    entityModule: ref.module,
    entityName: ref.entity,
    eventType,
    eventText: `${ref.entity} ${eventType.toLowerCase()}`,
    extendedDescription: detail ?? null,
    userFullName: ctx ? currentUserName(ctx) : null,
  });
};

export const createRow = (ref: EntityRef, data: Row, ctx: GatewayRequestContext | null = null): Row => {
  const id = str(data.id) || newGuid();
  const stored: Row = { ...data, id };
  entityRowsRepo.insert({
    id,
    module: ref.module,
    entityName: ref.entity,
    json: stored,
    creatorUserId: ctx ? currentUserId(ctx) : null,
  });
  audit(ref, ctx, id, 'Created');
  return toDto(ref, stored);
};

export const updateRow = (
  ref: EntityRef,
  id: string,
  patch: Row,
  ctx: GatewayRequestContext | null = null,
): Row => {
  const existing = requireRow(ref, id);
  const stored: Row = { ...existing, ...patch, id, _className: undefined, _displayName: undefined };
  delete stored._className;
  delete stored._displayName;
  entityRowsRepo.update(ref.module, ref.entity, id, stored, ctx ? currentUserId(ctx) : null);
  audit(ref, ctx, id, 'Updated');
  return toDto(ref, stored);
};

/** Soft delete, matching ABP's `ISoftDelete` — history stays queryable. */
export const deleteRow = (ref: EntityRef, id: string, ctx: GatewayRequestContext | null = null): boolean => {
  const deleted = entityRowsRepo.softDelete(ref.module, ref.entity, id);
  if (deleted) audit(ref, ctx, id, 'Deleted');
  return deleted;
};

/** Writes rows directly, bypassing the audit trail — used by the seed. */
export const putRow = (ref: EntityRef, id: string, data: Row): void => {
  entityRowsRepo.put(ref.module, ref.entity, id, { ...data, id });
};
