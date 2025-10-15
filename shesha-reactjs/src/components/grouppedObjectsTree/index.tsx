import React, { useMemo, useEffect, ReactNode } from 'react';
import { Collapse, Empty } from 'antd';
import { getLastSection } from '@/utils/string';
import { ObjectsTree } from './objectsTree';

export interface IGrouppedObjectsTreeProps<TItem> {
  defaultSelected?: string;
  items: TItem[];
  searchText?: string;
  groupBy?: string;
  openedKeys?: string[];
  idFieldName?: string;
  nameFieldName?: string;
  childFieldName?: string;
  onChange?: (item: TItem) => void;
  isMatch?: (item: TItem, searchText: string) => void;
  setOpenedKeys?: (keys: string[]) => void;
  onRenterItem?: (item: TItem) => ReactNode;
  getIcon?: (item: TItem) => ReactNode;
  getIsLeaf?: (item: TItem) => boolean;
  onGetGroupName?: (groupBy: string, data: string) => string;
}

interface GrouppedObjects<TItem> {
  groupName: string;
  visibleItems: TItem[];
}

export const GrouppedObjectsTree = <TItem = unknown>(props: IGrouppedObjectsTreeProps<TItem>): JSX.Element => {
  const childFieldName = props.childFieldName ?? 'children';

  const getVisible = (items: TItem[], searchText: string): TItem[] => {
    const result: TItem[] = [];
    if (!items)
      return result;

    items.forEach((item) => {
      if (true /* !item.hidden*/) {
        const childItems = getVisible(item[childFieldName], searchText);
        const matched =
          (Array.isArray(childItems) && childItems.length > 0) ||
          (searchText ?? '') === '' ||
          (typeof props?.isMatch === 'function' ? props.isMatch(item, props.searchText) : false);

        if (matched /* || childItems.length > 0*/) {
          const filteredItem: TItem = { ...item, [childFieldName]: [...childItems] };
          result.push(filteredItem);
        }
      }
    });

    return result;
  };

  const grouping = (field: string, split: boolean): GrouppedObjects<TItem>[] => {
    const groups = [] as GrouppedObjects<TItem>[];
    if (Boolean(props?.items)) {
      props.items?.forEach((item) => {
        let name = typeof props?.onGetGroupName === 'function' ? props?.onGetGroupName(field, item[field]) : "";
        name = name ? name : split ? getLastSection('.', item[field]) : item[field];
        name = name ? name : '-';
        const g = groups.filter((g) => {
          return g.groupName === name;
        });
        if (g.length > 0) {
          g[0].visibleItems.push(item);
        } else {
          groups.push({ groupName: name, visibleItems: [item] });
        }
      });
      groups.forEach((group) => {
        group.visibleItems = getVisible(group.visibleItems, props.searchText);
      });
    }
    return groups.sort((a, b) => {
      return a.groupName === '-' ? 1 : b.groupName === '-' ? -1
        : a.groupName > b.groupName ? 1 : b.groupName > a.groupName ? -1 : 0;
    });
  };

  const onCollapseChange = (key: string | string[]): void => {
    if (Boolean(props?.setOpenedKeys)) {
      props.setOpenedKeys(Array.isArray(key) ? key : [key]);
    }
  };

  const onChangeHandler = (item: TItem): void => {
    if (Boolean(props.onChange))
      props.onChange(item);
  };

  const groups = useMemo<GrouppedObjects<TItem>[]>(() => {
    return Boolean(props?.groupBy) ? grouping(props?.groupBy, false) : [{ groupName: '', visibleItems: getVisible(props?.items, props?.searchText) }];
  }, [props?.items, props?.searchText, props?.groupBy]);

  useEffect(() => {
    if (props.defaultSelected) {
      const g = groups.find((group) => group.visibleItems.find((item) => (props.idFieldName ? item[props.idFieldName] : item['id'])?.toLowerCase() === props.defaultSelected?.toLocaleLowerCase()));
      if (g) {
        if (!props.openedKeys.find((key) => key === g.groupName)) {
          onCollapseChange([...props.openedKeys, g.groupName]);
        }
      }
    }
  }, [groups]);

  const defaultExpandAll = props?.searchText.length > 1 && groups[0].visibleItems.length <= 6;

  return (
    <>
      {groups.length === 1 && (
        <div key={groups[0].groupName}>
          <ObjectsTree<TItem>
            items={groups[0].visibleItems}
            searchText={props?.searchText}
            defaultExpandAll={defaultExpandAll}
            onChange={onChangeHandler}
            defaultSelected={props.defaultSelected?.toLowerCase()}
            onRenterItem={props?.onRenterItem}
            getIcon={groups[0].groupName === '-' ? undefined : props?.getIcon}
            getIsLeaf={groups[0].groupName === '-' ? undefined : props?.getIsLeaf}
          />
        </div>
      )}
      {groups.length > 0 && (
        <Collapse
          activeKey={props?.openedKeys}
          accordion
          onChange={onCollapseChange}
          items={groups.map((ds) => {
            const defaultExpandAll = props?.searchText.length > 1 && ds.visibleItems.length <= 6;
            return {
              label: <span>{ds.groupName}</span>,
              className: 'sha-toolbox-panel',
              title: ds.groupName,
              forceRender: true,
              children: ds.visibleItems.length === 0 ? null
                : (
                  <div key={ds.groupName}>
                    <ObjectsTree<TItem>
                      items={ds.visibleItems}
                      searchText={props?.searchText}
                      defaultExpandAll={defaultExpandAll}
                      onChange={onChangeHandler}
                      defaultSelected={props.defaultSelected?.toLowerCase()}
                      onRenterItem={props?.onRenterItem}
                      getIcon={ds.groupName === '-' ? undefined : props?.getIcon}
                      getIsLeaf={ds.groupName === '-' ? undefined : props?.getIsLeaf}
                    />
                  </div>
                ),
            };
          })}
        >
          {}
        </Collapse>
      )}
      {groups.length === 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Objects not found" />
      )}
    </>
  );
};

export default GrouppedObjectsTree;
