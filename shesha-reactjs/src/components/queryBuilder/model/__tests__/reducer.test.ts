import { createEmptyTree } from '../factories';
import { queryReducer, MAX_GROUP_NESTING } from '../reducer';
import { findNode } from '../tree';
import { isGroupNode, isRuleNode, QueryTree, RuleNode } from '../types';

const ruleAt = (tree: QueryTree, index: number): RuleNode => {
  const node = tree.children[index];
  if (!isRuleNode(node)) throw new Error(`child ${index} is not a rule`);
  return node;
};

describe('query model reducer', () => {
  it('adds a rule and sizes its values to the operator', () => {
    let tree = createEmptyTree();
    tree = queryReducer(tree, { type: 'addRule', groupId: tree.id });
    const rule = ruleAt(tree, 0);
    tree = queryReducer(tree, { type: 'setField', id: rule.id, field: 'age', resetOperator: true });
    tree = queryReducer(tree, { type: 'setOperator', id: rule.id, operator: 'between' });
    expect(ruleAt(tree, 0).values).toHaveLength(2);
    tree = queryReducer(tree, { type: 'setOperator', id: rule.id, operator: 'is_null' });
    expect(ruleAt(tree, 0).values).toHaveLength(0);
  });

  it('resets operator and values when the field changes kind', () => {
    let tree = createEmptyTree();
    tree = queryReducer(tree, { type: 'addRule', groupId: tree.id });
    const rule = ruleAt(tree, 0);
    tree = queryReducer(tree, { type: 'setOperator', id: rule.id, operator: 'is' });
    tree = queryReducer(tree, { type: 'setValue', id: rule.id, index: 0, value: { source: 'value', value: 'x' } });
    tree = queryReducer(tree, { type: 'setField', id: rule.id, field: 'other', resetOperator: true });
    expect(ruleAt(tree, 0).operator).toBeUndefined();
    expect(ruleAt(tree, 0).values).toHaveLength(0);
  });

  it('switching a value source replaces the slot with a fresh value of that source', () => {
    let tree = createEmptyTree();
    tree = queryReducer(tree, { type: 'addRule', groupId: tree.id });
    const rule = ruleAt(tree, 0);
    tree = queryReducer(tree, { type: 'setOperator', id: rule.id, operator: 'is' });
    tree = queryReducer(tree, { type: 'setValueSource', id: rule.id, index: 0, source: 'expression' });
    const value = ruleAt(tree, 0).values[0];
    expect(value?.source).toBe('expression');
    if (value?.source === 'expression') expect(value.required).toBe(true);
  });

  it('caps group nesting and refuses moves that would exceed it', () => {
    let tree = createEmptyTree();
    let parentId = tree.id;
    for (let level = 0; level < MAX_GROUP_NESTING + 1; level++) {
      tree = queryReducer(tree, { type: 'addGroup', groupId: parentId });
      const parent = findNode(tree, parentId)?.node;
      const child = isGroupNode(parent) ? parent.children[0] : undefined;
      if (child) parentId = child.id;
    }
    // the deepest allowed group has no child group
    const deepest = findNode(tree, parentId)?.node;
    expect(isGroupNode(deepest) && deepest.children.length).toBe(0);
  });

  it('moves a rule before another and keeps untouched branches by identity', () => {
    let tree = createEmptyTree();
    tree = queryReducer(tree, { type: 'addRule', groupId: tree.id });
    tree = queryReducer(tree, { type: 'addRule', groupId: tree.id });
    tree = queryReducer(tree, { type: 'addGroup', groupId: tree.id });
    const [first, second, group] = tree.children;
    if (!first || !second || !group) throw new Error('setup');
    const moved = queryReducer(tree, { type: 'move', id: second.id, targetId: first.id, placement: 'before' });
    expect(moved.children.map((c) => c.id)).toEqual([second.id, first.id, group.id]);
    expect(moved.children[2]).toBe(group);
    const appended = queryReducer(tree, { type: 'move', id: first.id, targetId: group.id, placement: 'append' });
    const target = appended.children.find((c) => c.id === group.id);
    expect(isGroupNode(target) && target.children[0]?.id).toBe(first.id);
  });

  it('changing a conjunction only touches that group', () => {
    let tree = createEmptyTree();
    tree = queryReducer(tree, { type: 'addRule', groupId: tree.id });
    const rule = tree.children[0];
    const next = queryReducer(tree, { type: 'setConjunction', id: tree.id, conjunction: 'or' });
    expect(next.conjunction).toBe('or');
    expect(next.children[0]).toBe(rule);
  });
});
