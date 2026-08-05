import { evaluateString } from '@/providers/form/utils';
import { FormMode } from '@/providers/form/models';
import { NumberFieldValue } from './interfaces';

export interface IDefaultValueEvaluationContext {
  formData: any;
  formMode: FormMode;
  globalState: any;
}

/**
 * Matches a complete decimal numeric literal (`500`, `-1.5`, `.5`, `1e3`).
 *
 * Deliberately rejects partially numeric values ('12abc'), the `Infinity`/`NaN` literals and
 * hexadecimal notation, all of which `parseFloat`/`Number` would otherwise let through.
 */
const NUMERIC_LITERAL_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

/**
 * Resolves the configured `Default Value` of a number field into a value that is safe to write into
 * the form data.
 *
 * The setting is authored as a number, but it may also be an expression (e.g. `{{formData.qty}}`),
 * in which case `evaluateString` returns a string that has to be coerced back to a number - otherwise
 * a string ends up being submitted for a numeric property.
 *
 * Returns `undefined` when no usable default is configured, which includes anything that is not a
 * complete, finite numeric literal - a partially numeric value such as '12abc' is rejected outright
 * rather than silently truncated to 12.
 *
 * Note that `0` is a valid default and must not be treated as "not configured".
 */
export const resolveDefaultValue = (
  rawDefaultValue: unknown,
  evaluationContext: IDefaultValueEvaluationContext,
  highPrecision?: boolean
): NumberFieldValue => {
  if (rawDefaultValue === undefined || rawDefaultValue === null || rawDefaultValue === '') return undefined;

  const evaluated: unknown = typeof rawDefaultValue === 'string'
    ? evaluateString(rawDefaultValue, evaluationContext)
    : rawDefaultValue;

  if (evaluated === undefined || evaluated === null || evaluated === '') return undefined;

  // NaN and +-Infinity cannot be persisted (`JSON.stringify(Infinity)` is `null`), so they are no
  // more usable as a default than no value at all
  if (typeof evaluated === 'number') return Number.isFinite(evaluated) ? evaluated : undefined;

  if (typeof evaluated === 'string') {
    const trimmed = evaluated.trim();

    // `parseFloat` would happily accept a numeric *prefix* ('12abc' -> 12) and the 'Infinity' literal,
    // so the whole string has to be validated instead
    if (!NUMERIC_LITERAL_REGEX.test(trimmed)) return undefined;

    // high precision fields are driven in `stringMode`, keep the literal to avoid losing precision -
    // these values may legitimately exceed Number.MAX_SAFE_INTEGER
    if (highPrecision === true) return trimmed;

    const parsed = Number(trimmed);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  // anything else (object, boolean, ...) is not a usable number field default
  return undefined;
};

/** Returns true when the bound form value should be replaced by the configured default. */
export const isEmptyValue = (value: NumberFieldValue): boolean =>
  value === undefined || value === null || value === '';
