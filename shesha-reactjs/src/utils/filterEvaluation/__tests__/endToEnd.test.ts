/* eslint-disable @typescript-eslint/no-deprecated -- these tests pin the behaviour of the compatibility adapters */
import moment from 'moment';
import { IStoredFilter } from '@/providers/dataTable/interfaces';
import { evaluateDynamicFilters } from '../adapters';
import { buildEvaluationContext, resolveFilter } from '../engine';

/** The filter exactly as the designer saves it: the expression stays in the JSON because `data` only exists at run time. */
const savedFilter = {
  and: [
    { '==': [{ var: 'isActive' }, true] },
    { '>=': [{ var: 'creationTime' }, { evaluate: [{ expression: "{{DATEADD(data.creationTime, 4, 'days')}}", type: 'mustache', required: true }] }] },
  ],
};

describe('saved filter with a date function, from designer JSON to the request', () => {
  const fourDaysLater = moment('2026-09-14T08:30:00').format();
  const mappings = [{ match: 'data', data: { creationTime: '2026-09-10T08:30:00' } }, { match: 'user', data: { id: 'u1' } }];

  it('resolves the function in the browser so the backend only sees a literal', async () => {
    const result = await resolveFilter(savedFilter, { context: buildEvaluationContext(mappings) });
    expect(result.status).toBe('ready');
    expect(JSON.stringify(result.logic)).not.toContain('evaluate');
    expect(JSON.stringify(result.logic)).not.toContain('DATEADD');
    const constant = (result.logic as { and: Array<{ '>='?: unknown[] }> }).and[1]?.['>=']?.[1];
    expect(constant).toBe(fourDaysLater);
  });

  it('goes through the table filter path used by the data context', async () => {
    const [filter] = await evaluateDynamicFilters([{ id: 'f', name: 'f', expression: savedFilter } as IStoredFilter], mappings, undefined);
    expect(filter?.allFieldsEvaluatedSuccessfully).toBe(true);
    expect(filter?.expression).toEqual({
      and: [
        { '==': [{ var: 'isActive' }, true] },
        { '>=': [{ var: 'creationTime' }, fourDaysLater] },
      ],
    });
  });

  it('withholds the request while the record has no creation time yet', async () => {
    const [filter] = await evaluateDynamicFilters([{ id: 'f', name: 'f', expression: savedFilter } as IStoredFilter], [{ match: 'data', data: {} }], undefined);
    expect(filter?.allFieldsEvaluatedSuccessfully).toBe(false);
    expect(filter?.unevaluatedExpressions).toEqual(["{{DATEADD(data.creationTime, 4, 'days')}}"]);
  });

  it('keeps a date-only input date-only', async () => {
    const result = await resolveFilter({ '>=': [{ var: 'd' }, { evaluate: [{ expression: "{{DATEADD('2026-01-30', 3, 'day')}}", type: 'mustache', required: true }] }] }, { context: {} });
    expect(result.logic).toEqual({ '>=': [{ var: 'd' }, '2026-02-02'] });
  });
});
