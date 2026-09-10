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
    expect((b as IStoredFilter & { hasInvalidExpression?: boolean }).hasInvalidExpression).toBe(true);
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
