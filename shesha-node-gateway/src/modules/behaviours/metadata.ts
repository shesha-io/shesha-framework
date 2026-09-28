import { badRequest } from '../../abp/ajaxResponse';
import { metadataRepo } from '../../db/repositories';
import { BehaviourHandler } from './types';

/**
 * The two `Metadata` endpoints the designers use for type/property pickers.
 *
 * Both return `List<AutocompleteItemDto>` — `{ value, displayText }` — and both follow
 * `MetadataAppService.FilterModels` / `FilterProperties`: an empty `term` with a `selectedValue`
 * is a *preselection* (return just the current value so the control can render its label),
 * otherwise return the ten closest matches.
 */

const AUTOCOMPLETE_LIMIT = 10;

const str = (value: unknown, fallback = ''): string =>
  value === undefined || value === null ? fallback : String(value);

interface AutocompleteItemDto {
  value: string;
  displayText: string;
}

interface ModelInfo {
  name: string;
  className: string;
  alias: string;
}

const allModels = (): ModelInfo[] =>
  metadataRepo.all().map((row) => {
    const stored = JSON.parse(row.json) as Record<string, unknown>;
    const className = str(stored.fullClassName ?? row.entityType);
    return {
      name: str(stored.name ?? className.slice(className.lastIndexOf('.') + 1)),
      className,
      alias: str(stored.typeShortAlias),
    };
  });

/** `MetadataAppService.FilterModels`, minus the CLR type hierarchy the gateway does not have. */
const filterModels = (models: ModelInfo[], term: string, selectedValue: string): AutocompleteItemDto[] => {
  const isPreselection = !term.trim() && Boolean(selectedValue.trim());
  const needle = term.trim().toLowerCase();

  const matched = isPreselection
    ? models.filter(
        (m) => m.className === selectedValue || (m.alias && m.alias === selectedValue),
      )
    : models
        .filter((m) => !m.className.includes('AspNetCore'))
        .filter(
          (m) =>
            !needle ||
            m.className.toLowerCase().includes(needle) ||
            (m.alias && m.alias.toLowerCase().includes(needle)) ||
            m.name.toLowerCase().includes(needle),
        )
        .sort((a, b) => a.className.localeCompare(b.className))
        .slice(0, AUTOCOMPLETE_LIMIT);

  // `DistinctBy(e => e.FullClassName)` in core: an entity can be reachable by alias and by name.
  const seen = new Set<string>();
  const distinct = matched.filter((model) => {
    if (seen.has(model.className)) return false;
    seen.add(model.className);
    return true;
  });

  return distinct.map((m) => ({ value: m.alias || m.className, displayText: `${m.name} (${m.className})` }));
};

/**
 * GET /api/services/app/Metadata/EntityTypeAutocomplete?term=&selectedValue=&baseClass=
 *
 * `baseClass` narrows the list to subtypes of a base entity in shesha-core. The gateway stores
 * metadata documents without an inheritance graph, so the parameter is accepted and ignored —
 * returning the full list is the safe degradation (a picker shows too much, never too little).
 */
export const entityTypeAutocomplete: BehaviourHandler = (ctx) =>
  filterModels(allModels(), str(ctx.query.term ?? ctx.body.term), str(ctx.query.selectedValue ?? ctx.body.selectedValue));

/** GET /api/services/app/Metadata/TypeAutocomplete?term=&selectedValue= */
export const typeAutocomplete: BehaviourHandler = (ctx) =>
  filterModels(allModels(), str(ctx.query.term ?? ctx.body.term), str(ctx.query.selectedValue ?? ctx.body.selectedValue));

/** `MetadataAppService.ParseContainer` — `'module:name'` or a bare class name. */
const parseContainer = (container: string): { module: string; name: string } => {
  const value = str(container).trim();
  if (!value) throw badRequest('`container` is mandatory');
  const parts = value.split(':');
  if (parts.length > 2) {
    throw badRequest(`Incorrect container format '${value}'. Should be 'module:name' or 'className'`);
  }
  return parts.length > 1 ? { module: parts[0], name: parts[1] } : { module: '', name: parts[0] };
};

const lastSegment = (value: string): string => value.slice(value.lastIndexOf('.') + 1);

/**
 * Resolves a parsed container to its metadata row.
 *
 * The container names a *configuration item* (`Shesha:Person`) while metadata rows are keyed by
 * CLR class name (`Shesha.Core.Person`); core bridges the two through the entity config store. The
 * gateway has no such store for code-based entities, so the name is matched against every form it
 * can legitimately arrive in — full class name, short class name, stored `name` or `label`. The
 * module narrows the search when one is given, and is dropped rather than failing the lookup, since
 * a designer asking about `Person` should still find it.
 */
const findContainerRow = (moduleName: string, name: string) => {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;

  const rows = metadataRepo.all();
  const scoped = moduleName
    ? rows.filter((row) => str(row.module).toLowerCase() === moduleName.toLowerCase())
    : [];

  return [...(scoped.length ? scoped : []), ...rows].find((row) => {
    const stored = JSON.parse(row.json) as Record<string, unknown>;
    const className = str(stored.fullClassName ?? row.entityType);
    return [className, lastSegment(className), str(stored.name), str(stored.label), str(row.entityType)].some(
      (candidate) => candidate.toLowerCase() === needle,
    );
  });
};

/** `MetadataAppService.FilterProperties`. */
const filterProperties = (
  properties: Record<string, unknown>[],
  term: string,
  selectedValue: string,
): AutocompleteItemDto[] => {
  const isPreselection = !term.trim() && Boolean(selectedValue.trim());
  const needle = term.trim().toLowerCase();
  const label = (p: Record<string, unknown>): string => str(p.label) || str(p.path);

  const matched = isPreselection
    ? properties.filter(
        (p) => label(p).toLowerCase() === selectedValue.toLowerCase() || str(p.path).toLowerCase() === selectedValue.toLowerCase(),
      )
    : properties
        .filter(
          (p) =>
            !needle ||
            str(p.path).toLowerCase().includes(needle) ||
            label(p).toLowerCase().includes(needle),
        )
        .sort((a, b) => label(a).localeCompare(label(b)))
        .slice(0, AUTOCOMPLETE_LIMIT);

  return matched.map((p) => ({ value: str(p.path), displayText: label(p) }));
};

/**
 * GET /api/services/app/Metadata/GetNonFrameworkRelatedProperties?container=&term=&selectedValue=
 *
 * Backs the "display property" pickers: only user-defined, visible properties are offered, which
 * is what `IsFrameworkRelated == false && IsVisible` selects in core.
 */
export const getNonFrameworkRelatedProperties: BehaviourHandler = (ctx) => {
  const { module, name } = parseContainer(str(ctx.query.container ?? ctx.body.container));
  const row = findContainerRow(module, name);
  if (!row) return [];

  const stored = JSON.parse(row.json) as Record<string, unknown>;
  const properties = Array.isArray(stored.properties)
    ? (stored.properties as Record<string, unknown>[])
    : [];

  const candidates = properties.filter(
    (p) => p.isFrameworkRelated === false && p.isVisible !== false,
  );
  return filterProperties(candidates, str(ctx.query.term ?? ctx.body.term), str(ctx.query.selectedValue ?? ctx.body.selectedValue));
};
