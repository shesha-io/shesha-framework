import { getOperator } from '../catalogue/operators';
import { createGroup, createRule, createValue } from './factories';
import { findNode, getGroupDepth, getSubtreeGroupDepth, insertChild, isDescendant, removeNode, updateNode } from './tree';
import { Conjunction, DropPlacement, isGroupNode, isRuleNode, QueryTree, RuleNode, RuleValue, ValueSource } from './types';

export const MAX_GROUP_NESTING = 3;

export type QueryAction =
  { type: 'replace'; tree: QueryTree } |
  { type: 'setField'; id: string; field: string | undefined; resetOperator: boolean } |
  { type: 'setOperator'; id: string; operator: string | undefined } |
  { type: 'setValue'; id: string; index: number; value: RuleValue } |
  { type: 'setValueSource'; id: string; index: number; source: ValueSource } |
  { type: 'setConjunction'; id: string; conjunction: Conjunction } |
  { type: 'addRule'; groupId: string } |
  { type: 'addGroup'; groupId: string } |
  { type: 'remove'; id: string } |
  { type: 'move'; id: string; targetId: string; placement: DropPlacement };

/** Sizes `values` to the operator's cardinality, keeping what already exists. */
const fitValues = (rule: RuleNode, operator: string | undefined): RuleValue[] => {
  const def = getOperator(operator);
  if (!def) return [];
  const allowed = def.sources;
  const values: RuleValue[] = [];
  for (let index = 0; index < def.cardinality; index++) {
    const existing = rule.values[index];
    if (existing && allowed.includes(existing.source)) {
      values.push(existing.source === 'expression' && def.expressionLanguage !== undefined
        ? { ...existing, language: def.expressionLanguage }
        : existing);
    } else {
      const source = allowed[0] ?? 'value';
      const created = createValue(source);
      values.push(created.source === 'expression' && def.expressionLanguage !== undefined ? { ...created, language: def.expressionLanguage } : created);
    }
  }
  return values;
};

export const canAddGroupAt = (tree: QueryTree, groupId: string): boolean => getGroupDepth(tree, groupId) < MAX_GROUP_NESTING;

export const canMoveTo = (tree: QueryTree, id: string, targetId: string, placement: DropPlacement): boolean => {
  if (id === targetId) return false;
  if (isDescendant(tree, id, targetId)) return false;
  const source = findNode(tree, id);
  const target = findNode(tree, targetId);
  if (!source || !target || source.parent === undefined) return false;
  const destinationGroupId = placement === 'append' ? targetId : target.parent?.id;
  if (destinationGroupId === undefined) return false;
  if (placement === 'append' && !isGroupNode(target.node)) return false;
  if (!isGroupNode(source.node)) return true;
  return getGroupDepth(tree, destinationGroupId) + getSubtreeGroupDepth(source.node) <= MAX_GROUP_NESTING;
};

export const queryReducer = (tree: QueryTree, action: QueryAction): QueryTree => {
  switch (action.type) {
    case 'replace':
      return action.tree;

    case 'setField':
      return updateNode(tree, action.id, (node) => {
        if (!isRuleNode(node)) return node;
        const next: RuleNode = { ...node, field: action.field };
        if (action.resetOperator) {
          next.operator = undefined;
          next.values = [];
        }
        return next;
      });

    case 'setOperator':
      return updateNode(tree, action.id, (node) =>
        isRuleNode(node) ? { ...node, operator: action.operator, values: fitValues(node, action.operator) } : node);

    case 'setValue':
      return updateNode(tree, action.id, (node) => {
        if (!isRuleNode(node)) return node;
        const values = [...node.values];
        values[action.index] = action.value;
        return { ...node, values };
      });

    case 'setValueSource':
      return updateNode(tree, action.id, (node) => {
        if (!isRuleNode(node)) return node;
        const current = node.values[action.index];
        if (current?.source === action.source) return node;
        const def = getOperator(node.operator);
        const created = createValue(action.source);
        const values = [...node.values];
        values[action.index] = created.source === 'expression' && def?.expressionLanguage !== undefined
          ? { ...created, language: def.expressionLanguage }
          : created;
        return { ...node, values };
      });

    case 'setConjunction':
      return updateNode(tree, action.id, (node) =>
        isGroupNode(node) && node.conjunction !== action.conjunction ? { ...node, conjunction: action.conjunction } : node);

    case 'addRule':
      return insertChild(tree, action.groupId, createRule());

    case 'addGroup':
      return canAddGroupAt(tree, action.groupId) ? insertChild(tree, action.groupId, createGroup()) : tree;

    case 'remove':
      return removeNode(tree, action.id);

    case 'move': {
      if (!canMoveTo(tree, action.id, action.targetId, action.placement)) return tree;
      const source = findNode(tree, action.id);
      if (!source) return tree;
      const without = removeNode(tree, action.id);
      if (action.placement === 'append') return insertChild(without, action.targetId, source.node);
      const target = findNode(without, action.targetId);
      if (!target || !target.parent) return tree;
      const index = action.placement === 'before' ? target.index : target.index + 1;
      return insertChild(without, target.parent.id, source.node, index);
    }

    default:
      return tree;
  }
};
