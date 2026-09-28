/**
 * Transform engine — the reusable, data-driven core of the gateway.
 *
 * A single `applyMap(spec, source)` turns *any* backend's JSON into the shape
 * Shesha expects (and vice-versa for requests). It is deliberately tiny and
 * dependency-free so the same mechanism can be repurposed for every operation.
 *
 * Spec leaves:
 *   "$.a.b"                     path reference into `source`
 *   "$"                         the whole source
 *   { $path: "a.b" }            path reference
 *   { $const: v }               literal
 *   { $template: "x={{$.a}}" }  string template (single {{}} preserves type)
 *   { $coalesce: ["$.a","$.b"], $default: v }
 *   { $each: "$.items", $as: <spec> }   array map; inside, `$` = item, { $index: true } = index
 *   { $index: true }            current array index (inside $each)
 *   plain object / array        recursed
 */

export interface TransformMeta {
  index?: number;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Read a dotted/bracketed path from an object. "$" or "" returns the root. */
export const getByPath = (source: unknown, rawPath: string): unknown => {
  if (rawPath === '' || rawPath === '$') return source;
  const normalized = rawPath.replace(/^\$\.?/, '').replace(/\[(\d+)\]/g, '.$1');
  const segments = normalized.split('.').filter((s) => s !== '');
  let current: unknown = source;
  for (const seg of segments) {
    if (current === null || current === undefined) return undefined;
    if (Array.isArray(current)) {
      const idx = Number(seg);
      current = Number.isFinite(idx) ? current[idx] : undefined;
    } else if (isPlainObject(current)) {
      current = current[seg];
    } else {
      return undefined;
    }
  }
  return current;
};

const interpolate = (template: string, source: unknown, meta: TransformMeta): unknown => {
  const pattern = /\{\{\s*([^}]+?)\s*\}\}/g;
  const matches = [...template.matchAll(pattern)];
  if (matches.length === 0) return template;

  // If the whole string is a single placeholder, preserve the resolved type.
  const single = matches.length === 1 && template.trim() === matches[0][0].trim();
  if (single) {
    const expr = matches[0][1].trim();
    return expr === '$index' ? meta.index : getByPath(source, expr);
  }

  let out = template;
  for (const m of matches) {
    const expr = m[1].trim();
    const val = expr === '$index' ? meta.index : getByPath(source, expr);
    out = out.replace(m[0], val === undefined || val === null ? '' : String(val));
  }
  return out;
};

const looksLikePath = (s: string): boolean => s.startsWith('$');

/** Resolve a single mapping spec node against a source. */
export const resolveValue = (spec: unknown, source: unknown, meta: TransformMeta = {}): unknown => {
  if (typeof spec === 'string') {
    if (spec.includes('{{')) return interpolate(spec, source, meta);
    if (looksLikePath(spec)) return getByPath(source, spec);
    return spec; // literal string
  }

  if (Array.isArray(spec)) {
    return spec.map((item) => resolveValue(item, source, meta));
  }

  if (isPlainObject(spec)) {
    if ('$const' in spec) return spec.$const;
    if ('$path' in spec) return getByPath(source, String(spec.$path));
    if ('$template' in spec) return interpolate(String(spec.$template), source, meta);
    if ('$index' in spec) return meta.index;
    if ('$coalesce' in spec) {
      const candidates = Array.isArray(spec.$coalesce) ? spec.$coalesce : [spec.$coalesce];
      for (const c of candidates) {
        const v = resolveValue(c, source, meta);
        if (v !== undefined && v !== null) return v;
      }
      return '$default' in spec ? spec.$default : undefined;
    }
    if ('$each' in spec) {
      const list = resolveValue(spec.$each, source, meta);
      if (!Array.isArray(list)) return [];
      const asSpec = '$as' in spec ? spec.$as : '$';
      return list.map((item, index) => resolveValue(asSpec, item, { index }));
    }
    // plain object -> recurse into an output object
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(spec)) {
      const resolved = resolveValue(value, source, meta);
      if (resolved !== undefined) out[key] = resolved;
    }
    return out;
  }

  return spec; // number, boolean, null
};

/** Build the output described by `spec` from `source`. */
export const applyMap = (spec: unknown, source: unknown, meta: TransformMeta = {}): unknown =>
  resolveValue(spec, source, meta);
