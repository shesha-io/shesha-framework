import { getValueByPropertyName } from '@/utils/object';
import { AutocompleteDataSourceType, OutcomeValueFunc } from './models';
import { getClassNameOrUndefined, getIdOrUndefined } from '@/utils/entity';

interface ICreateOutcomeValueFuncArgs {
  providedFunc?: OutcomeValueFunc | undefined;
  dataSourceType?: AutocompleteDataSourceType | undefined;
  rawKeyPropName?: string | undefined;
  displayPropName: string;
  keyPropName: string;
}

/**
 * Builds an OutcomeValueFunc that extracts a row's key value, with a fallback
 * to `id` or `value` when the configured keyPropName isn't present on the row
 * (common for URL endpoints returning `{ id, ... }` while keyPropName defaults to `value`).
 */
const isObjectRecord = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object';

export const createOutcomeValueFunc = ({
  providedFunc,
  dataSourceType,
  rawKeyPropName,
  displayPropName,
  keyPropName,
}: ICreateOutcomeValueFuncArgs): OutcomeValueFunc => {
  const base: OutcomeValueFunc = providedFunc ??
    (dataSourceType === 'entitiesList' && !rawKeyPropName
      ? (value: unknown) => {
        if (!isObjectRecord(value)) return value;
        return {
          id: getIdOrUndefined(value),
          _displayName: getValueByPropertyName(value, displayPropName),
          _className: getClassNameOrUndefined(value),
        };
      }
      : (value: unknown) => {
        if (!isObjectRecord(value)) return value;
        return getValueByPropertyName(value, keyPropName);
      });

  return (item: unknown) => {
    const result = base(item);
    if (result !== undefined && result !== null) return result;
    if (isObjectRecord(item)) {
      return item['id'] ?? item['value'] ?? item;
    }
    return item;
  };
};
