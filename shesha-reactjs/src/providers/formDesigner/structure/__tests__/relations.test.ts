import { haveRelationsChanged } from '../relations';

describe('haveRelationsChanged()', () => {
  it('is false for the same object', () => {
    const relations = { root: ['a'] };
    expect(haveRelationsChanged(relations, relations)).toBe(false);
  });

  it('is false for a shallow copy whose lists are unchanged', () => {
    const relations = { root: ['a', 'b'], c1: ['x'] };
    expect(haveRelationsChanged(relations, { ...relations })).toBe(false);
  });

  it('is false for a deep copy with the same content (undo/redo restore deep copies)', () => {
    expect(haveRelationsChanged({ root: ['a', 'b'] }, structuredClone({ root: ['a', 'b'] }))).toBe(false);
  });

  it('detects reordering', () => {
    expect(haveRelationsChanged({ root: ['a', 'b'] }, { root: ['b', 'a'] })).toBe(true);
  });

  it('detects an added container', () => {
    expect(haveRelationsChanged({ root: ['a'] }, { root: ['a'], c1: [] })).toBe(true);
  });

  it('detects a container replaced by another', () => {
    expect(haveRelationsChanged({ root: ['a'], c1: [] }, { root: ['a'], c2: [] })).toBe(true);
  });

  it('detects a child moved between containers', () => {
    expect(haveRelationsChanged({ root: ['a', 'b'], c1: [] }, { root: ['a'], c1: ['b'] })).toBe(true);
  });
});
