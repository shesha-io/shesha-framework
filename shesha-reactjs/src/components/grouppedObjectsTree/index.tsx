import React, { useMemo, useEffect, ReactNode, useCallback } from 'react';
import { Collapse, Empty } from 'antd';
import { getLastSection } from '@/utils/string';
import { ObjectsTree } from './objectsTree';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { getStringPropertyOrUndefined } from '@/utils/object';

export interface IGrouppedObjectsTreeProps<TItem> {
  defaultSelected?: string | undefined;
  items: TItem[];
  searchText?: string | undefined;
  groupBy?: string | undefined;
  openedKeys?: string[] | undefined;
  idFieldName?: string | undefined;
  nameFieldName?: string | undefined;
  childFieldName?: string | undefined;
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

export const GrouppedObjectsTree = <TItem extends object = object>(props: IGrouppedObjectsTreeProps<TItem>): React.JSX.Element => {
  const { items, onGetGroupName, searchText, isMatch, openedKeys = [], defaultSelected = "", idFieldName = "id", setOpenedKeys } = props;
  const childFieldName = (props.childFieldName ?? 'children') as keyof TItem;

  const getVisible = useCallback((items: TItem[] | undefined, searchText: string = ""): TItem[] => {
    const result: TItem[] = [];
    if (!items)
      return result;

    items.forEach((item) => {
      const child = childFieldName in item && isDefined(item[childFieldName]) && Array.isArray(item[childFieldName])
        ? item[childFieldName] as TItem[]
        : undefined;
      const childItems = getVisible(child, searchText);
      const matched =
        (Array.isArray(childItems) && childItems.length > 0) ||
        searchText === '' ||
        (typeof isMatch === 'function' ? isMatch(item, searchText) : false);

      if (matched) {
        const filteredItem: TItem = { ...item, [childFieldName]: [...childItems] };
        result.push(filteredItem);
      }
    });

    return result;
  }, [childFieldName, isMatch]);

  const grouping = useCallback((field: string, split: boolean): GrouppedObjects<TItem>[] => {
    const groups: GrouppedObjects<TItem>[] = [];

    const fieldKey = field as keyof TItem;
    items.forEach((item) => {
      const fieldValue = fieldKey in item && typeof (item[fieldKey]) === 'string' ? item[fieldKey] : "";

      let name = typeof onGetGroupName === 'function'
        ? onGetGroupName(field, fieldValue)
        : "";
      name = name ? name : split ? getLastSection('.', fieldValue) : fieldValue;
      name = name ? name : '-';
      const g = groups.filter((g) => {
        return g.groupName === name;
      });
      if (isNonEmptyArray(g)) {
        g[0].visibleItems.push(item);
      } else {
        groups.push({ groupName: name, visibleItems: [item] });
      }
    });
    groups.forEach((group) => {
      group.visibleItems = getVisible(group.visibleItems, searchText);
    });
    return groups.sort((a, b) => {
      return a.groupName === '-' ? 1 : b.groupName === '-' ? -1
        : a.groupName > b.groupName ? 1 : b.groupName > a.groupName ? -1 : 0;
    });
  }, [getVisible, items, onGetGroupName, searchText]);

  const onCollapseChange = useCallback((key: string[]): void => {
    if (isDefined(setOpenedKeys)) {
      setOpenedKeys(key);
    }
  }, [setOpenedKeys]);

  const onChangeHandler = (item: TItem): void => {
    if (isDefined(props.onChange))
      props.onChange(item);
  };

  const groups = useMemo<GrouppedObjects<TItem>[]>(() => {
    return !isNullOrWhiteSpace(props.groupBy)
      ? grouping(props.groupBy, false)
      : [{ groupName: '', visibleItems: getVisible(props.items, props.searchText) }];
  }, [props.groupBy, props.items, props.searchText, grouping, getVisible]);

  useEffect(() => {
    if (defaultSelected) {
      const g = groups.find((group) => group.visibleItems.find((item) => getStringPropertyOrUndefined(item, idFieldName)?.toLowerCase() === defaultSelected.toLocaleLowerCase()));
      if (g) {
        if (!openedKeys.find((key) => key === g.groupName)) {
          onCollapseChange([...openedKeys, g.groupName]);
        }
      }
    }
  }, [defaultSelected, groups, idFieldName, onCollapseChange, openedKeys]);

  const defaultExpandAll = !isNullOrWhiteSpace(searchText) && isNonEmptyArray(groups) && groups[0].visibleItems.length <= 6;

  return (
    <>
      {isNonEmptyArray(groups) && groups.length === 1 && (
        <div key={groups[0].groupName}>
          <ObjectsTree<TItem>
            items={groups[0].visibleItems}
            searchText={props.searchText}
            defaultExpandAll={defaultExpandAll}
            onChange={onChangeHandler}
            defaultSelected={props.defaultSelected?.toLowerCase()}
            onRenterItem={props.onRenterItem}
            getIcon={groups[0].groupName === '-' ? undefined : props.getIcon}
            getIsLeaf={groups[0].groupName === '-' ? undefined : props.getIsLeaf}
          />
        </div>
      )}
      {groups.length > 0 && (
        <Collapse
          {...(props.openedKeys ? { activeKey: props.openedKeys } : {})}
          accordion
          onChange={onCollapseChange}
          items={groups.map((ds) => {
            const defaultExpandAll = !isNullOrWhiteSpace(props.searchText) && ds.visibleItems.length <= 6;
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
                      searchText={props.searchText}
                      defaultExpandAll={defaultExpandAll}
                      onChange={onChangeHandler}
                      defaultSelected={props.defaultSelected?.toLowerCase()}
                      onRenterItem={props.onRenterItem}
                      getIcon={ds.groupName === '-' ? undefined : props.getIcon}
                      getIsLeaf={ds.groupName === '-' ? undefined : props.getIsLeaf}
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
