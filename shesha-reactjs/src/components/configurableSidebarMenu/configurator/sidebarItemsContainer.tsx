import React, { FC } from 'react';
import { SidebarMenuItem } from './sidebarMenuItem';
import { useSidebarMenuConfigurator } from '@/providers/sidebarMenuConfigurator';
import { ReactSortable, ItemInterface } from 'react-sortablejs';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import SidebarMenuGroup from './sidebarMenuGroup';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface ISidebarItemsContainerProps {
  index?: number[];
  items: ISidebarMenuItem[];
}

export const SidebarItemsContainer: FC<ISidebarItemsContainerProps> = props => {
  const { updateChildItems } = useSidebarMenuConfigurator();
  const { styles } = useStyles();

  const renderItem = (itemProps: ISidebarMenuItem, index: number, key: string) => {
    if (isSidebarGroup(itemProps)) {
      return (
        <SidebarMenuGroup
          index={[...props.index, index]}
          item={itemProps}
          key={key}
          containerRendering={(args) => (<SidebarItemsContainer {...args} />)}
        />);
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
      list={props.items}
      setList={onSetList}
      fallbackOnBody={true}
      swapThreshold={0.5}
      group={{
        name: 'toolbarItems',
      }}
      sort={true}
      draggable={`.${styles.shaToolbarItem}`}
      animation={75}
      ghostClass={styles.shaToolbarItemGhost}
      emptyInsertThreshold={20}
      handle={`.${styles.shaToolbarItemDragHandle}`}
      scroll={true}
      bubbleScroll={true}
    >
      {props.items.map((item, index) => renderItem(item, index, item?.id))}
    </ReactSortable>
  );
};
export default SidebarItemsContainer;
