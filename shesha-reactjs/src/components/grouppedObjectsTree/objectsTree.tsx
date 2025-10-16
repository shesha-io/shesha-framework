import React, { useState, useEffect, ReactNode } from 'react';
import { Tree } from 'antd';
import ShaIcon from '@/components/shaIcon';

export interface IProps<TItem> {
  items: TItem[];
  defaultExpandAll?: boolean;
  defaultSelected?: string;
  searchText?: string;
  onChange: (item: TItem) => void;
  idFieldName?: string;
  nameFieldName?: string;
  childFieldName?: string;
  getChildren?: (item: TItem) => TItem[];
  getIsLeaf?: (item: TItem) => boolean;
  getIcon?: (item: TItem) => ReactNode;
  onRenterItem?: (item: TItem) => ReactNode;
}

interface DataNodeWithObject<TItem> {
  title: ReactNode;
  key: string;
  isLeaf?: boolean;
  children?: DataNodeWithObject<TItem>[];
  icon?: ReactNode;
  checkable?: boolean;
  selectable?: boolean;
  object: TItem;
}

export const ObjectsTree = <TItem = unknown>(props: IProps<TItem>): JSX.Element => {
  const [manuallyExpanded, setManuallyExpanded] = useState<string[]>([]);
  const [scrollId, setScrollId] = useState<string>(null);
  // const [nodes, setNodes] = useState<DataNode[]>([]);
  const [nodes, setNodes] = useState<DataNodeWithObject<TItem>[]>([]);

  const getName = (item: TItem): string => {
    return Boolean(props.nameFieldName) ? item[props.nameFieldName] : item['name'] ?? item['className'] ?? item;
  };
  const getId = (item: TItem): string => {
    return Boolean(props.idFieldName) ? item[props.idFieldName] : item['id'] ?? item['key'] ?? item;
  };

  const getTreeData = (item: TItem, onAddItem: (item: TItem) => void): DataNodeWithObject<TItem> => {
    const nested = Boolean(props.getChildren) ? props.getChildren(item) : item['children'];
    const node: DataNodeWithObject<TItem> = {
      key: (getId(item))?.toLowerCase(),
      title: getName(item),
      isLeaf: props.getIsLeaf ? props.getIsLeaf(item) : (!nested || (Array.isArray(nested) && nested.length === 0)),
      selectable: false,
      object: item,
    };
    if (Boolean(nested) && Array.isArray(nested)) {
      node.children = nested.map<DataNodeWithObject<TItem>>((childObj) => getTreeData(childObj, onAddItem));
    }

    onAddItem(item);
    return node;
  };

  useEffect(() => {
    setNodes([...props.items.map((item) =>
      getTreeData(item, (item) => {
        if (props.defaultExpandAll)
          setManuallyExpanded((state) => {
            if (state?.indexOf(getId(item)) === -1)
              return [...state, getId(item)];
            return state;
          });
      }),
    )]);
  }, [props.items, props.defaultExpandAll]);

  const getTitle = (item: TItem): ReactNode => {
    const name = getName(item);
    const index = name.toLowerCase().indexOf(props.searchText.toLowerCase());
    if (index === -1)
      return <span>{name}</span>;

    const beforeStr = name.substring(0, index);
    const str = name.substring(index, index + props.searchText.length);
    const afterStr = name.substring(index + props.searchText.length, name.length);
    return (
      <span>
        {beforeStr}
        <span className="site-tree-search-value">{str}</span>
        {afterStr}
      </span>
    );
  };

  const refs = nodes.reduce((ref, value) => {
    ref[value.key.toString()] = React.createRef();
    return ref;
  }, {});

  useEffect(() => {
    // TODO: find another way to scrolling after expand
    if (scrollId) {
      const timeout = setTimeout(() => {
        refs[scrollId?.toLowerCase()]?.current?.scrollIntoView({
          behavior: "auto",
          block: "center",
        });
        clearTimeout(timeout);
      }, 500);
    }
  }, [scrollId]);

  useEffect(() => {
    if (!scrollId) {
      setScrollId(props.defaultSelected);
    }
  }, [props.defaultSelected]);

  const renderTitle = (node: DataNodeWithObject<TItem>): React.ReactNode => {
    const icon = Boolean(props.getIcon) ? props.getIcon(node.object) : <ShaIcon iconName="BookOutlined" />;
    const markup = (
      <div className="sha-toolbox-component" key={node.key} ref={refs[node.key.toString()]}>
        {props.onRenterItem
          ? props.onRenterItem(node.object)
          : <>{icon}<span className="sha-component-title"> {getTitle(node.object)}</span></>}
      </div>
    );
    return markup;
  };

  const onExpand = (expandedKeys): void => {
    setManuallyExpanded(expandedKeys);
  };

  return (

    <Tree
      className="sha-datasource-tree"
      showIcon
      treeData={nodes}
      expandedKeys={manuallyExpanded}
      onExpand={onExpand}
      draggable={false}
      selectable={true}
      titleRender={renderTitle}
      onClick={(_, node) => {
        props.onChange(node['object']);
      }}
      selectedKeys={props.defaultSelected !== '' ? [props.defaultSelected?.toLowerCase()] : null}
    />
  );
};
