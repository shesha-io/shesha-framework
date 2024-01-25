import ComplexProperty, { ContainerRenderer } from './complexProperty';
import EntityProperty from './entityProperty';
import GenericEntityProperty from './genericEntityProperty';
import JsonProperty from './jsonProperty';
import React, { FC } from 'react';
import { DataTypes } from '@/interfaces/dataTypes';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { SimpleProperty } from './simpleProperty';
import { usePropertiesEditor } from '../provider';
import { useStyles } from '@/designer-components/_common/styles/listConfiguratorStyles';

export interface IItemsContainerProps {
  index?: number[];
  items: IModelItem[];
}

const renderItem = (itemProps: IModelItem, index: number[], key: string, containerRendering: ContainerRenderer) => {
  if (itemProps.dataType === DataTypes.object || itemProps.dataType === DataTypes.array) {
    return <ComplexProperty
      id={index}
      index={index}
      {...itemProps}
      key={key}
      containerRendering={containerRendering}
    />;
  } else if (itemProps.dataType === DataTypes.objectReference) {
    return <JsonProperty
      id={index}
      index={index}
      {...itemProps}
      key={key}
    />;
  } else if (itemProps.dataType === DataTypes.entityReference && !itemProps.entityType) {
    return <GenericEntityProperty
      id={index}
      index={index}
      {...itemProps}
      key={key}
    />;
  } else if (itemProps.dataType === DataTypes.entityReference && itemProps.entityType) {
    return <EntityProperty
      id={index}
      index={index}
      {...itemProps}
      key={key}
    />;
  } else {
    return <SimpleProperty
      id={index}
      index={index}
      {...itemProps}
      key={key}
    />;
  }
};

export const ItemsContainer: FC<IItemsContainerProps> = props => {
  const { updateChildItems } = usePropertiesEditor();
  const { styles } = useStyles();

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
      {props.items.map((item, index) => renderItem(item, [...props.index, index], item?.id, (args) => (<ItemsContainer {...args} />)))}
    </ReactSortable>
  );
};
export default ItemsContainer;
