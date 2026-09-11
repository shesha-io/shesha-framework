import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isRecord } from '@/utils/object';
import { coerceToDataType, getSiblingDataType } from './coerce';
import { createJavaScriptEvaluator } from './expressions/javascript';
import { createMustacheEvaluator } from './expressions/mustache';
import {
  EvaluatedExpressionInfo,
  EvaluationContext,
  ExpressionEvaluator,
  ExpressionLanguage,
  ExpressionResult,
  FilterStatus,
  ResolvedFilter,
  ResolveFilterOptions,
  UnresolvedExpression,
  VariableDataTypeResolver,
} from './types';

const TEMPLATE_PATTERN = /\{\{(?:(?!}}).)*\}\}/;
const CONJUNCTIONS = new Set(['and', 'or']);
const SPECIFICATION_OPERATOR = 'is_satisfied';

interface EvaluateNodeArgs {
  expression: string;
  type?: string | undefined;
  required?: unknown;
}

/** The argument object of an `evaluate` node. `required` is left loose: legacy filters stored it in more than one shape. */
const isEvaluateNodeArgs = (value: unknown): value is EvaluateNodeArgs =>
  isRecord(value) && typeof value['expression'] === 'string' && (value['type'] === undefined || typeof value['type'] === 'string');

const isExpressionLanguage = (type: unknown): type is ExpressionLanguage => type === 'mustache' || type === 'javascript';

let debugLogging = false;

/** Turns the per-filter console diagnostic on. Off by default: the log includes context values such as the signed-in user. */
export const setFilterEvaluationDebug = (enabled: boolean): void => {
  debugLogging = enabled;
};

interface ExpressionNode {
  expression: string;
  language: ExpressionLanguage;
  required: boolean;
}

type ParsedExpressionNode = { kind: 'supported'; node: ExpressionNode } |
  { kind: 'unsupported'; expression: string; type: string };

/** `{"evaluate":[{"expression","type","required"}]}`; a missing `type` is the legacy mustache node. */
const asExpressionNode = (node: object): ParsedExpressionNode | undefined => {
  if (!('evaluate' in node) || !Array.isArray(node.evaluate) || node.evaluate.length !== 1) return undefined;
  const args: unknown = node.evaluate[0];
  if (!isEvaluateNodeArgs(args)) return undefined;
  const { expression, type, required } = args;
  if (type !== undefined && !isExpressionLanguage(type)) return { kind: 'unsupported', expression, type };
  return { kind: 'supported', node: { expression, language: type ?? 'mustache', required: required === true } };
};

/** Every `var` path in the tree, for callers that need to look data types up before evaluating. */
export const collectVariablePaths = (logic: object): string[] => {
  const paths = new Set<string>();
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== 'object' || node === null) return;
    for (const [operator, args] of Object.entries(node)) {
      if (operator === 'var' && typeof args === 'string') paths.add(args);
      else visit(args);
    }
  };
  visit(logic);
  return Array.from(paths);
};

interface NodeResult {
  value: unknown;
  /** An optional expression came back empty: the enclosing rule must be dropped. */
  drop: boolean;
}

interface Session {
  context: EvaluationContext;
  evaluators: Record<ExpressionLanguage, ExpressionEvaluator>;
  getVariableDataType: VariableDataTypeResolver | undefined;
  options: ResolveFilterOptions;
  hasExpressions: boolean;
  unresolved: UnresolvedExpression[];
  failed: boolean;
}

const report = (session: Session, node: ExpressionNode, result: ExpressionResult): void => {
  session.hasExpressions = true;
  if (result.status === 'empty') {
    session.unresolved.push({ expression: node.expression, language: node.language, required: node.required, reason: 'empty' });
  } else if (result.status === 'failed') {
    session.failed = true;
    session.unresolved.push({ expression: node.expression, language: node.language, required: node.required, reason: 'error', message: result.error });
  }
  const info: EvaluatedExpressionInfo = { expression: node.expression, language: node.language, required: node.required, result };
  session.options.onExpressionEvaluated?.(info);
};

const evaluateExpressionNode = (session: Session, node: ExpressionNode, siblings: unknown[]): NodeResult => {
  const evaluator = session.evaluators[node.language];
  const result = evaluator.evaluate(node.expression, session.context);
  report(session, node, result);

  if (node.language === 'javascript')
    return { value: result.status === 'resolved' ? Boolean(result.value) : false, drop: false };

  if (result.status !== 'resolved') {
    // a required expression keeps its rule so the caller can see the filter is waiting; an optional one drops it
    return { value: result.status === 'empty' ? '' : null, drop: !node.required };
  }

  const dataType = getSiblingDataType(siblings, session.getVariableDataType);
  const coerced = coerceToDataType(result.value, dataType);
  // a coercion that produced nothing (NaN, null) is an empty result, not a literal to send
  const value = typeof coerced === 'number' && Number.isNaN(coerced) ? null : coerced;
  const empty = value === '' || value === null;
  if (empty) {
    const already = session.unresolved.some((item) => item.expression === node.expression);
    if (!already) session.unresolved.push({ expression: node.expression, language: node.language, required: node.required, reason: 'empty' });
  }
  return { value: empty ? '' : value, drop: empty && !node.required };
};

/** A bare string argument carrying `{{…}}` is treated as a required mustache expression rather than sent raw. */
const evaluateInlineTemplate = (session: Session, literal: string, siblings: unknown[]): NodeResult =>
  evaluateExpressionNode(session, { expression: literal, language: 'mustache', required: true }, siblings);

const resolveNode = (session: Session, node: object, siblings: unknown[], parentOperator: string): NodeResult => {
  const parsed = asExpressionNode(node);
  if (parsed?.kind === 'unsupported') {
    session.failed = true;
    session.unresolved.push({ expression: parsed.expression, language: 'mustache', required: true, reason: 'error', message: `Unsupported expression type '${parsed.type}'` });
    return { value: null, drop: true };
  }
  if (parsed) return evaluateExpressionNode(session, parsed.node, siblings);
  const nested = resolveLogic(session, node);
  // a nested rule that was dropped disappears from an and/or; anywhere else it takes its parent with it
  if (nested === null) return { value: undefined, drop: !CONJUNCTIONS.has(parentOperator) };
  return { value: nested, drop: false };
};

const resolveArgument = (session: Session, operator: string, args: unknown[], index: number): NodeResult => {
  const arg = args[index];
  if (typeof arg === 'object' && arg !== null) return resolveNode(session, arg, args, operator);

  const override = session.options.argumentEvaluator?.(operator, args, index);
  if (override?.handled === true) return { value: override.value, drop: false };

  if (operator === SPECIFICATION_OPERATOR && index === 1 && typeof arg === 'string') {
    const result = session.evaluators.javascript.evaluate(arg, session.context);
    return { value: result.status === 'resolved' ? Boolean(result.value) : false, drop: false };
  }

  if (typeof arg === 'string' && TEMPLATE_PATTERN.test(arg)) return evaluateInlineTemplate(session, arg, args);

  return { value: arg, drop: false };
};

const resolveLogic = (session: Session, logic: object): JsonLogicFilter | null => {
  let result: JsonLogicFilter | null = null;

  for (const [operator, args] of Object.entries(logic as Record<string, unknown>)) {
    let value: unknown;
    let drop = false;

    if (Array.isArray(args)) {
      const resolved = args.map((_, index) => {
        const item = resolveArgument(session, operator, args, index);
        drop = drop || item.drop;
        return item.value;
      });
      value = resolved.filter((item) => item !== undefined);
    } else if (typeof args === 'object' && args !== null) {
      const item = resolveNode(session, args, [], operator);
      drop = item.drop;
      value = item.value;
    } else {
      const item = resolveArgument(session, operator, [args], 0);
      drop = item.drop;
      value = item.value;
    }

    if (drop) continue;
    if (CONJUNCTIONS.has(operator) && (!Array.isArray(value) || value.filter(isDefined).length === 0)) continue;

    result ??= {};
    result[operator] = value;
  }

  return result;
};

export const createDefaultEvaluators = (): Record<ExpressionLanguage, ExpressionEvaluator> => ({
  mustache: createMustacheEvaluator(),
  javascript: createJavaScriptEvaluator(),
});

/**
 * Resolves every expression in a saved filter in the browser and returns JsonLogic the backend can parse.
 *
 * - a required expression with no value keeps its rule and marks the filter `waiting`
 * - an optional expression with no value drops its rule; an `and`/`or` left empty is dropped too
 * - a JavaScript expression is always a boolean; a throw marks the filter `failed`
 * - the second argument of `is_satisfied` is a JavaScript condition resolved to a boolean
 * - a bare string argument containing `{{…}}` is a required mustache expression
 */
export const resolveFilterSync = (logic: JsonLogicFilter | undefined, options: ResolveFilterOptions): ResolvedFilter => {
  if (!isDefined(logic) || Object.keys(logic).length === 0)
    return { logic: undefined, status: 'ready', hasExpressions: false, unresolved: [] };

  const defaults = createDefaultEvaluators();
  const session: Session = {
    context: options.context,
    evaluators: { mustache: options.evaluators?.mustache ?? defaults.mustache, javascript: options.evaluators?.javascript ?? defaults.javascript },
    getVariableDataType: options.getVariableDataType,
    options,
    hasExpressions: false,
    unresolved: [],
    failed: false,
  };

  const resolved = resolveLogic(session, logic);
  const waiting = session.unresolved.some((item) => item.required && item.reason === 'empty');
  const status: FilterStatus = session.failed ? 'failed' : waiting ? 'waiting' : 'ready';

  const result: ResolvedFilter = { logic: resolved ?? undefined, status, hasExpressions: session.hasExpressions, unresolved: session.unresolved };
  logResolution(logic, result);
  return result;
};

/** Diagnostic: what the filter looked like when saved and what will be sent. Only filters with expressions are logged. */
const logResolution = (saved: JsonLogicFilter, result: ResolvedFilter): void => {
  if (!debugLogging || !result.hasExpressions) return;
  console.groupCollapsed(`[query builder] filter evaluated: ${result.status}`);
  console.dir({ saved, evaluated: result.logic, unresolved: result.unresolved }, { depth: null });
  console.groupEnd();
};

export type AsyncVariableDataTypeResolver = (path: string) => Promise<string | undefined>;

/** Same as `resolveFilterSync`, for callers whose metadata lookups are asynchronous. Types are looked up once, up front. */
export const resolveFilter = async (
  logic: JsonLogicFilter | undefined,
  options: Omit<ResolveFilterOptions, 'getVariableDataType'> & { getVariableDataType?: AsyncVariableDataTypeResolver | undefined },
): Promise<ResolvedFilter> => {
  if (!isDefined(logic)) return resolveFilterSync(logic, { ...options, getVariableDataType: undefined });

  const { getVariableDataType, ...rest } = options;
  if (!getVariableDataType) return resolveFilterSync(logic, rest);

  const paths = collectVariablePaths(logic);
  const entries = await Promise.all(paths.map(async (path) => [path, await getVariableDataType(path)] as const));
  const types = new Map(entries);
  return resolveFilterSync(logic, { ...rest, getVariableDataType: (path) => types.get(path) });
};

/** Builds the context the engine reads from: `match` becomes a root; an empty match spreads its data into the root. */
export const buildEvaluationContext = (mappings: Array<{ match: string; data: unknown }>): EvaluationContext => {
  const context: EvaluationContext = {};
  for (const { match, data } of mappings) {
    if (isNullOrWhiteSpace(match)) {
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) Object.assign(context, data);
      continue;
    }
    context[match] = data;
  }
  return context;
};
