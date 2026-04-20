import { getValueByPropertyName } from '@/utils/object';
import { AutocompleteDataSourceType, OutcomeValueFunc } from './models';

interface ICreateOutcomeValueFuncArgs {
  providedFunc?: OutcomeValueFunc;
  dataSourceType?: AutocompleteDataSourceType;
  rawKeyPropName?: string;
  displayPropName: string;
  keyPropName: string;
}

/**
 * Builds an OutcomeValueFunc that extracts a row's key value, with a fallback
 * to `id` or `value` when the configured keyPropName isn't present on the row
 * (common for URL endpoints returning `{ id, ... }` while keyPropName defaults to `value`).
 */
export const createOutcomeValueFunc = ({
  providedFunc,
  dataSourceType,
  rawKeyPropName,
  displayPropName,
  keyPropName,
}: ICreateOutcomeValueFuncArgs): OutcomeValueFunc => {
  const base: OutcomeValueFunc = providedFunc ??
    (dataSourceType === 'entitiesList' && !rawKeyPropName
      ? (value: unknown) => ({
        id: (value as Record<string, unknown>).id,
        _displayName: getValueByPropertyName(value as Record<string, unknown>, displayPropName),
        _className: (value as Record<string, unknown>)._className,
      })
      : (value: unknown) => getValueByPropertyName(value as Record<string, unknown>, keyPropName));

  return (item: unknown, args: object) => {
    const result = base(item, args);
    if (result !== undefined && result !== null) return result;
    if (item !== null && typeof item === 'object') {
      const r = item as Record<string, unknown>;
      return r.id ?? r.value ?? item;
    }
    return item;
  };
};
