import { createMustacheEvaluator } from '../expressions/mustache';

const evaluator = createMustacheEvaluator();
const context = { data: { name: 'Ann', age: 30, tags: ['a', 'b'], nested: { x: 'y' } }, user: { id: 'U9' } };

describe('mustache evaluator', () => {
  it('returns a plain string as is and an empty string as resolved empty', () => {
    expect(evaluator.evaluate('hello', context)).toEqual({ status: 'resolved', value: 'hello' });
    expect(evaluator.evaluate('', context)).toEqual({ status: 'resolved', value: '' });
  });

  it('keeps the type of a single expression', () => {
    expect(evaluator.evaluate('{{data.age}}', context)).toEqual({ status: 'resolved', value: 30 });
    expect(evaluator.evaluate('{{data.age > 18}}', context)).toEqual({ status: 'resolved', value: true });
    expect(evaluator.evaluate('{{data.nested.x}}', context)).toEqual({ status: 'resolved', value: 'y' });
  });

  it('renders text with several templates to a string', () => {
    expect(evaluator.evaluate('{{data.name}} ({{user.id}})', context)).toEqual({ status: 'resolved', value: 'Ann (U9)' });
  });

  it('reports an unknown root as empty rather than returning the template', () => {
    const result = evaluator.evaluate('{{missing.value}}', context);
    expect(result).toEqual({ status: 'empty', unevaluated: ['{{missing.value}}'] });
  });

  it('reports a known root with no value as empty', () => {
    expect(evaluator.evaluate('{{data.nothing}}', context).status).toBe('empty');
  });

  it('runs library functions and formats dates', () => {
    expect(evaluator.evaluate("{{UPPER(data.name)}}", context)).toEqual({ status: 'resolved', value: 'ANN' });
    const date = evaluator.evaluate("{{DATEADD('2026-01-31', 1, 'day')}}", context);
    expect(date.status).toBe('resolved');
    expect(String((date as { value: unknown }).value).startsWith('2026-02-01')).toBe(true);
  });

  it('refuses unsafe expressions and falls back to rendering', () => {
    // arrow functions and constructors never reach `new Function`; plain rendering yields nothing for them
    expect(evaluator.evaluate('{{(() => 1)()}}', context).status).toBe('empty');
    expect(evaluator.evaluate('{{constructor.constructor("return 1")()}}', context).status).toBe('empty');
  });

  it('does not treat string literals as roots', () => {
    expect(evaluator.evaluate("{{CONCAT('missing.root', data.name)}}", context)).toEqual({ status: 'resolved', value: 'missing.rootAnn' });
  });
});
