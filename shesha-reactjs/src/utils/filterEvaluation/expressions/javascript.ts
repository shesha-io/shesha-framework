import { isNullOrWhiteSpace } from '@/utils/nullables';
import { EvaluationContext, ExpressionEvaluator, ExpressionResult } from '../types';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends',
  'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super', 'switch', 'this', 'throw',
  'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'implements', 'interface', 'package', 'private',
  'protected', 'public', 'await', 'arguments', 'eval',
]);

/** Context keys that can be function parameter names; `first name` or `class` would make `new Function` throw for every expression. */
const parameterNames = (context: EvaluationContext): string[] =>
  Object.keys(context).filter((name) => IDENTIFIER.test(name) && !RESERVED.has(name));

/** JavaScript function bodies (`return data.age > 18;`). The context roots are the function's arguments. */
export const createJavaScriptEvaluator = (): ExpressionEvaluator => ({
  language: 'javascript',
  evaluate: (expression: string, context: EvaluationContext): ExpressionResult => {
    if (isNullOrWhiteSpace(expression)) return { status: 'empty', unevaluated: [expression] };
    try {
      const names = parameterNames(context);
      const fn = new Function(...names, expression) as (...args: unknown[]) => unknown;
      return { status: 'resolved', value: fn(...names.map((name) => context[name])) };
    } catch (error) {
      return { status: 'failed', error: error instanceof Error ? error.message : String(error) };
    }
  },
});
