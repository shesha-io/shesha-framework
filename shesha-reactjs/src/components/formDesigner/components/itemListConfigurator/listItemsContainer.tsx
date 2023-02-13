import React, { FC } from 'react';
import { ListItem } from './listItem';
import { ListItemsGroup } from './listItemsGroup';
import { ReactSortable, ItemInterface } from 'react-sortablejs';
import { useItemListConfigurator } from '../../../..';
import { IConfigurableItemBase, IConfigurableItemGroup } from '../../../../providers/itemListConfigurator/contexts';

export interface IItemListContainerProps {
  index?: number[];
  id?: string;
  items: IConfigurableItemBase[];
}

export const ItemListContainer: FC<IItemListContainerProps> = ({ index, id, items }) => {
  const { updateChildItems } = useItemListConfigurator();

  const renderItem = (item: IConfigurableItemBase, localIndex: number) => {
    switch (item?.itemType) {

      
      case 'item':
        const itemProps = item as IConfigurableItemBase;
        return <ListItem title={''} key={localIndex} index={[...index, localIndex]} {...itemProps} />;

      case 'group':
        const groupProps = item as IConfigurableItemGroup;
        return <ListItemsGroup key={localIndex} {...groupProps} index={[...index, localIndex]} />;
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
      draggable=".sha-button-group-item"
      animation={75}
      ghostClass="sha-button-group-item-ghost"
      emptyInsertThreshold={20}
      handle=".sha-button-group-item-drag-handle"
      scroll={true}
      bubbleScroll={true}
    >
      {items?.map((item, localIndex) => renderItem(item, localIndex))}
    </ReactSortable>
  );
};
export default ItemListContainer;
