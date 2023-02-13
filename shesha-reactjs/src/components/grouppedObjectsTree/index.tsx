import React, { useMemo, useEffect, ReactNode } from 'react';
import { Collapse, Empty } from 'antd';
import { getLastSection } from '../../utils/string';
import { ObjectsTree } from './objectsTree';

const { Panel } = Collapse;

export interface IGrouppedObjectsTreeProps<TItem> {
    defaultSelected?: string;
    items: TItem[];
    searchText?: string;
    groupBy?: string;
    openedKeys?: string[];
    idFieldName?: string;
    nameFieldName?: string
    onChange?: (item: TItem) => void;
    isMatch?: (item: TItem, searchText: string) => void;
    setOpenedKeys?: (keys: string[]) => void;
    onRenterItem?: (item: TItem) => ReactNode;
    onGetGroupName?: (groupBy: string, data: string) => string;
  }
  
  interface GrouppedObjects<TItem> {
    groupName: string,
    visibleItems: TItem[],
  }
  
  export const GrouppedObjectsTree = <TItem,>(props: IGrouppedObjectsTreeProps<TItem>) => {
  
    const getVisible = (items: TItem[], searchText: string): TItem[] => {
      const result: TItem[] = [];
      if (!items)
        return result;
        
      items.forEach(item => {
        if (true /*!item.hidden*/){
          //const childItems = getVisible(item.child, searchText);
          const matched = (searchText ?? '') == '' || typeof props?.isMatch === 'function' ? props.isMatch(item, props.searchText) : false;
          
          if (matched /*|| childItems.length > 0*/) {
            const filteredItem: TItem = { ...item/*, child: childItems*/ };
            result.push(filteredItem)
          }
        }
      });
  
      return result;
    }
  
    const grouping = (field: string, split: boolean) => {
      const groups = [] as GrouppedObjects<TItem>[];
      if (Boolean(props?.items)){
        props.items?.forEach((item) => {
          let name = typeof props?.onGetGroupName === 'function' ?  props?.onGetGroupName(field, item[field]) : "";
          name = name ? name : split ? getLastSection('.', item[field]) : item[field];
          name = name ? name : '-';
          const g = groups.filter((g) => { return g.groupName === name});
          if (g.length > 0) {
            g[0].visibleItems.push(item);
          } else {
            groups.push({ groupName: name, visibleItems: [item]});
          }
        });
        groups.forEach(group => { group.visibleItems = getVisible(group.visibleItems, props.searchText) });
      }
      return groups.sort((a, b) => { return a.groupName == '-' ? 1 : b.groupName == '-' ? -1 
        : a.groupName > b.groupName ? 1 : b.groupName > a.groupName ? -1 : 0; });
    }
  
    const onCollapseChange = (key: string | string[]) => {
      if (Boolean(props?.setOpenedKeys)) {
        props.setOpenedKeys(Array.isArray(key) ? key : [key]);
      }
    };
  
    const onChangeHandler = (item: TItem) => {
      if (Boolean(props.onChange))
        props.onChange(item);
    }

    const groups = useMemo<GrouppedObjects<TItem>[]>(() => {
        return Boolean(props?.groupBy) ? grouping(props?.groupBy, false) : [{ groupName: '', visibleItems: getVisible(props?.items, props?.searchText) }];
    }, [props?.items, props?.searchText, props?.groupBy])

    useEffect(() => {
      if (props.defaultSelected) {
        const g = groups.find(group => group.visibleItems.find(item => (props.idFieldName ? item[props.idFieldName] : item['id'])?.toLowerCase() === props.defaultSelected?.toLocaleLowerCase()));
        if (g) {
          if (!props.openedKeys.find(key => key === g.groupName)) {
            onCollapseChange([...props.openedKeys, g.groupName])
          }
        }
      }      
    }, [groups])

    return (
      <>
        {groups.length > 0 && (
          <Collapse activeKey={props?.openedKeys} onChange={onCollapseChange} >
            {groups.map((ds) => {
              const visibleItems = ds.visibleItems;
  
              let classes = ['sha-toolbox-panel'];
              //if (ds.datasource.id === activeDataSourceId) classes.push('active');
              
              return visibleItems.length === 0 ? null : (
                ds.groupName === '-' 
                ? (
                  <div key={ds.groupName}>
                    <ObjectsTree<TItem>
                      items={visibleItems} 
                      searchText={props?.searchText} 
                      defaultExpandAll={(props?.searchText ?? '') !== ''}
                      onChange={ onChangeHandler }
                      defaultSelected={props.defaultSelected?.toLowerCase()}
                      onRenterItem={props?.onRenterItem}
                    />
                  </div>
                )
                : (
                  <Panel header={ds.groupName} key={ds.groupName} className={classes.reduce((a, c) => a + ' ' + c)} forceRender={true}>
                    <ObjectsTree<TItem>
                      items={visibleItems} 
                      searchText={props?.searchText} 
                      defaultExpandAll={(props?.searchText ?? '') !== ''}
                      onChange={ onChangeHandler }
                      defaultSelected={props?.openedKeys?.find(key => key == ds.groupName) ? props.defaultSelected?.toLowerCase() : null}
                      onRenterItem={props?.onRenterItem}
                    />
                  </Panel>
                )
              );
            })}
          </Collapse>
        )}
        {groups.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Objects not found" />
        )}
      </>
    );
}
  
export default GrouppedObjectsTree;
  