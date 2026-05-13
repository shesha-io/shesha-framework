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
          id: value.id,
          _displayName: getValueByPropertyName(value, displayPropName),
          _className: value._className,
        };
      }
      : (value: unknown) => {
        if (!isObjectRecord(value)) return value;
        return getValueByPropertyName(value, keyPropName);
      });

  return (item: unknown, args: object) => {
    const result = base(item, args);
    if (result !== undefined && result !== null) return result;
    if (isObjectRecord(item)) {
      return item.id ?? item.value ?? item;
    }
    return item;
  };
};
