import React, { useState, useEffect, ReactNode, useCallback, Key, RefObject } from 'react';
import { Tree } from 'antd';
import { ShaIcon } from '@/components/shaIcon';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getFirstNonEmptyStringPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { isNonEmptyArray } from '@/utils/array';

export interface IProps<TItem> {
  items: TItem[];
  defaultExpandAll?: boolean | undefined;
  defaultSelected?: string | undefined;
  searchText?: string | undefined;
  onChange: (item: TItem) => void;
  idFieldName?: string;
  nameFieldName?: string | undefined;
  childFieldName?: string | undefined;
  getChildren?: ((item: TItem) => TItem[]) | undefined;
  getIsLeaf?: ((item: TItem) => boolean) | undefined;
  getIcon?: ((item: TItem) => ReactNode) | undefined;
  onRenterItem?: ((item: TItem) => ReactNode) | undefined;
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

export const ObjectsTree = <TItem extends object = object>(props: IProps<TItem>): React.JSX.Element => {
  const { getChildren, getIsLeaf, nameFieldName, idFieldName, searchText = "" } = props;
  const [manuallyExpanded, setManuallyExpanded] = useState<Key[]>([]);
  const [scrollId, setScrollId] = useState<string | undefined>(undefined);
  const [nodes, setNodes] = useState<DataNodeWithObject<TItem>[]>([]);

  const getName = useCallback((item: TItem): string => {
    const result = !isNullOrWhiteSpace(nameFieldName)
      ? getStringPropertyOrUndefined(item, nameFieldName)
      : getFirstNonEmptyStringPropertyOrUndefined(item, ['name', 'className']);
    return result ?? "";
  }, [nameFieldName]);

  const getId = useCallback((item: TItem): string => {
    const result = !isNullOrWhiteSpace(idFieldName)
      ? getStringPropertyOrUndefined(item, nameFieldName)
      : getFirstNonEmptyStringPropertyOrUndefined(item, ['id', 'key']);
    return result ?? "";
  }, [idFieldName, nameFieldName]);

  const getTreeData = useCallback((item: TItem, onAddItem: (item: TItem) => void): DataNodeWithObject<TItem> => {
    const nested = isDefined(getChildren)
      ? getChildren(item)
      : 'children' in item && isDefined(item.children) && Array.isArray(item.children) ? item.children as TItem[] : undefined;

    const node: DataNodeWithObject<TItem> = {
      key: (getId(item)).toLowerCase(),
      title: getName(item),
      isLeaf: getIsLeaf
        ? getIsLeaf(item)
        : !isNonEmptyArray(nested),
      selectable: false,
      object: item,
    };
    if (Boolean(nested) && Array.isArray(nested)) {
      node.children = nested.map<DataNodeWithObject<TItem>>((childObj) => getTreeData(childObj, onAddItem));
    }

    onAddItem(item);
    return node;
  }, [getChildren, getId, getIsLeaf, getName]);

  useEffect(() => {
    setNodes([...props.items.map((item) =>
      getTreeData(item, (item) => {
        if (props.defaultExpandAll)
          setManuallyExpanded((state) => {
            if (state.indexOf(getId(item)) === -1)
              return [...state, getId(item)];
            return state;
          });
      }),
    )]);
  }, [props.items, props.defaultExpandAll, getTreeData, getId]);

  const getTitle = (item: TItem): ReactNode => {
    const name = getName(item);
    const index = name.toLowerCase().indexOf(searchText.toLowerCase());
    if (index === -1)
      return <span>{name}</span>;

    const beforeStr = name.substring(0, index);
    const str = name.substring(index, index + searchText.length);
    const afterStr = name.substring(index + searchText.length, name.length);
    return (
      <span>
        {beforeStr}
        <span className="site-tree-search-value">{str}</span>
        {afterStr}
      </span>
    );
  };

  const refs: Record<string, RefObject<HTMLDivElement | null>> = nodes.reduce((ref, value) => {
    ref[value.key.toString()] = React.createRef<HTMLDivElement>();
    return ref;
  }, {} as Record<string, RefObject<HTMLDivElement | null>>);

  useEffect(() => {
    // TODO: find another way to scrolling after expand
    if (scrollId) {
      const timeout = setTimeout(() => {
        refs[scrollId.toLowerCase()]?.current?.scrollIntoView({
          behavior: "auto",
          block: "center",
        });
        clearTimeout(timeout);
      }, 500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollId]);

  useEffect(() => {
    if (!scrollId) {
      setScrollId(props.defaultSelected);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.defaultSelected]);

  const renderTitle = (node: DataNodeWithObject<TItem>): React.ReactNode => {
    const icon = isDefined(props.getIcon) ? props.getIcon(node.object) : <ShaIcon iconName="BookOutlined" />;
    const markup = (
      <div className="sha-toolbox-component" key={node.key} ref={refs[node.key.toString()]}>
        {props.onRenterItem
          ? props.onRenterItem(node.object)
          : <>{icon}<span className="sha-component-title"> {getTitle(node.object)}</span></>}
      </div>
    );
    return markup;
  };

  const onExpand = (expandedKeys: Key[]): void => {
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
      {...(!isNullOrWhiteSpace(props.defaultSelected) ? { selectedKeys: [props.defaultSelected.toLowerCase()] } : {})}
    />
  );
};
