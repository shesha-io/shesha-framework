import { deepMergeValues, isJsonLogicNode } from './object';

describe('deepMergeValues with saved filters', () => {
  it('replaces a filter expression instead of merging operators together', () => {
    const before = { permanentFilter: { and: [{ '==': [{ var: 'a' }, 1] }] }, other: { keep: true } };
    const after = deepMergeValues(before, { permanentFilter: { or: [{ '==': [{ var: 'b' }, 2] }] } });
    expect(after.permanentFilter).toEqual({ or: [{ '==': [{ var: 'b' }, 2] }] });
    expect(after.other).toEqual({ keep: true });
  });

  it('still merges ordinary nested settings', () => {
    const after = deepMergeValues({ font: { size: 12, weight: 400 } }, { font: { size: 14 } });
    expect(after.font).toEqual({ size: 14, weight: 400 });
  });

  it('recognises expression nodes and nothing else', () => {
    expect(isJsonLogicNode({ and: [] })).toBe(true);
    expect(isJsonLogicNode({ '!': { var: 'a' } })).toBe(true);
    expect(isJsonLogicNode({ var: 'a' })).toBe(true);
    expect(isJsonLogicNode({ evaluate: [{ expression: 'x' }] })).toBe(true);
    expect(isJsonLogicNode({ size: 12 })).toBe(false);
    expect(isJsonLogicNode({ min: 1, max: 10 })).toBe(false);
    expect(isJsonLogicNode({ min: 2 })).toBe(false);
    expect(isJsonLogicNode({})).toBe(false);
    expect(isJsonLogicNode([{ and: [] }])).toBe(false);
  });

  it('still merges settings whose keys happen to be operator names', () => {
    const after = deepMergeValues({ limits: { min: 1, max: 10 } }, { limits: { min: 2 } });
    expect(after.limits).toEqual({ min: 2, max: 10 });
  });

  it('replaces a corrupted two-operator node when a real node arrives', () => {
    const after = deepMergeValues({ filter: { and: [{ var: 'a' }], or: [{ var: 'b' }] } }, { filter: { or: [{ var: 'c' }] } });
    expect(after.filter).toEqual({ or: [{ var: 'c' }] });
  });
});
