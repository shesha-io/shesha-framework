/**
 * A deliberately small JsonLogic evaluator.
 *
 * shesha-core's `SheshaCrudServiceBase.CreateFilteredQuery` runs `input.Filter` through
 * `ApplyFilter<TEntity>`, and the React DataTable sends that filter as a JsonLogic document.
 * The gateway stores rows as JSON rather than in typed columns, so it evaluates the same
 * document in-process. Only the operators a Shesha filter can produce are implemented;
 * anything unknown is treated as "no constraint" so an exotic filter degrades to an
 * unfiltered list instead of throwing.
 */

type Json = unknown;

const isPlainObject = (value: Json): value is Record<string, Json> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Resolves a dotted path (`primaryOrganisation.name`) against a row. */
const readPath = (data: Json, path: string): Json => {
  if (!path) return data;
  return path.split('.').reduce<Json>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    if (Array.isArray(acc)) {
      const index = Number(key);
      return Number.isInteger(index) ? acc[index] : undefined;
    }
    return isPlainObject(acc) ? acc[key] : undefined;
  }, data);
};

const looseEqual = (a: Json, b: Json): boolean => {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) return a == null && b == null;
  // Shesha sends numbers as strings in query params, so compare primitives by string form.
  if (typeof a !== 'object' && typeof b !== 'object') return String(a) === String(b);
  return JSON.stringify(a) === JSON.stringify(b);
};

const toNumber = (value: Json): number => {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : NaN;
};

const compare = (a: Json, b: Json): number => {
  const na = toNumber(a);
  const nb = toNumber(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na < nb ? -1 : na > nb ? 1 : 0;
  return String(a ?? '').localeCompare(String(b ?? ''));
};

const isTruthy = (value: Json): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (value === '' || value === null || value === undefined || value === false || value === 0) return false;
  return true;
};

const asArray = (value: Json): Json[] => (Array.isArray(value) ? value : [value]);

/**
 * Evaluates a JsonLogic document against `data` and returns the resulting value.
 * Comparison/logical operators return a boolean; `var` returns the referenced value.
 */
export const evaluateJsonLogic = (logic: Json, data: Json): Json => {
  if (logic === null || logic === undefined || logic === '') return null;
  if (typeof logic !== 'object') return logic;
  if (Array.isArray(logic)) return logic.map((entry) => evaluateJsonLogic(entry, data));
  if (!isPlainObject(logic)) return logic;

  const entries = Object.entries(logic);
  if (entries.length !== 1) return logic;
  const [op, rawArgs] = entries[0];
  const args = asArray(rawArgs);
  const value = (index: number): Json => evaluateJsonLogic(args[index], data);

  switch (op) {
    case 'var':
      return readPath(data, String(rawArgs ?? ''));
    case 'missing':
      return args
        .map((arg) => String(evaluateJsonLogic(arg, data) ?? ''))
        .filter((name) => readPath(data, name) === undefined || readPath(data, name) === null);
    case '==':
      return looseEqual(value(0), value(1));
    case '===':
      return value(0) === value(1);
    case '!=':
      return !looseEqual(value(0), value(1));
    case '!==':
      return value(0) !== value(1);
    case '>':
      return compare(value(0), value(1)) > 0;
    case '>=':
      return compare(value(0), value(1)) >= 0;
    case '<':
      return compare(value(0), value(1)) < 0;
    case '<=':
      return compare(value(0), value(1)) <= 0;
    case 'and':
      return args.every((arg) => isTruthy(evaluateJsonLogic(arg, data)));
    case 'or':
      return args.some((arg) => isTruthy(evaluateJsonLogic(arg, data)));
    case '!':
      return !isTruthy(value(0));
    case '!!':
      return isTruthy(value(0));
    case 'in': {
      const needle = value(0);
      const haystack = value(1);
      if (typeof haystack === 'string') return haystack.includes(String(needle ?? ''));
      if (Array.isArray(haystack)) return haystack.some((entry) => looseEqual(entry, needle));
      return false;
    }
    case 'contains': {
      const haystack = value(0);
      const needle = value(1);
      if (typeof haystack === 'string') return haystack.includes(String(needle ?? ''));
      if (Array.isArray(haystack)) return haystack.some((entry) => looseEqual(entry, needle));
      return false;
    }
    case 'if': {
      for (let i = 0; i + 1 < args.length; i += 2) {
        if (isTruthy(evaluateJsonLogic(args[i], data))) return value(i + 1);
      }
      return args.length % 2 === 1 ? value(args.length - 1) : null;
    }
    default:
      // Unknown operator: don't silently drop rows the caller expects to see.
      return true;
  }
};

/** Does this row satisfy the filter document? */
export const applyJsonLogic = (logic: Json, data: Json): boolean =>
  logic === null || logic === undefined || logic === '' ? true : isTruthy(evaluateJsonLogic(logic, data));

/**
 * `filter` arrives either as an object or as a JSON string (ABP binds it from the query string).
 * Both are accepted; an unparseable string is ignored rather than failing the request.
 */
export const parseFilter = (filter: unknown): Json => {
  if (!filter) return null;
  if (typeof filter === 'string') {
    const trimmed = filter.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as Json;
    } catch {
      return null;
    }
  }
  return filter;
};
