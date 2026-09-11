import { buildEvaluationContext, resolveFilter, resolveFilterSync } from '../engine';

const context = buildEvaluationContext([
  { match: 'data', data: { id: 'A1', age: 30, active: true, date: '2026-09-10T12:00:00', firstName: 'Ann', empty: '' } },
  { match: 'user', data: { id: 'U9' } },
]);

const evaluate = (expression: string, required = true, type?: 'mustache' | 'javascript' | null): object => ({
  evaluate: [{ expression, ...(type === null ? {} : { type: type ?? 'mustache' }), required }],
});

describe('resolveFilterSync', () => {
  it('passes plain JsonLogic through untouched', () => {
    const logic = { and: [{ '==': [{ var: 'status' }, 3] }, { '!!': { var: 'name' } }] };
    const result = resolveFilterSync(logic, { context });
    expect(result.logic).toEqual(logic);
    expect(result.status).toBe('ready');
    expect(result.hasExpressions).toBe(false);
  });

  it('replaces a resolved mustache expression with a literal', () => {
    const result = resolveFilterSync({ '==': [{ var: 'id' }, evaluate('{{data.id}}')] }, { context });
    expect(result.logic).toEqual({ '==': [{ var: 'id' }, 'A1'] });
    expect(result.status).toBe('ready');
    expect(result.hasExpressions).toBe(true);
  });

  it('keeps a required expression that has no value and reports the filter as waiting', () => {
    const result = resolveFilterSync({ '==': [{ var: 'id' }, evaluate('{{data.empty}}')] }, { context });
    expect(result.status).toBe('waiting');
    expect(result.logic).toEqual({ '==': [{ var: 'id' }, ''] });
    expect(result.unresolved).toEqual([{ expression: '{{data.empty}}', language: 'mustache', required: true, reason: 'empty' }]);
  });

  it('drops the rule of an optional expression that has no value, and an and/or left empty', () => {
    const result = resolveFilterSync({
      and: [{ '==': [{ var: 'id' }, evaluate('{{data.empty}}', false)] }, { '==': [{ var: 'x' }, 1] }],
    }, { context });
    expect(result.logic).toEqual({ and: [{ '==': [{ var: 'x' }, 1] }] });
    expect(result.status).toBe('ready');

    const allDropped = resolveFilterSync({ or: [{ '==': [{ var: 'id' }, evaluate('{{data.empty}}', false)] }] }, { context });
    expect(allDropped.logic).toBeUndefined();
  });

  it('treats a template whose root is not in the context as empty instead of leaking raw braces', () => {
    const required = resolveFilterSync({ '==': [{ var: 'id' }, evaluate('{{someContext.name}}')] }, { context });
    expect(required.status).toBe('waiting');
    expect(JSON.stringify(required.logic)).not.toContain('{{');

    const optional = resolveFilterSync({ '==': [{ var: 'id' }, evaluate('{{someContext.name}}', false)] }, { context });
    expect(optional.logic).toBeUndefined();
  });

  it('runs functions from the expression library', () => {
    const result = resolveFilterSync({ '>': [{ var: 'due' }, evaluate("{{DATEADD(data.date, 2, 'day')}}")] }, { context });
    expect(result.status).toBe('ready');
    const value = (result.logic as { '>': unknown[] })['>'][1];
    expect(typeof value).toBe('string');
    expect(String(value).startsWith('2026-09-12')).toBe(true);

    const abs = resolveFilterSync({ '==': [{ var: 'n' }, evaluate('{{ABS(-5)}}')] }, { context });
    expect(abs.logic).toEqual({ '==': [{ var: 'n' }, 5] });
  });

  it('coerces a mustache result to the type of the compared property', () => {
    const getVariableDataType = (path: string): string | undefined => ({ age: 'number', active: 'boolean', status: 'reference-list-item' })[path];
    const result = resolveFilterSync({
      and: [
        { '==': [{ var: 'age' }, evaluate('{{data.age}}')] },
        { '==': [{ var: 'active' }, evaluate('{{data.active}}')] },
        { '==': [{ var: 'status' }, evaluate('7')] },
      ],
    }, { context, getVariableDataType });
    expect(result.logic).toEqual({ and: [{ '==': [{ var: 'age' }, 30] }, { '==': [{ var: 'active' }, true] }, { '==': [{ var: 'status' }, 7] }] });
  });

  it('treats arithmetic on a missing value (NaN) as no value, so it never reaches the backend as null', () => {
    const logic = { '==': [{ var: 'population' }, evaluate('{{FLOOR(data.population*3)}}')] };
    const withData = resolveFilterSync(logic, { context: { data: { population: 7 } } });
    expect(withData.logic).toEqual({ '==': [{ var: 'population' }, 21] });

    const noData = resolveFilterSync(logic, { context: { data: {} } });
    expect(noData.status).toBe('waiting');
    expect(JSON.stringify(noData.logic)).not.toContain('null');

    const optional = resolveFilterSync({ '==': [{ var: 'population' }, evaluate('{{FLOOR(data.population*3)}}', false)] }, { context: { data: {} } });
    expect(optional.logic).toBeUndefined();
  });

  it('resolves the current script roots: application.state, page.state, form.state and user', () => {
    const scriptContext = buildEvaluationContext([
      { match: 'application', data: { state: { region: 'ZA' } } },
      { match: 'page', data: { state: { selectedId: 'P1' }, location: undefined } },
      { match: 'form', data: { state: { step: 2 } } },
      { match: 'user', data: { id: 'U9', userName: 'james' } },
    ]);
    const result = resolveFilterSync({
      and: [
        { '==': [{ var: 'region' }, evaluate('{{application.state.region}}')] },
        { '==': [{ var: 'parentId' }, evaluate('{{page.state.selectedId}}')] },
        { '==': [{ var: 'step' }, evaluate('{{form.state.step}}')] },
        { '==': [{ var: 'owner' }, evaluate('{{user.id}}')] },
      ],
    }, { context: scriptContext });
    expect(result.status).toBe('ready');
    expect(result.logic).toEqual({ and: [
      { '==': [{ var: 'region' }, 'ZA'] },
      { '==': [{ var: 'parentId' }, 'P1'] },
      { '==': [{ var: 'step' }, 2] },
      { '==': [{ var: 'owner' }, 'U9'] },
    ] });
  });

  it('accepts the legacy evaluate node without a type as mustache', () => {
    const result = resolveFilterSync({ '==': [{ var: 'id' }, evaluate('{{data.id}}', true, null)] }, { context });
    expect(result.logic).toEqual({ '==': [{ var: 'id' }, 'A1'] });
  });

  it('resolves a JavaScript expression to a boolean and marks a throwing one as failed', () => {
    const ok = resolveFilterSync({ '==': [{ var: 'flag' }, evaluate('return data.age > 18;', true, 'javascript')] }, { context });
    expect(ok.logic).toEqual({ '==': [{ var: 'flag' }, true] });

    const broken = resolveFilterSync({ '==': [{ var: 'flag' }, evaluate('return data.nope.deep;', true, 'javascript')] }, { context });
    expect(broken.status).toBe('failed');
    expect(broken.unresolved[0]?.reason).toBe('error');
  });

  it('resolves the specification condition to a boolean', () => {
    const result = resolveFilterSync({ is_satisfied: [{ var: 'MySpec' }, 'return data.age > 18;'] }, { context });
    expect(result.logic).toEqual({ is_satisfied: [{ var: 'MySpec' }, true] });
  });

  it('treats a bare string argument with braces as a required mustache expression', () => {
    const result = resolveFilterSync({ '==': [{ var: 'id' }, '{{user.id}}'] }, { context });
    expect(result.logic).toEqual({ '==': [{ var: 'id' }, 'U9'] });
    const waiting = resolveFilterSync({ '==': [{ var: 'id' }, '{{data.empty}}'] }, { context });
    expect(waiting.status).toBe('waiting');
  });

  it('honours the legacy argument evaluator override', () => {
    const result = resolveFilterSync({ '==': [{ var: 'id' }, 'raw'] }, {
      context,
      argumentEvaluator: (_operator, args, index) => index === 1 && args[index] === 'raw' ? { handled: true, value: 'overridden' } : { handled: false },
    });
    expect(result.logic).toEqual({ '==': [{ var: 'id' }, 'overridden'] });
  });

  it('returns ready and no logic for an empty filter', () => {
    expect(resolveFilterSync(undefined, { context })).toEqual({ logic: undefined, status: 'ready', hasExpressions: false, unresolved: [] });
    expect(resolveFilterSync({}, { context }).logic).toBeUndefined();
  });
});

describe('resolveFilter (async)', () => {
  it('looks data types up once and matches the sync result', async () => {
    const seen: string[] = [];
    const result = await resolveFilter({ '==': [{ var: 'age' }, evaluate('{{data.age}}')] }, {
      context,
      getVariableDataType: (path) => {
        seen.push(path);
        return Promise.resolve(path === 'age' ? 'number' : undefined);
      },
    });
    expect(result.logic).toEqual({ '==': [{ var: 'age' }, 30] });
    expect(seen).toEqual(['age']);
  });
});

describe('buildEvaluationContext', () => {
  it('spreads an unnamed mapping into the root and keeps named ones as roots', () => {
    const ctx = buildEvaluationContext([{ match: '', data: { a: 1 } }, { match: 'data', data: { b: 2 } }, { match: '', data: 'ignored' }]);
    expect(ctx).toEqual({ a: 1, data: { b: 2 } });
  });
});
