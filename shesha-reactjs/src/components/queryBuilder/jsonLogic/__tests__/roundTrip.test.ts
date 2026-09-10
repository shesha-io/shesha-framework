import { OPERATORS } from '../../catalogue/operators';
import { createEmptyTree, newNodeId } from '../../model/factories';
import { isGroupNode, isRawRuleNode, QueryNode, QueryTree, RuleNode } from '../../model/types';
import { exportToJsonLogic } from '../export';
import { importFromJsonLogic } from '../import';
import corpus from './fixtures/corpus.json';

type Logic = Record<string, unknown>;

/** Shapes the importer accepts that the exporter writes in one canonical way. */
const normalize = (node: unknown): unknown => {
  if (Array.isArray(node)) return node.map(normalize);
  if (typeof node !== 'object' || node === null) return node;
  const obj = node as Logic;
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    const [op] = keys as [string];
    const args = obj[op];
    if (op === 'evaluate' && Array.isArray(args) && args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      const a = args[0] as Logic;
      return { evaluate: [{ expression: a['expression'], type: a['type'] ?? 'mustache', required: a['required'] === true }] };
    }
    if ((op === '!' || op === '!!') && Array.isArray(args) && args.length === 1) return { [op]: normalize(args[0]) };
    if (op === 'is_satisfied' && Array.isArray(args) && args.length === 1) return { is_satisfied: normalize(args[0]) };
  }
  return Object.fromEntries(keys.map((k) => [k, normalize(obj[k])]));
};

const rawRules = (node: QueryNode): QueryNode[] =>
  isRawRuleNode(node) ? [node] : isGroupNode(node) ? node.children.flatMap(rawRules) : [];

const CONTRACT = new Set(['and', 'or', '!', '!!', '==', '!=', '>', '>=', '<', '<=', 'var', 'in', 'startsWith', 'endsWith', 'is_satisfied', 'evaluate']);
const operatorsUsed = (node: unknown, into = new Set<string>()): Set<string> => {
  if (Array.isArray(node)) node.forEach((n) => operatorsUsed(n, into));
  else if (typeof node === 'object' && node !== null) {
    for (const [k, v] of Object.entries(node)) {
      if (k !== 'expression' && k !== 'type' && k !== 'required') into.add(k);
      operatorsUsed(v, into);
    }
  }
  return into;
};

describe('saved filters from the functional-test backends', () => {
  const fixtures = corpus as Array<{ source: string; logic: Logic }>;

  it('has the corpus', () => {
    expect(fixtures.length).toBeGreaterThan(20);
  });

  it.each(fixtures.map((f, i) => [i, f.source, f.logic] as const))('#%i %s round-trips', (_i, _source, logic) => {
    const tree = importFromJsonLogic(logic);
    const exported = exportToJsonLogic(tree);
    expect(exported).toEqual(normalize(logic));
    // and a second pass is stable
    expect(exportToJsonLogic(importFromJsonLogic(exported))).toEqual(exported);
  });

  it('understands every shape in the corpus without falling back to raw rules', () => {
    const raws = fixtures.flatMap((f) => rawRules(importFromJsonLogic(f.logic)).map((r) => ({ source: f.source, r })));
    expect(raws.map((x) => `${x.source}: ${JSON.stringify(x.r.kind === 'raw' ? x.r.json : null)}`)).toEqual([]);
  });
});

describe('catalogue coverage', () => {
  const rule = (field: string, operator: string, values: RuleNode['values']): QueryTree => ({
    ...createEmptyTree(),
    children: [{ kind: 'rule', id: newNodeId(), field, operator, values }],
  });
  const v = (value: unknown): RuleNode['values'][number] => ({ source: 'value', value: value as string });

  const samples: Array<[string, RuleNode['values'], Logic]> = [
    ['is', [v('x')], { '==': [{ var: 'f' }, 'x'] }],
    ['is_not', [v(1)], { '!=': [{ var: 'f' }, 1] }],
    ['is_empty', [], { '!': { var: 'f' } }],
    ['is_not_empty', [], { '!!': { var: 'f' } }],
    ['is_null', [], { '==': [{ var: 'f' }, null] }],
    ['is_not_null', [], { '!=': [{ var: 'f' }, null] }],
    ['contains', [v('ab')], { in: ['ab', { var: 'f' }] }],
    ['not_contains', [v('ab')], { '!': { in: ['ab', { var: 'f' }] } }],
    ['starts_with', [v('a')], { startsWith: [{ var: 'f' }, 'a'] }],
    ['ends_with', [v('z')], { endsWith: [{ var: 'f' }, 'z'] }],
    ['greater', [v(5)], { '>': [{ var: 'f' }, 5] }],
    ['greater_or_equal', [v(5)], { '>=': [{ var: 'f' }, 5] }],
    ['less', [v(5)], { '<': [{ var: 'f' }, 5] }],
    ['less_or_equal', [v(5)], { '<=': [{ var: 'f' }, 5] }],
    ['between', [v(1), v(9)], { '<=': [1, { var: 'f' }, 9] }],
    ['any_of', [v([1, 2])], { in: [{ var: 'f' }, [1, 2]] }],
    ['none_of', [v([1, 2])], { '!': { in: [{ var: 'f' }, [1, 2]] } }],
    ['is_satisfied', [], { is_satisfied: { var: 'f' } }],
    ['is_satisfied_when', [{ source: 'expression', language: 'javascript', expression: 'return true;', required: true }], { is_satisfied: [{ var: 'f' }, 'return true;'] }],
  ];

  it('covers every operator in the catalogue', () => {
    expect(samples.map(([k]) => k).sort()).toEqual(OPERATORS.map((o) => o.key).sort());
  });

  it.each(samples)('%s exports and imports back', (operator, values, expected) => {
    const exported = exportToJsonLogic(rule('f', operator, values));
    expect(exported).toEqual({ and: [expected] });
    const back = importFromJsonLogic(exported);
    const child = back.children[0];
    expect(child?.kind).toBe('rule');
    expect((child as RuleNode).operator).toBe(operator);
    expect(exportToJsonLogic(back)).toEqual(exported);
  });

  it('exports field and expression values', () => {
    const tree = rule('f', 'is', [{ source: 'field', path: 'g' }]);
    expect(exportToJsonLogic(tree)).toEqual({ and: [{ '==': [{ var: 'f' }, { var: 'g' }] }] });
    const expr = rule('f', 'is', [{ source: 'expression', language: 'mustache', expression: '{{data.id}}', required: false }]);
    expect(exportToJsonLogic(expr)).toEqual({ and: [{ '==': [{ var: 'f' }, { evaluate: [{ expression: '{{data.id}}', type: 'mustache', required: false }] }] }] });
  });

  it('leaves incomplete rules out and returns undefined for an empty query', () => {
    expect(exportToJsonLogic(createEmptyTree())).toBeUndefined();
    expect(exportToJsonLogic(rule('f', 'is', [{ source: 'value' }]))).toBeUndefined();
    expect(exportToJsonLogic(rule('', 'is', [v(1)]))).toBeUndefined();
  });

  it('never emits an operator outside the backend contract', () => {
    for (const [operator, values] of samples) {
      const used = operatorsUsed(exportToJsonLogic(rule('f', operator, values)));
      used.forEach((op) => expect(CONTRACT.has(op), `operator ${op} from ${operator}`).toBe(true));
    }
  });
});

describe('import fallbacks', () => {
  it('keeps a negated group and round-trips it', () => {
    const logic = { '!': { and: [{ '==': [{ var: 'a' }, 1] }] } };
    const tree = importFromJsonLogic(logic);
    expect(tree.not).toBe(true);
    expect(exportToJsonLogic(tree)).toEqual(logic);
    const nested = importFromJsonLogic({ and: [logic] });
    expect(nested.children[0] && isGroupNode(nested.children[0]) && nested.children[0].not).toBe(true);
    expect(exportToJsonLogic(nested)).toEqual({ and: [logic] });
  });

  it('turns unknown shapes into raw rules that survive untouched', () => {
    const logic = { and: [{ date_add: [{ now: [] }, 1, 'day'] }, { '==': [{ var: 'a' }, { toLowerCase: [{ var: 'b' }] }] }] };
    const tree = importFromJsonLogic(logic);
    expect(rawRules(tree)).toHaveLength(2);
    expect(exportToJsonLogic(tree)).toEqual(logic);
  });

  it('wraps a bare rule in a root group', () => {
    const tree = importFromJsonLogic({ '==': [{ var: 'a' }, 1] });
    expect(tree.conjunction).toBe('and');
    expect(tree.children).toHaveLength(1);
  });
});
