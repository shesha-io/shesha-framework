import React, { FC } from 'react';
import { getActualModel, useAvailableConstantsData } from '@/providers/form/utils';
import { IConfigurableItemBase, IConfigurableItemGroup } from '@/providers/itemListConfigurator/contexts';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { ListItem } from './listItem';
import { ListItemsGroup } from './listItemsGroup';
import { useItemListConfigurator } from '@/providers';
import { useDeepCompareMemo } from '@/hooks';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IItemListContainerProps {
  index?: number[];
  id?: string;
  items: IConfigurableItemBase[];
}

export const ItemListContainer: FC<IItemListContainerProps> = ({ index, id, items }) => {
  const { updateChildItems } = useItemListConfigurator();
  const { styles } = useStyles();
  const allData = useAvailableConstantsData();

  const actualItems = useDeepCompareMemo(() =>
    items.map((item) => getActualModel(item, allData))
    , [items, allData.contexts.lastUpdate, allData.data, allData.formMode, allData.globalState, allData.selectedRow]);


  const renderItem = (item: IConfigurableItemBase, localIndex: number) => {
    switch (item?.itemType) {
      case 'item':
        const itemProps = item as IConfigurableItemBase;
        return <ListItem title={''} index={[...index, localIndex]} {...itemProps} key={localIndex}/>;

      case 'group':
        const groupProps = item as IConfigurableItemGroup;
        return (
          <ListItemsGroup
            {...groupProps}
            index={[...index, localIndex]}
            containerRendering={(args) => (<ItemListContainer {...args} />)}
            key={localIndex}
          />);
      default:
        return null;
    }
  };

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newChildren = newState.map<IConfigurableItemBase>(item => item as IConfigurableItemBase);

      updateChildItems({ index: index, id: id, children: newChildren });
    }

    return;
  };

  return (
    <ReactSortable
      list={items}
      setList={onSetList}
      fallbackOnBody={true}
      swapThreshold={0.5}
      group={{
        name: 'buttonGroupItems',
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
      {actualItems?.map((item, localIndex) => renderItem(item, localIndex))}
    </ReactSortable>
  );
};
export default ItemListContainer;
