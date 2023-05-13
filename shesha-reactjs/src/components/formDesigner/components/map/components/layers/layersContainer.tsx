import React, { FC } from 'react';
import { ReactSortable, ItemInterface } from 'react-sortablejs';
import { useLayerGroupConfigurator } from 'providers/layersConfigurator';
import { LayerGroupItemProps } from 'providers/layersConfigurator/models';
import LayerItem from './layerItem';

export interface ILayerItemsContainerProps {
  index?: number[];
  id?: string;
  items: LayerGroupItemProps[];
  onConfigClick?: (selectedItemId: string) => void;
  readOnly?: boolean;
}

export const LayerItemsContainer: FC<ILayerItemsContainerProps> = (props) => {
  const { readOnly, updateChildItems } = useLayerGroupConfigurator();

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged) {
      const newChilds = newState.map<LayerGroupItemProps>((item) => item as LayerGroupItemProps);
      updateChildItems({ index: props.index, childs: newChilds });
    }

    return;
  };

  return (
    <ReactSortable
      disabled={readOnly}
      list={props.items}
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
      {props.items.map((item, index) => (
        <LayerItem index={[index]} key={index} {...item} onConfigClick={props.onConfigClick} />
      ))}
    </ReactSortable>
  );
};
export default LayerItemsContainer;
