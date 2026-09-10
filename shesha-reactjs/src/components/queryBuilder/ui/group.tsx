import React from 'react';
import classNames from 'classnames';
import { Button, Dropdown, Tooltip } from 'antd';
import { DeleteOutlined, FolderOutlined, HolderOutlined, PlusOutlined } from '@ant-design/icons';
import QueryRuleElement from '../groupEmptyState/queryRuleElement';
import { canAddGroupAt } from '../model/reducer';
import { GroupNode, isGroupNode, isRawRuleNode, QueryNode } from '../model/types';
import { useBuilder } from './context';
import { IDragHandlers } from './dnd';
import { ItemAction } from './itemAction';
import { RelationPrefix } from './relationPrefix';
import { RuleRow } from './ruleRow';

const getGroupLogicLabel = (group: GroupNode): string =>
  group.conjunction === 'or' ? 'Any of the following are true...' : 'All of the following are true...';

interface ItemProps {
  node: QueryNode;
  parent: GroupNode;
  index: number;
  depth: number;
  drag: IDragHandlers;
}

const RawRule: React.FC<{ json: object; reason: string }> = ({ json, reason }) => (
  <div className="sha-query-builder-rule-row is-unary" title={reason}>
    <code className="sha-query-builder-raw-rule">{JSON.stringify(json)}</code>
  </div>
);

const QueryBuilderItem: React.FC<ItemProps> = ({ node, parent, index, depth, drag }) => {
  const { dispatch, readOnly } = useBuilder();
  const isDropBefore = drag.dropHint?.placement === 'before' && drag.dropHint.id === node.id;
  const isDropAfter = drag.dropHint?.placement === 'after' && drag.dropHint.id === node.id;
  const canDelete = !readOnly;
  const canDrag = !readOnly && (parent.children.length > 1 || depth > 1);

  return (
    <div
      className={classNames(
        'sha-query-builder-item-row',
        isGroupNode(node) && 'is-group',
        isDropBefore && 'is-drop-before',
        isDropAfter && 'is-drop-after',
      )}
      onDragOver={drag.onDragOverItem(node.id)}
      onDrop={drag.onDropOnItem(node.id)}
      onDragLeave={drag.onDragLeaveItem}
    >
      <div className="sha-query-builder-item-prefix">
        <RelationPrefix
          isFirst={index === 0}
          readOnly={readOnly}
          value={parent.conjunction}
          onChange={(conjunction) => dispatch({ type: 'setConjunction', id: parent.id, conjunction })}
        />
      </div>

      <div className="sha-query-builder-item-main">
        {isGroupNode(node) ? (
          <QueryBuilderGroup group={node} depth={depth} canDelete={canDelete} canDrag={canDrag} drag={drag} />
        ) : (
          <div className="sha-query-builder-item-shell">
            <div className="sha-query-builder-rule-scroll">
              {isRawRuleNode(node) ? <RawRule json={node.json} reason={node.reason} /> : <RuleRow rule={node} />}
            </div>
            <ItemAction action="delete" disabled={!canDelete} onDelete={() => dispatch({ type: 'remove', id: node.id })} />
            <ItemAction action="drag" disabled={!canDrag} onDragStart={drag.onStartDrag(node.id)} onDragEnd={drag.onFinishDrag} />
          </div>
        )}
      </div>
    </div>
  );
};

interface GroupProps {
  group: GroupNode;
  depth: number;
  canDelete: boolean;
  canDrag: boolean;
  drag: IDragHandlers;
}

export const QueryBuilderGroup: React.FC<GroupProps> = ({ group, depth, canDelete, canDrag, drag }) => {
  const { dispatch, readOnly, tree } = useBuilder();
  const canAddGroup = canAddGroupAt(tree, group.id);
  const isRoot = depth === 0;
  const isDropAppend = drag.dropHint?.placement === 'append' && drag.dropHint.id === group.id;

  const children = group.children.map((child, index) => (
    <QueryBuilderItem key={child.id} node={child} parent={group} index={index} depth={depth + 1} drag={drag} />
  ));

  if (isRoot) {
    if (group.children.length === 0) {
      return (
        <div className="sha-query-builder-surface is-empty">
          <QueryRuleElement
            onAddRule={() => dispatch({ type: 'addRule', groupId: group.id })}
            {...(canAddGroup ? { onAddGroup: () => dispatch({ type: 'addGroup', groupId: group.id }) } : {})}
            disabled={readOnly}
            addGroupDisabled={!canAddGroup}
          />
        </div>
      );
    }

    return (
      <div className="sha-query-builder-surface">
        <div className="sha-query-builder-heading">{getGroupLogicLabel(group)}</div>
        <div className="sha-query-builder-filter">
          <div className="sha-query-builder-filter-body">{children}</div>
          <div className="sha-query-builder-filter-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => dispatch({ type: 'addRule', groupId: group.id })} disabled={readOnly}>
              Add Rule
            </Button>
            <Tooltip title={!canAddGroup ? 'Maximum group nesting level reached' : undefined}>
              <Button icon={<FolderOutlined />} onClick={() => dispatch({ type: 'addGroup', groupId: group.id })} disabled={readOnly || !canAddGroup}>
                Add Group
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames('sha-query-builder-group-card', isDropAppend && 'is-drop-append')}
      onDragOver={drag.onDragOverAppend(group.id)}
      onDrop={drag.onDropAppend(group.id)}
      onDragLeave={drag.onDragLeaveItem}
    >
      <div className="sha-query-builder-group-header">
        <div className="sha-query-builder-group-heading" title={getGroupLogicLabel(group)}>
          {getGroupLogicLabel(group)}
        </div>

        <div className="sha-query-builder-group-actions">
          <Dropdown
            menu={{
              items: [
                { key: 'rule', icon: <PlusOutlined />, label: 'Add Rule', onClick: () => dispatch({ type: 'addRule', groupId: group.id }) },
                { key: 'group', icon: <FolderOutlined />, label: !canAddGroup ? <Tooltip title="Maximum group nesting level reached">Add Group</Tooltip> : 'Add Group', onClick: () => dispatch({ type: 'addGroup', groupId: group.id }), disabled: !canAddGroup },
              ],
            }}
            trigger={['click']}
            disabled={readOnly}
          >
            <Button type="primary" icon={<PlusOutlined />} disabled={readOnly} className="sha-query-builder-group-action-button" aria-label="Add" title="Add" />
          </Dropdown>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => dispatch({ type: 'remove', id: group.id })}
            disabled={!canDelete}
            danger
            className="sha-query-builder-group-action-button sha-query-builder-group-action-button--danger"
            aria-label="Delete Group"
            title="Delete Group"
          />
          <Button
            icon={<HolderOutlined />}
            draggable={canDrag}
            disabled={!canDrag}
            onDragStart={drag.onStartDrag(group.id)}
            onDragEnd={drag.onFinishDrag}
            className="sha-query-builder-group-action-button sha-query-builder-group-action-button--drag"
            aria-label="Drag Group"
            title="Drag Group"
          />
        </div>
      </div>

      <div className="sha-query-builder-group-children">
        {children}
        {group.children.length === 0 && isDropAppend && <div className="sha-query-builder-drop-placeholder" />}
      </div>
    </div>
  );
};
