import { evaluateString } from '@/providers/form/utils';

export interface IDefaultValueEvaluationContext {
  formData: any;
  formMode: string;
  globalState: any;
}

/**
 * Resolves the configured `Default Value` of a number field into a value that is safe to write into
 * the form data.
 *
 * The setting is authored as a number, but it may also be an expression (e.g. `{{formData.qty}}`),
 * in which case `evaluateString` returns a string that has to be coerced back to a number - otherwise
 * a string ends up being submitted for a numeric property.
 *
 * Returns `undefined` when no usable default is configured. Note that `0` is a valid default and must
 * not be treated as "not configured".
 */
export const resolveDefaultValue = (
  rawDefaultValue: any,
  evaluationContext: IDefaultValueEvaluationContext,
  highPrecision?: boolean
): number | string | undefined => {
  if (rawDefaultValue === undefined || rawDefaultValue === null || rawDefaultValue === '') return undefined;

  const evaluated = typeof rawDefaultValue === 'string'
    ? evaluateString(rawDefaultValue, evaluationContext)
    : rawDefaultValue;

  if (evaluated === undefined || evaluated === null || evaluated === '') return undefined;

  // high precision fields are driven in `stringMode`, keep the raw string to avoid losing precision
  if (highPrecision && typeof evaluated === 'string')
    return Number.isNaN(parseFloat(evaluated)) ? undefined : evaluated;

  const parsed = typeof evaluated === 'number' ? evaluated : parseFloat(evaluated);

  return Number.isNaN(parsed) ? undefined : parsed;
};

/** Returns true when the bound form value should be replaced by the configured default. */
export const isEmptyValue = (value: any): boolean => value === undefined || value === null || value === '';
