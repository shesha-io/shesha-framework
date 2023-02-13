import React, { FC } from 'react';
import { SidebarMenuItem } from './sidebarMenuItem';
import { useSidebarMenuConfigurator } from '../../../providers/sidebarMenuConfigurator';
import { ReactSortable, ItemInterface } from 'react-sortablejs';
import { ISidebarMenuItem } from '../../../interfaces/sidebar';
import SidebarMenuGroup from './sidebarMenuGroup';

export interface IToolbarItemsSortableProps {
  index?: number[];
  items: ISidebarMenuItem[];
}

export const SidebarItemsContainer: FC<IToolbarItemsSortableProps> = props => {
  const { updateChildItems } = useSidebarMenuConfigurator();

  const renderItem = (itemProps: ISidebarMenuItem, index: number, key: string) => {
    if (itemProps.itemType === 'group') {
      return <SidebarMenuGroup id={index} index={[...props.index, index]} {...itemProps} key={key} />;
    } else {
      return <SidebarMenuItem id={index} index={[...props.index, index]} {...itemProps} key={key} />;
    }
  };

  const onSetList = (newState: ItemInterface[]) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged && newState?.length) {
      const newChilds = newState.map<ISidebarMenuItem>(item => item as any);
      updateChildItems({ index: props.index, childs: newChilds });
    }
  };

  return (
    <ReactSortable
      // onStart={onDragStart}
      // onEnd={onDragEnd}
      list={props.items}
      setList={onSetList}
      fallbackOnBody={true}
      swapThreshold={0.5}
      group={{
        name: 'toolbarItems',
      }}
      sort={true}
      draggable=".sha-sidebar-item"
      animation={75}
      ghostClass="sha-sidebar-item-ghost"
      emptyInsertThreshold={20}
      handle=".sha-sidebar-item-drag-handle"
      scroll={true}
      bubbleScroll={true}
    >
      {props.items.map((item, index) => renderItem(item, index, item?.id))}
    </ReactSortable>
  );
};
export default SidebarItemsContainer;
