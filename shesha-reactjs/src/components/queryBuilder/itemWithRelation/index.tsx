import React from 'react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';
import { QueryBuilderRenderContext } from '../renderContext';
import { ItemPrefix } from '../itemPrefix';
import { RuleDragHandlePlaceholder } from '../ruleDragHandlePlaceholder';
import type { RuleProps } from '@react-awesome-query-builder/antd';
import type { Map as ImmMap } from 'immutable';

type ImmNode = ImmMap<string, unknown>;

interface IItemWithRelationProps {
  id: string;
  type?: string;
  path: unknown;
  children1?: {
    size?: number;
  } | null;
  properties?: {
    get?: (name: string) => unknown;
  };
  config: {
    settings?: {
      defaultConjunction?: string;
      immutableGroupsMode?: boolean;
      notLabel?: string;
      renderSize?: 'small' | 'medium' | 'large';
    };
    conjunctions?: Record<string, { label?: string }>;
  };
  actions: {
    setConjunction?: ((path: unknown, conjunction: string) => void) & { isDummyFn?: boolean };
    setNot?: ((path: unknown, not: boolean) => void) & { isDummyFn?: boolean };
    setTree?: ((tree: unknown) => void) & { isDummyFn?: boolean };
  };
  itemComponent: React.ElementType;
  isParentLocked?: boolean;
  [key: string]: unknown;
}

const toPathArray = (path: unknown): string[] => {
  if (Array.isArray(path))
    return path.filter((item): item is string => typeof item === 'string');

  if (path && typeof (path as { toArray?: () => unknown[] }).toArray === 'function')
    return (path as { toArray: () => unknown[] }).toArray().filter((item): item is string => typeof item === 'string');

  return [];
};

const isImmNode = (value: unknown): value is ImmNode =>
  Boolean(value) && typeof (value as { get?: unknown }).get === 'function';

const getItemByPath = (tree: unknown, path: string[]): ImmNode | null => {
  if (!isImmNode(tree) || !path.length)
    return null;

  let node: ImmNode = tree;
  if (node.get('id') !== path[0])
    return null;

  for (let idx = 1; idx < path.length; idx += 1) {
    const next = node.getIn(['children1', path[idx]]);
    if (!isImmNode(next))
      return null;
    node = next;
  }

  return node;
};

const getNodeTreePath = (path: string[]): (string | number)[] => {
  const result: (string | number)[] = [];

  for (let idx = 1; idx < path.length; idx += 1) {
    result.push('children1', path[idx] ?? '');
  }

  return result;
};

export const ItemWithRelation = (props: IItemWithRelationProps): React.JSX.Element => {
  const {
    id,
    path,
    properties,
    config,
    actions,
    itemComponent: ItemComponent,
    isParentLocked,
    type,
    children1,
  } = props;
  const [itemHostElement, setItemHostElement] = React.useState<HTMLDivElement | null>(null);

  const { tree } = React.useContext(QueryBuilderRenderContext);
  const ruleElement = itemHostElement?.querySelector<HTMLDivElement>('.group-or-rule-container.rule-container > .rule.group-or-rule') ?? null;

  const itemPath = toPathArray(path);
  const parentPathArray = itemPath.slice(0, -1);
  const parentNode = getItemByPath(tree, parentPathArray);
  const parentChildren = parentNode?.get('children1');
  const firstChildId = isImmNode(parentChildren) ? parentChildren.keySeq().first() : undefined;
  const isFirstInLevel = !parentNode || !firstChildId || firstChildId === id;
  const isGroupItem = type === 'group';
  const isEmptyGroupItem = type === 'group' && ((children1?.size ?? 0) === 0);
  const showPrefix = !isFirstInLevel || (!isGroupItem && !isEmptyGroupItem);

  const parentProperties = parentNode?.get('properties');
  const parentConjunction = isImmNode(parentProperties) ? parentProperties.get('conjunction') : undefined;
  const selectedConjunction: string = (
    (typeof parentConjunction === 'string' ? parentConjunction : undefined) ??
    config.settings?.defaultConjunction ??
    'AND'
  );
  const relationValue = properties?.get?.('__relation');
  const selectedRelation = typeof relationValue === 'string'
    ? relationValue
    : selectedConjunction;

  const conjunctionOptions = Object.entries(config.conjunctions ?? {}).map(([key, definition]) => ({
    value: key,
    label: (definition as { label?: string }).label ?? key,
  }));
  const selectOptions = conjunctionOptions;

  const readonly = Boolean(
    isParentLocked ||
    config.settings?.immutableGroupsMode ||
    actions.setTree?.isDummyFn,
  );

  const handleChange = (value: string): void => {
    if (!tree || typeof (tree as { setIn?: unknown }).setIn !== 'function' || !actions.setTree)
      return;

    const nodeTreePath = getNodeTreePath(itemPath);
    const updatedTree = (tree as { setIn: (path: (string | number)[], val: unknown) => unknown }).setIn(
      [...nodeTreePath, 'properties', '__relation'],
      value,
    );

    actions.setTree(updatedTree);
  };

  return (
    <div
      ref={setItemHostElement}
      className={classNames('sha-query-builder-item-with-relation', { 'sha-query-builder-item-with-relation--has-relation': !isFirstInLevel })}
    >
      {showPrefix && (
        <ItemPrefix
          isFirstInLevel={isFirstInLevel}
          readonly={readonly}
          options={selectOptions}
          selectedRelation={selectedRelation}
          {...(config.settings?.renderSize !== undefined ? { renderSize: config.settings.renderSize } : {})}
          onChange={handleChange}
        />
      )}
      <ItemComponent {...props} />
      {type === 'rule' && ruleElement && createPortal(
        <RuleDragHandlePlaceholder {...(props as unknown as RuleProps)} />,
        ruleElement,
      )}
    </div>
  );
};
