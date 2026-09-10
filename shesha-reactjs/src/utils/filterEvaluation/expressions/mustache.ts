import moment from 'moment';
import { evaluateString } from '@/providers/form/utils';
import { getMustacheRuntimeScope } from '@/utils/mustacheExpressionFunctions';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { EvaluationContext, ExpressionEvaluator, ExpressionResult } from '../types';

const TEMPLATE_PATTERN = /\{\{(?:(?!}}).)*\}\}/g;
const SINGLE_TEMPLATE_PATTERN = /^\s*\{\{([\s\S]*?)\}\}\s*$/;
const STRING_LITERAL_PATTERN = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g;
const SAFE_EXPRESSION_PATTERN = /^[A-Za-z0-9_$\s.'"(),+\-*/<>=!&|?:]+$/;
const DISALLOWED_KEYWORD_PATTERN = /\b(?:new|function|class|while|for|if|return|this|window|globalThis|document|constructor|prototype|__proto__|eval|Function|Object|Array|Reflect|Proxy)\b/;
const IDENTIFIER_PATTERN = /[A-Za-z_$][A-Za-z0-9_$]*/g;
const LITERAL_WORDS = new Set(['true', 'false', 'null', 'undefined']);
const DATE_OUTPUT_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

const isSafeExpression = (expression: string): boolean => {
  if (isNullOrWhiteSpace(expression) || !SAFE_EXPRESSION_PATTERN.test(expression)) return false;
  if (DISALLOWED_KEYWORD_PATTERN.test(expression)) return false;
  return !expression.includes('=>') && !expression.includes('?.[');
};

/** Root identifiers the expression reads: the first segment of every dotted path, minus function names and literals. */
const getReferencedRoots = (expression: string, functionNames: Set<string>): string[] => {
  const withoutStrings = expression.replace(STRING_LITERAL_PATTERN, '""');
  const roots = new Set<string>();
  const segments = withoutStrings.split(/[^A-Za-z0-9_$.]+/);
  for (const segment of segments) {
    const root = segment.split('.')[0];
    if (root === undefined || root === '' || !IDENTIFIER_PATTERN.test(root) || LITERAL_WORDS.has(root) || functionNames.has(root)) continue;
    IDENTIFIER_PATTERN.lastIndex = 0;
    roots.add(root);
  }
  IDENTIFIER_PATTERN.lastIndex = 0;
  return Array.from(roots);
};

const normalizeValue = (value: unknown): unknown => {
  if (value instanceof Date) return moment(value).format(DATE_OUTPUT_FORMAT);
  if (moment.isMoment(value)) return value.format(DATE_OUTPUT_FORMAT);
  return value;
};

const isEmptyValue = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && isNullOrWhiteSpace(value));

/** Runs a single `{{ expression }}` as a guarded JavaScript expression with the function library in scope. */
const evaluateExpression = (expression: string, context: EvaluationContext): { ok: true; value: unknown } | { ok: false } => {
  if (!isSafeExpression(expression)) return { ok: false };
  try {
    const scope = { ...context, ...getMustacheRuntimeScope() };
    const evaluator = new Function('scope', `with (scope) { return (${expression}); }`) as (scope: Record<string, unknown>) => unknown;
    return { ok: true, value: normalizeValue(evaluator(scope)) };
  } catch {
    return { ok: false };
  }
};

/** Renders one template the way the framework always has, scoped to the roots it references. */
const renderTemplate = (template: string, context: EvaluationContext): string => evaluateString(template, context, false);

/**
 * Mustache expressions: `{{data.name}}`, `{{DATEADD(data.date, 2, 'day')}}`, or text with several templates.
 *
 * A template whose root is not in the context is *empty*, not left as raw text: a required rule then waits
 * and an optional rule is dropped, and raw braces never reach the backend.
 */
export const createMustacheEvaluator = (): ExpressionEvaluator => {
  const functionNames = new Set(Object.keys(getMustacheRuntimeScope()));

  return {
    language: 'mustache',
    evaluate: (expression: string, context: EvaluationContext): ExpressionResult => {
      if (isNullOrWhiteSpace(expression)) return { status: 'resolved', value: '' };

      const templates = Array.from(new Set(expression.match(TEMPLATE_PATTERN) ?? []));
      if (templates.length === 0) return { status: 'resolved', value: expression };

      const single = expression.match(SINGLE_TEMPLATE_PATTERN);
      const unevaluated: string[] = [];

      const resolveTemplate = (template: string): unknown => {
        const inner = template.slice(2, -2).trim();
        const unknownRoots = getReferencedRoots(inner, functionNames).filter((root) => !(root in context));
        if (unknownRoots.length > 0) {
          unevaluated.push(template);
          return undefined;
        }
        const evaluated = evaluateExpression(inner, context);
        const value = evaluated.ok ? evaluated.value : renderTemplate(template, context);
        if (isEmptyValue(value)) unevaluated.push(template);
        return value;
      };

      if (single) {
        const value = resolveTemplate(templates[0] ?? expression);
        return unevaluated.length > 0 ? { status: 'empty', unevaluated } : { status: 'resolved', value };
      }

      let result = expression;
      for (const template of templates) {
        const value = resolveTemplate(template);
        result = result.replaceAll(template, isEmptyValue(value) ? '' : String(value));
      }
      return unevaluated.length > 0 ? { status: 'empty', unevaluated } : { status: 'resolved', value: result };
    },
  };
};
