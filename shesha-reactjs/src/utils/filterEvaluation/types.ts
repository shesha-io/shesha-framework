import { JsonLogicFilter } from '@/interfaces/jsonLogic';

export type ExpressionLanguage = 'mustache' | 'javascript';

/** Root objects an expression can reference, keyed by name: `data`, `contexts`, `user`, ... */
export type EvaluationContext = Record<string, unknown>;

export type ExpressionResult =
  { status: 'resolved'; value: unknown } |
  /** The expression referred to nothing that has a value yet; `unevaluated` lists the templates that came back empty. */
  { status: 'empty'; unevaluated: string[] } |
  { status: 'failed'; error: string };

export interface ExpressionEvaluator {
  language: ExpressionLanguage;
  evaluate: (expression: string, context: EvaluationContext) => ExpressionResult;
}

export type VariableDataTypeResolver = (path: string) => string | undefined;

/** Legacy hook: lets a caller override how a literal argument is converted. Kept for the existing adapters. */
export interface ArgumentEvaluationResult {
  handled: boolean;
  value?: unknown;
}
export type ArgumentEvaluator = (operator: string, args: unknown[], argIndex: number) => ArgumentEvaluationResult;

export interface EvaluatedExpressionInfo {
  expression: string;
  language: ExpressionLanguage;
  required: boolean;
  result: ExpressionResult;
}

export interface ResolveFilterOptions {
  context: EvaluationContext;
  /** Data type of a `var` path, used to coerce expression results compared against it. */
  getVariableDataType?: VariableDataTypeResolver | undefined;
  evaluators?: Partial<Record<ExpressionLanguage, ExpressionEvaluator>> | undefined;
  argumentEvaluator?: ArgumentEvaluator | undefined;
  onExpressionEvaluated?: ((info: EvaluatedExpressionInfo) => void) | undefined;
}

export type FilterStatus =
  /** every expression resolved, or there were none */
  'ready' |
  /** a required expression has no value yet; do not run the query */
  'waiting' |
  /** an expression threw; the filter cannot be trusted */
  'failed';

export interface UnresolvedExpression {
  expression: string;
  language: ExpressionLanguage;
  required: boolean;
  reason: 'empty' | 'error';
  message?: string | undefined;
}

export interface ResolvedFilter {
  /** JsonLogic with every expression replaced by a literal, or undefined when every rule was dropped. */
  logic: JsonLogicFilter | undefined;
  status: FilterStatus;
  hasExpressions: boolean;
  unresolved: UnresolvedExpression[];
}
