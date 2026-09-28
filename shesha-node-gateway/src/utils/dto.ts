/**
 * Helpers for ABP/Shesha DTO shapes that arrive over the wire.
 */

export type Dto = Record<string, unknown>;

const isObject = (value: unknown): value is Dto =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Unwraps a Shesha `DynamicDto`.
 *
 * `DynamicDto<T>` serialises as `{ id, _jObject: { <TypeName>: { ...fields } } }` — the editable
 * fields live under a single type-named key so the server can tell hard-coded properties from
 * configured ones. shesha-core maps that straight onto the entity; the gateway flattens it so the
 * stored row is a plain document. A body that is not a DynamicDto passes through unchanged.
 */
export const flattenDynamicDto = (body: unknown): Dto => {
  if (!isObject(body)) return {};
  const { _jObject, ...rest } = body;

  let nested: Dto = {};
  if (isObject(_jObject)) {
    const values = Object.values(_jObject);
    // Single type-named wrapper -> unwrap it. Multiple keys means it is already flat.
    nested = values.length === 1 && isObject(values[0]) ? values[0] : _jObject;
  }

  return { ...nested, ...rest };
};

/** `PagedResultDto<T>` — what every ABP `GetAll` returns. */
export const pagedResult = <T>(items: T[], totalCount?: number): { totalCount: number; items: T[] } => ({
  totalCount: totalCount ?? items.length,
  items,
});

/**
 * Reads a scalar argument from the query string first, then the body.
 * ABP binds `?id=` for GET/DELETE and `{ id }` for POST/PUT, so callers vary.
 */
export const pickArg = (ctx: { query: Dto; body: Dto; params: Dto }, ...names: string[]): unknown => {
  for (const name of names) {
    if (ctx.query[name] !== undefined) return ctx.query[name];
    if (ctx.body[name] !== undefined) return ctx.body[name];
    if (ctx.params[name] !== undefined) return ctx.params[name];
  }
  return undefined;
};
