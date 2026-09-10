import { isNullOrWhiteSpace } from '@/utils/nullables';
import { EvaluationContext, ExpressionEvaluator, ExpressionResult } from '../types';

/** JavaScript function bodies (`return data.age > 18;`). The context roots are the function's arguments. */
export const createJavaScriptEvaluator = (): ExpressionEvaluator => ({
  language: 'javascript',
  evaluate: (expression: string, context: EvaluationContext): ExpressionResult => {
    if (isNullOrWhiteSpace(expression)) return { status: 'empty', unevaluated: [expression] };
    try {
      const names = Object.keys(context);
      const fn = new Function(...names, expression) as (...args: unknown[]) => unknown;
      return { status: 'resolved', value: fn(...names.map((name) => context[name])) };
    } catch (error) {
      return { status: 'failed', error: error instanceof Error ? error.message : String(error) };
    }
  },
});
