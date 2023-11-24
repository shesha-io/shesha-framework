import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React, { FC, useMemo, useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { TOOLBOX_DATA_ITEM_DROPPABLE_KEY } from '@/providers/form/models';
import { useFormDesigner } from '@/providers/formDesigner';
import { getIconByPropertyMetadata } from '@/utils/metadata';

export interface IProps {
  items: IPropertyMetadata[];
  defaultExpandAll: boolean;
  searchText?: string;
}

const getTreeData = (prop: IPropertyMetadata, onAddItem: (prop: IPropertyMetadata) => void): DataNodeWithMeta => {
  const node: DataNodeWithMeta = {
    key: prop.path,
    title: prop.label ?? prop.path,
    isLeaf: prop.properties.length === 0,
    selectable: false,
    meta: prop,
  };
  node.children = prop.properties.map<DataNodeWithMeta>(childProp => getTreeData(childProp, onAddItem));

  onAddItem(prop);

  return node;
};

interface DataNodeWithMeta extends DataNode {
  meta: IPropertyMetadata;
}

interface NodesWithExpanded {
  nodes: DataNodeWithMeta[];
  expandedKeys: string[];
}

const DataSourceTree: FC<IProps> = ({ items, defaultExpandAll, searchText }) => {
  const [manuallyExpanded, setManuallyExpanded] = useState<string[]>(null);
  const { startDraggingNewItem, endDraggingNewItem } = useFormDesigner();
  const treeData = useMemo<NodesWithExpanded>(() => {
    const expanded: string[] = [];
    const nodes = items.map(item =>
      getTreeData(item, currentItem => {
        expanded.push(currentItem.path);
      })
    );

    return {
      nodes,
      expandedKeys: expanded,
    };
  }, [items]);

  useEffect(() => {
    if (defaultExpandAll) setManuallyExpanded(null);
  }, [defaultExpandAll]);

  const getTitle = (prop: IPropertyMetadata) => {
    const { label, path } = prop;
    const displayName = label ?? path;
    const index = displayName?.toLowerCase()?.indexOf(searchText);
    if (index === -1) return <span>{displayName}</span>;

    const beforeStr = displayName?.substring(0, index);
    const str = displayName?.substring(index, index + searchText.length);
    const afterStr = displayName?.substring(index + searchText.length, displayName.length);
    return (
      <span>
        {beforeStr}
        <span className="site-tree-search-value">{str}</span>
        {afterStr}
      </span>
    );
  };

  const renderTitle = (node: DataNodeWithMeta): React.ReactNode => {
    const icon = getIconByPropertyMetadata(node.meta);

    const sortableItem = {
      id: node.meta.path,
      parent_id: null,
      type: TOOLBOX_DATA_ITEM_DROPPABLE_KEY,
      metadata: node.meta,
    };

    const onDragStart = () => {
      startDraggingNewItem();
    };

    const onDragEnd = _evt => {
      endDraggingNewItem();
    };

    return (
      <ReactSortable
        list={[sortableItem]}
        setList={() => {
          /*nop*/
        }}
        group={{
          name: 'shared',
          pull: 'clone',
          put: false,
        }}
        sort={false}
        draggable=".sha-toolbox-component"
        ghostClass="sha-component-ghost"
        onStart={onDragStart}
        onEnd={onDragEnd}
      >
        <div className="sha-toolbox-component">
          {icon}
          <span className="sha-component-title">{getTitle(node.meta)}</span>
        </div>
      </ReactSortable>
    );
  };

  const onExpand = expandedKeys => {
    setManuallyExpanded(expandedKeys);
  };

  return (
    <Tree<DataNodeWithMeta>
      className="sha-datasource-tree"
      showIcon
      treeData={treeData.nodes}
      expandedKeys={defaultExpandAll && !Boolean(manuallyExpanded) ? treeData.expandedKeys : manuallyExpanded}
      onExpand={onExpand}
      draggable={false}
      selectable={false}
      titleRender={renderTitle}
    />
  );
};

export default DataSourceTree;
