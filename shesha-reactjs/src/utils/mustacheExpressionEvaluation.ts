import { getMustacheRuntimeScope } from './mustacheExpressionFunctions';

export interface IExpressionMatchData {
  match: string;
  data: unknown;
}

export interface IMustacheTemplateEvaluationResult {
  handled: boolean;
  value: string;
}

const mustacheTemplatePattern = /^\s*\{\{([\s\S]*?)\}\}\s*$/;
const safeExpressionPattern = /^[A-Za-z0-9_$\s.'"(),+\-*/<>=!&|?:]+$/;
const disallowedKeywordPattern = /\b(?:new|function|class|while|for|if|return|this|window|globalThis|document|constructor|prototype|__proto__|eval|Function)\b/;

const isObjectValue = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isSafeExpression = (expression: string): boolean => {
  if (!expression || !safeExpressionPattern.test(expression)) return false;
  if (disallowedKeywordPattern.test(expression)) return false;
  if (expression.includes('=>') || expression.includes('?.[')) return false;
  return true;
};

export const buildMustacheExpressionContext = (mappings: IExpressionMatchData[]): Record<string, unknown> => {
  const context: Record<string, unknown> = {};

  mappings.forEach((mapping) => {
    const { match, data } = mapping;
    if (!match) {
      if (isObjectValue(data)) {
        Object.assign(context, data);
      }
      return;
    }

    context[match] = data;
  });

  return context;
};

export const tryEvaluateMustacheTemplate = (
  template: string,
  context: Record<string, unknown>,
): IMustacheTemplateEvaluationResult => {
  const templateMatch = template.match(mustacheTemplatePattern);
  if (!templateMatch) return { handled: false, value: '' };

  const expression = templateMatch[1]?.trim() ?? '';
  if (!isSafeExpression(expression)) return { handled: false, value: '' };

  try {
    const runtimeScope = {
      ...context,
      ...getMustacheRuntimeScope(),
    };

    const evaluator = new Function('scope', `with (scope) { return (${expression}); }`) as (scope: Record<string, unknown>) => unknown;
    const rawResult = evaluator(runtimeScope);

    if (rawResult === undefined) return { handled: false, value: '' };
    return {
      handled: true,
      value: rawResult === null ? '' : String(rawResult),
    };
  } catch {
    return { handled: false, value: '' };
  }
};
