/* eslint-disable @typescript-eslint/no-deprecated -- these tests pin the behaviour of the compatibility adapters */
import { IPropertyMetadata } from '@/interfaces/metadata';
import { IStoredFilter } from '@/providers/dataTable/interfaces';
import { convertJsonLogicNode, convertJsonLogicNodeSync, evaluateDynamicFilters, evaluateDynamicFiltersSync } from '../adapters';

const mappings = [{ match: 'data', data: { id: 'A1', empty: '' } }];

describe('legacy adapters', () => {
  it('evaluateDynamicFilters reports the readiness flags the table hook reads', async () => {
    const [ready] = await evaluateDynamicFilters(
      [{ id: 'f', name: 'f', expression: { '==': [{ var: 'id' }, { evaluate: [{ expression: '{{data.id}}', required: true }] }] } }],
      mappings,
      undefined,
    );
    expect(ready?.expression).toEqual({ '==': [{ var: 'id' }, 'A1'] });
    expect(ready?.hasDynamicExpression).toBe(true);
    expect(ready?.allFieldsEvaluatedSuccessfully).toBe(true);

    const [waiting] = await evaluateDynamicFilters(
      [{ id: 'f', name: 'f', expression: { '==': [{ var: 'id' }, { evaluate: [{ expression: '{{data.empty}}', required: true }] }] } }],
      mappings,
      undefined,
    );
    expect(waiting?.allFieldsEvaluatedSuccessfully).toBe(false);
    expect(waiting?.unevaluatedExpressions).toEqual(['{{data.empty}}']);
  });

  it('evaluateDynamicFiltersSync parses string expressions and flags invalid JSON', () => {
    const filters: IStoredFilter[] = [
      { id: 'a', name: 'a', expression: '{"==":[{"var":"id"},"{{data.id}}"]}' },
      { id: 'b', name: 'b', expression: '{not json' },
    ];
    const [a, b] = evaluateDynamicFiltersSync(filters, mappings, undefined);
    expect(a?.expression).toEqual({ '==': [{ var: 'id' }, 'A1'] });
    expect(b?.hasInvalidExpression).toBe(true);
  });

  it('evaluateDynamicFilters parses string expressions the same way', async () => {
    const filters: IStoredFilter[] = [
      { id: 'a', name: 'a', expression: '{"==":[{"var":"id"},"{{data.id}}"]}' },
      { id: 'b', name: 'b', expression: '{not json' },
    ];
    const [a, b] = await evaluateDynamicFilters(filters, mappings, undefined);
    expect(a?.expression).toEqual({ '==': [{ var: 'id' }, 'A1'] });
    expect(b?.hasInvalidExpression).toBe(true);
    expect(b?.expressionError).toBeDefined();
  });

  it('reports a throwing JavaScript expression as failed, not as waiting', () => {
    const seen: unknown[] = [];
    const result = convertJsonLogicNodeSync(
      { and: [{ evaluate: [{ expression: 'throw new Error("boom")', type: 'javascript', required: true }] }] },
      { argumentEvaluator: () => ({ handled: false }), mappings, onEvaluated: (args) => seen.push(args) },
    );
    expect(result).toEqual({ and: [false] });
    expect(seen).toEqual([{ expression: 'throw new Error("boom")', result: null, success: false, unevaluatedExpressions: [] }]);
  });

  it('coerces resolved values to the compared property type', () => {
    const metadata = [
      { path: 'age', label: 'Age', dataType: 'number' },
      { path: 'isActive', label: 'Active', dataType: 'boolean' },
    ] as unknown as IPropertyMetadata[];
    const filters: IStoredFilter[] = [
      { id: 'n', name: 'n', expression: { '>=': [{ var: 'age' }, '{{data.age}}'] } },
      { id: 'b', name: 'b', expression: { '==': [{ var: 'isActive' }, '{{data.active}}'] } },
    ];
    const [n, b] = evaluateDynamicFiltersSync(filters, [{ match: 'data', data: { age: '42.5', active: 'true' } }], metadata);
    expect(n?.expression).toEqual({ '>=': [{ var: 'age' }, 42.5] });
    expect(b?.expression).toEqual({ '==': [{ var: 'isActive' }, true] });
  });

  it('convertJsonLogicNode keeps the onEvaluated callback contract', async () => {
    const seen: unknown[] = [];
    const result = await convertJsonLogicNode(
      { '==': [{ var: 'id' }, { evaluate: [{ expression: '{{data.id}}', type: 'mustache', required: true }] }] },
      { argumentEvaluator: () => ({ handled: false }), mappings, onEvaluated: (args) => seen.push(args) },
    );
    expect(result).toEqual({ '==': [{ var: 'id' }, 'A1'] });
    expect(seen).toEqual([{ expression: '{{data.id}}', result: 'A1', success: true, unevaluatedExpressions: [] }]);
  });

  it('convertJsonLogicNodeSync returns null when everything is dropped', () => {
    const result = convertJsonLogicNodeSync(
      { and: [{ '==': [{ var: 'id' }, { evaluate: [{ expression: '{{data.empty}}', type: 'mustache', required: false }] }] }] },
      { argumentEvaluator: () => ({ handled: false }), mappings },
    );
    expect(result).toBeNull();
  });
});
