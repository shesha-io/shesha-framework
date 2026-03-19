const NOT_OPTION_VALUE = '__NOT__';

type RelationValue = 'AND' | 'OR' | typeof NOT_OPTION_VALUE;

interface IPlainTreeNode {
  id?: string;
  type?: string;
  children1?: IPlainTreeNode[];
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

const isGroupNode = (node?: IPlainTreeNode): boolean => node?.type === 'group' || node?.type === 'rule_group';

const stripRelationProperty = (properties?: Record<string, unknown>): Record<string, unknown> | undefined => {
  if (!properties || !Object.prototype.hasOwnProperty.call(properties, '__relation'))
    return properties;

  const rest = { ...properties };
  delete rest.__relation;
  return rest;
};

const createGroupNode = (children: IPlainTreeNode[], conjunction: 'AND' | 'OR', id: string): IPlainTreeNode => ({
  type: 'group',
  id,
  properties: {
    conjunction,
    not: false,
  },
  children1: children,
});

const createNegatedNode = (node: IPlainTreeNode, id: string): IPlainTreeNode => createGroupNode([node], 'AND', id);

const applyNegation = (node: IPlainTreeNode, id: string): IPlainTreeNode => ({
  ...createNegatedNode(node, id),
  properties: {
    conjunction: 'AND',
    not: true,
  },
});

const getCustomRelation = (node: IPlainTreeNode): RelationValue | undefined => {
  const relation = node.properties?.__relation;
  if (relation === 'AND' || relation === 'OR' || relation === NOT_OPTION_VALUE)
    return relation;

  return undefined;
};

const normalizeNodeForExport = (node?: IPlainTreeNode): IPlainTreeNode | undefined => {
  if (!node)
    return node;

  const rawChildren = Array.isArray(node.children1) ? node.children1 : undefined;
  const normalizedChildren = rawChildren?.map((child) => normalizeNodeForExport(child) ?? child) ?? rawChildren;
  const normalizedNode: IPlainTreeNode = {
    ...node,
    properties: stripRelationProperty(node.properties),
    children1: normalizedChildren,
  };

  if (!isGroupNode(node) || !normalizedChildren?.length)
    return normalizedNode;

  const hasInlineRelations = rawChildren?.some((child, index) => index > 0 && Boolean(getCustomRelation(child)));
  if (!hasInlineRelations)
    return normalizedNode;

  const clauses: IPlainTreeNode[][] = [];
  let currentClause: IPlainTreeNode[] = [];

  normalizedChildren.forEach((child, index) => {
    if (!child)
      return;

    if (index === 0) {
      currentClause = [child];
      return;
    }

    const relation = getCustomRelation(rawChildren[index]) ?? 'AND';
    const clauseChild = relation === NOT_OPTION_VALUE
      ? applyNegation(child, `${node.id ?? 'group'}_not_${index}`)
      : child;

    if (relation === 'OR') {
      if (currentClause.length > 0)
        clauses.push(currentClause);
      currentClause = [clauseChild];
      return;
    }

    currentClause.push(clauseChild);
  });

  if (currentClause.length > 0)
    clauses.push(currentClause);

  const clauseNodes = clauses.map((clause, clauseIndex) => (
    clause.length === 1
      ? clause[0]
      : createGroupNode(clause, 'AND', `${node.id ?? 'group'}_clause_${clauseIndex}`)
  ));

  return {
    ...normalizedNode,
    properties: {
      ...stripRelationProperty(node.properties),
      conjunction: clauseNodes.length > 1 ? 'OR' : 'AND',
      not: false,
    },
    children1: clauseNodes,
  };
};

export const normalizeTreeForJsonLogic = <T extends IPlainTreeNode>(tree?: T): T | undefined => (
  normalizeNodeForExport(tree) as T | undefined
);

export const getRootLogicLabel = (tree?: IPlainTreeNode): string => {
  const normalizedTree = normalizeTreeForJsonLogic(tree);
  const conjunction = normalizedTree?.properties?.conjunction;

  if (conjunction === 'OR')
    return 'Show any...';

  return 'Show all...';
};
