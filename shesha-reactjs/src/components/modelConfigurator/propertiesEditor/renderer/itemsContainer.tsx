import React, { FC } from 'react';
import { SimpleProperty } from './simpleProperty';
import { usePropertiesEditor } from '../provider';
import { ReactSortable, ItemInterface } from 'react-sortablejs';
import { IModelItem } from '../../../../interfaces/modelConfigurator';
import ComplexProperty from './complexProperty';
import { DataTypes } from '../../../../interfaces/dataTypes';
import JsonProperty from './jsonProperty';
import GenericEntityProperty from './genericEntityProperty';
import EntityProperty from './entityProperty';

export interface IToolbarItemsSortableProps {
  index?: number[];
  items: IModelItem[];
}

export const ItemsContainer: FC<IToolbarItemsSortableProps> = props => {
  const { updateChildItems } = usePropertiesEditor();

  const renderItem = (itemProps: IModelItem, index: number, key: string) => {
    if (itemProps.dataType === DataTypes.object || itemProps.dataType === DataTypes.array) {
      return <ComplexProperty id={index} index={[...props.index, index]} {...itemProps} key={key} />;
    } else if (itemProps.dataType === DataTypes.objectReference) {
      return <JsonProperty id={index} index={[...props.index, index]} {...itemProps} key={key} />;
    } else if (itemProps.dataType === DataTypes.entityReference && !itemProps.entityType) {
      return <GenericEntityProperty id={index} index={[...props.index, index]} {...itemProps} key={key} />;
    } else if (itemProps.dataType === DataTypes.entityReference && itemProps.entityType) {
      return <EntityProperty id={index} index={[...props.index, index]} {...itemProps} key={key} />;
    } else {
      return <SimpleProperty id={index} index={[...props.index, index]} {...itemProps} key={key} />;
    }
  };

  const onSetList = (newState: ItemInterface[]) => {
    // temporary commented out, the behavoiur of the sortablejs differs sometimes
    const listChanged = true; //!newState.some(item => item.chosen !== null && item.chosen !== undefined);

    if (listChanged && newState?.length) {
      const newChilds = newState.map<IModelItem>(item => item as any);
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
export default ItemsContainer;
