import React from 'react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';
import { QueryBuilderRenderContext } from '../renderContext';
import { ItemPrefix } from '../itemPrefix';
import { RuleDragHandlePlaceholder } from '../ruleDragHandlePlaceholder';
import type { RuleProps } from '@react-awesome-query-builder/antd';

const NOT_OPTION_VALUE = '__NOT__';

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

const getItemByPath = (tree: any, path: string[]): any => {
  if (!tree || !path?.length || typeof tree.get !== 'function')
    return null;

  let node = tree;
  if (node.get('id') !== path[0])
    return null;

  for (let idx = 1; idx < path.length; idx += 1) {
    node = node.getIn(['children1', path[idx]]);
    if (!node)
      return null;
  }

  return node;
};

const getNodeTreePath = (path: string[]): (string | number)[] => {
  const result: (string | number)[] = [];

  for (let idx = 1; idx < path.length; idx += 1) {
    result.push('children1', path[idx]);
  }

  return result;
};

export const ItemWithRelation = (props: IItemWithRelationProps): JSX.Element => {
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
  const parentChildren = parentNode?.get?.('children1');
  const firstChildId = parentChildren?.keySeq?.()?.first?.();
  const isFirstInLevel = !parentNode || !firstChildId || firstChildId === id;
  const isGroupItem = type === 'group';
  const isEmptyGroupItem = type === 'group' && ((children1?.size ?? 0) === 0);
  const showPrefix = !isFirstInLevel || (!isGroupItem && !isEmptyGroupItem);

  const parentProperties = parentNode?.get?.('properties');
  const selectedConjunction = (
    parentProperties?.get?.('conjunction') ??
    config?.settings?.defaultConjunction ??
    'AND'
  );
  const not = Boolean(parentProperties?.get?.('not'));
  const relationValue = properties?.get?.('__relation');
  const selectedRelation = typeof relationValue === 'string'
    ? relationValue
    : (not ? NOT_OPTION_VALUE : selectedConjunction);

  const conjunctionOptions = Object.entries(config?.conjunctions ?? {}).map(([key, definition]) => ({
    value: key,
    label: (definition as { label?: string })?.label ?? key,
  }));
  const selectOptions = [
    ...conjunctionOptions,
    { value: NOT_OPTION_VALUE, label: config?.settings?.notLabel ?? 'Not' },
  ];

  const readonly = Boolean(
    isParentLocked ||
    config?.settings?.immutableGroupsMode ||
    actions?.setTree?.isDummyFn,
  );

  const handleChange = (value: string): void => {
    if (!tree || typeof (tree as { setIn?: unknown }).setIn !== 'function' || !actions?.setTree)
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
          renderSize={config?.settings?.renderSize}
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
