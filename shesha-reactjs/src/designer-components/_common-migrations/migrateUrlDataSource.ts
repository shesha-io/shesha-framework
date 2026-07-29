import { DataSourceType } from '@/designer-components/dropdown/model';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { isPropertySettings } from '@/designer-components/_settings/utils/utils';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

/** The legacy shape of a component that could read its options from a URL. */
export interface ILegacyUrlDataSource {
  dataSourceType?: DataSourceType | undefined;
  dataSourceUrl?: unknown;
  reducerFunc?: unknown;
  referenceListId?: IReferenceListIdentifier | undefined;
}

/**
 * Pulls the raw text out of a `dataSourceUrl`, which may be stored either as a plain
 * string or as a JS setting (`{ _mode: 'code', _code: '...' }`).
 */
const getUrlExpression = (dataSourceUrl: unknown): string | undefined => {
  if (typeof dataSourceUrl === 'string') return dataSourceUrl;
  if (isPropertySettings<string>(dataSourceUrl))
    return dataSourceUrl._mode === 'code' ? dataSourceUrl._code : dataSourceUrl._value;
  return undefined;
};

/**
 * Recognises a URL that fetches a reference list through the ConfigurationItem endpoint, e.g.
 * `api/services/app/ConfigurationItem/GetCurrent?itemType=reference-list&name=Shesha.Core.Gender&module=Some.Module`
 * and returns the reference list it points at.
 *
 * Returns undefined for any other URL — including dynamic ones whose value is only known at
 * runtime — because those cannot be resolved statically during a migration.
 */
export const getReferenceListFromUrl = (dataSourceUrl: unknown): IReferenceListIdentifier | undefined => {
  const expression = getUrlExpression(dataSourceUrl);
  if (isNullOrWhiteSpace(expression)) return undefined;
  if (!expression.includes('ConfigurationItem/GetCurrent') || !expression.includes('itemType=reference-list')) return undefined;

  // The expression is JS (typically `return "<url>"`), so read the query string off the
  // literal rather than executing anything during migration.
  const name = /[?&]name=([^&"'`\s]+)/.exec(expression)?.[1];
  const module = /[?&]module=([^&"'`\s]+)/.exec(expression)?.[1];

  if (!isDefined(name) || isNullOrWhiteSpace(name)) return undefined;
  // A value built at runtime (`${...}` or string concatenation) can't be resolved statically.
  const isDynamic = (value: string): boolean => value.includes('${') || value.includes('+');
  if (isDynamic(name) || (isDefined(module) && isDynamic(module))) return undefined;

  // Persisted URLs may carry malformed percent-encoding (e.g. `name=%`), which makes
  // decodeURIComponent throw. Treat an undecodable value as unresolvable so the
  // migration falls back to `values` instead of crashing.
  const safeDecode = (value: string): string | undefined => {
    try {
      return decodeURIComponent(value);
    } catch {
      return undefined;
    }
  };

  const decodedName = safeDecode(name);
  if (!isDefined(decodedName)) return undefined;

  const decodedModule = isDefined(module) && isNotNullOrWhiteSpace(module) ? safeDecode(module) : null;
  if (!isDefined(decodedModule)) return undefined;

  return {
    name: decodedName,
    module: decodedModule,
  };
};

/**
 * The model with the removed `url` properties stripped off, along with `dataSourceType` — each
 * branch below redeclares that discriminator. Leaving it in place would intersect the branch's
 * literal with the original one, reducing the whole type to `never` for any caller whose model
 * narrows `dataSourceType` (e.g. to `'url'`).
 */
type WithoutUrlSource<T> = Omit<T, 'dataSourceUrl' | 'reducerFunc' | 'dataSourceType'>;

/**
 * The result of the migration: either a reference list source carrying the list it resolved to,
 * or a values source. Both shapes have the `url` properties removed.
 */
export type MigratedUrlDataSource<T> =
  (WithoutUrlSource<T> & { dataSourceType: 'referenceList'; referenceListId: IReferenceListIdentifier }) |
  (WithoutUrlSource<T> & { dataSourceType: 'values' });

/**
 * Migrates a component away from the removed `url` data source.
 *
 * A URL pointing at a reference list becomes a native `referenceList` source, which renders
 * identically. Anything else falls back to `values`: the options cannot be recovered, but the
 * model no longer claims a source the component doesn't support, and `validateModel` then
 * surfaces a message in the designer telling the configurer what to do.
 *
 * A model that never used the `url` source is returned unchanged.
 */
export const migrateUrlDataSource = <T extends ILegacyUrlDataSource>(prev: T): T | MigratedUrlDataSource<T> => {
  if (prev.dataSourceType !== 'url') return prev;

  const referenceListId = prev.referenceListId ?? getReferenceListFromUrl(prev.dataSourceUrl);
  const { dataSourceUrl: _dataSourceUrl, reducerFunc: _reducerFunc, ...rest } = prev;

  return isDefined(referenceListId)
    ? { ...rest, dataSourceType: 'referenceList', referenceListId }
    : { ...rest, dataSourceType: 'values' };
};
