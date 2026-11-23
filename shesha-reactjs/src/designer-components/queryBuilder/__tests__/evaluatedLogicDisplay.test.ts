import { describe, expect, it } from 'vitest';
import { extractEvaluatedExpression, resolveExpressionsForDisplay } from '../evaluatedLogicDisplay';

describe('resolveExpressionsForDisplay', () => {
  it('resolves pure mustache function expressions to literal values', () => {
    const logic = {
      and: [{ '>=': [{ var: 'creationTime' }, { evaluate: [{ expression: "{{DATEADD(NOW(), 10, 'months')}}", type: 'mustache', required: true }] }] }],
    };
    const resolved = resolveExpressionsForDisplay(logic) as { and: [{ '>=': [unknown, unknown] }] };
    const value = resolved.and[0]['>='][1];
    expect(typeof value).toBe('string');
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('keeps expressions that need runtime data', () => {
    const node = { evaluate: [{ expression: '{{data.fromDate}}', type: 'mustache', required: true }] };
    const logic = { and: [{ '>=': [{ var: 'creationTime' }, node]  }] };
    const resolved = resolveExpressionsForDisplay(logic) as { and: [{ '>=': [unknown, unknown] }] };
    expect(resolved.and[0]['>='][1]).toEqual(node);
  });

  it('keeps javascript expressions and non-expression nodes untouched', () => {
    const logic = {
      and: [
        { startsWith: [{ var: 'firstName' }, 'Sys'] },
        { evaluate: [{ expression: 'return true;', type: 'javascript', required: false }] },
      ],
    };
    expect(resolveExpressionsForDisplay(logic)).toEqual(logic);
  });
});

describe('extractEvaluatedExpression', () => {
  it('reads the abp envelope and bare payloads', () => {
    expect(extractEvaluatedExpression({ result: { expression: '{"and":[]}' }, success: true })).toBe('{"and":[]}');
    expect(extractEvaluatedExpression({ expression: '{}' })).toBe('{}');
  });

  it('returns undefined for malformed payloads', () => {
    expect(extractEvaluatedExpression({ result: null })).toBeUndefined();
    expect(extractEvaluatedExpression(undefined)).toBeUndefined();
    expect(extractEvaluatedExpression({ result: { expression: '  ' } })).toBeUndefined();
  });
});
