import { isPropertiesArray, NestedProperties } from '@/interfaces/metadata';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { IStoredFilter } from '@/providers/dataTable/interfaces';
import { NestedPropertyMetadatAccessor } from '@/providers/metadataDispatcher/contexts';
import { extractErrorMessage } from '@/utils/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { buildEvaluationContext, resolveFilter, resolveFilterSync } from './engine';
import { ArgumentEvaluator, EvaluatedExpressionInfo, ResolvedFilter } from './types';

/*
 * Compatibility layer. These keep the signatures the rest of the codebase calls today while the
 * implementation lives in the engine. Call sites move to `resolveFilter` directly in a later phase.
 */

export interface IMatchData {
  match: string;
  data: unknown;
}

export interface IArgumentEvaluationResult {
  handled: boolean;
  value?: unknown | undefined;
}

export interface OnEvaluatedArguments {
  expression: string;
  result: unknown;
  success: boolean;
  unevaluatedExpressions: string[] | undefined;
}

export interface IJsonLogicConversionOptions {
  argumentEvaluator: ArgumentEvaluator;
  mappings: IMatchData[];
  onEvaluated?: (args: OnEvaluatedArguments) => void;
  getVariableDataType?: (variable: string) => Promise<string>;
}

export interface IJsonLogicConversionOptionsSync {
  argumentEvaluator: ArgumentEvaluator;
  mappings: IMatchData[];
  onEvaluated?: (args: OnEvaluatedArguments) => void;
  getVariableDataType?: (variable: string) => string;
}

const toLegacyCallback = (onEvaluated: ((args: OnEvaluatedArguments) => void) | undefined) =>
  (info: EvaluatedExpressionInfo): void => {
    if (!onEvaluated) return;
    const { result } = info;
    onEvaluated({
      expression: info.expression,
      result: result.status === 'resolved' ? result.value : result.status === 'empty' ? '' : null,
      success: result.status === 'resolved' || (result.status === 'empty' && !info.required),
      unevaluatedExpressions: result.status === 'empty' && info.required ? result.unevaluated : [],
    });
  };

/** @deprecated use `resolveFilter` */
export const convertJsonLogicNode = async (jsonLogic: object, options: IJsonLogicConversionOptions): Promise<object | null> => {
  const resolved = await resolveFilter(jsonLogic as JsonLogicFilter, {
    context: buildEvaluationContext(options.mappings),
    argumentEvaluator: options.argumentEvaluator,
    onExpressionEvaluated: toLegacyCallback(options.onEvaluated),
    getVariableDataType: options.getVariableDataType ? (path) => options.getVariableDataType!(path) : undefined,
  });
  return resolved.logic ?? null;
};

/** @deprecated use `resolveFilterSync` */
export const convertJsonLogicNodeSync = (jsonLogic: object, options: IJsonLogicConversionOptionsSync): object | null => {
  const resolved = resolveFilterSync(jsonLogic as JsonLogicFilter, {
    context: buildEvaluationContext(options.mappings),
    argumentEvaluator: options.argumentEvaluator,
    onExpressionEvaluated: toLegacyCallback(options.onEvaluated),
    getVariableDataType: options.getVariableDataType,
  });
  return resolved.logic ?? null;
};

const EMPTY_FILTERS: IStoredFilter[] = [];

const toStoredFilter = (filter: IStoredFilter, resolved: ResolvedFilter): IStoredFilter => ({
  ...filter,
  hasDynamicExpression: resolved.hasExpressions,
  allFieldsEvaluatedSuccessfully: resolved.status === 'ready',
  unevaluatedExpressions: resolved.unresolved.filter((item) => item.required).map((item) => item.expression),
  expression: resolved.logic,
});

const parseExpression = (filter: IStoredFilter): { logic: JsonLogicFilter | undefined; error?: string } => {
  const { expression } = filter;
  if (typeof expression !== 'string') return { logic: expression };
  if (isNullOrWhiteSpace(expression)) return { logic: undefined };
  try {
    const parsed: unknown = JSON.parse(expression);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('Parsed expression must be an object');
    return { logic: parsed as JsonLogicFilter };
  } catch (error) {
    return { logic: undefined, error: extractErrorMessage(error) };
  }
};

/** @deprecated use `resolveFilter` */
export const evaluateDynamicFilters = (
  filters: IStoredFilter[] | undefined,
  mappings: IMatchData[],
  propertyMetadataAccessor: NestedPropertyMetadatAccessor | undefined,
): Promise<IStoredFilter[]> => {
  if (!isDefined(filters) || filters.length === 0 || mappings.length === 0) return Promise.resolve(EMPTY_FILTERS);
  const context = buildEvaluationContext(mappings);
  const getVariableDataType = isDefined(propertyMetadataAccessor)
    ? async (path: string): Promise<string | undefined> => (await propertyMetadataAccessor(path))?.dataType
    : undefined;

  return Promise.all(filters.map((filter) => {
    if (typeof filter.expression !== 'object') return Promise.resolve(filter);
    return resolveFilter(filter.expression, { context, getVariableDataType }).then((resolved) => toStoredFilter(filter, resolved));
  }));
};

/** @deprecated use `resolveFilterSync` */
export const evaluateDynamicFiltersSync = (
  filters: IStoredFilter[],
  mappings: IMatchData[],
  propertyMetadata: NestedProperties | undefined,
): IStoredFilter[] => {
  if (!isDefined(filters) || filters.length === 0 || mappings.length === 0) return EMPTY_FILTERS;
  const context = buildEvaluationContext(mappings);
  const getVariableDataType = isPropertiesArray(propertyMetadata)
    ? (path: string): string | undefined => propertyMetadata.find((m) => m.label === path || m.path === path)?.dataType
    : undefined;

  return filters.map((filter) => {
    const { logic, error } = parseExpression(filter);
    if (error !== undefined) {
      console.error(`Failed to parse filter expression for filter ${filter.id || 'unknown'}:`, error);
      return { ...filter, hasInvalidExpression: true, expressionError: error } as IStoredFilter;
    }
    if (!isDefined(logic)) return filter;
    return toStoredFilter({ ...filter, expression: logic }, resolveFilterSync(logic, { context, getVariableDataType }));
  });
};
