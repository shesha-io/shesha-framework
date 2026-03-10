import { ComplexProperty, ContainerRenderer } from './complexProperty';
import { EntityProperty } from './entityProperty';
import { GenericEntityProperty } from './genericEntityProperty';
import { JsonProperty } from './jsonProperty';
import React, { FC } from 'react';
import { DataTypes } from '@/interfaces/dataTypes';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { SimpleProperty } from './simpleProperty';
import { ItemChangeDetails } from '@/components/listEditor';

export interface IItemProps {
  itemProps: IModelItem;
  index: number[];
  onChange: (newValue: IModelItem, changeDetails: ItemChangeDetails) => void;
  containerRendering: ContainerRenderer;
}

export const Item: FC<IItemProps> = ({ itemProps, index, containerRendering, onChange }) => {
  if (itemProps.dataType === DataTypes.object || itemProps.dataType === DataTypes.array) {
    return (
      <ComplexProperty
        index={index}
        data={itemProps}
        containerRendering={containerRendering}
        onChange={onChange}
        key={itemProps.id}
      />
    );
  } else if (itemProps.dataType === DataTypes.object) {
    return (
      <JsonProperty
        id={index}
        index={index}
        {...itemProps}
        key={itemProps.id}
      />
    );
  } else if (itemProps.dataType === DataTypes.entityReference && !itemProps.entityType) {
    return (
      <GenericEntityProperty
        id={index}
        index={index}
        {...itemProps}
        key={itemProps.id}
      />
    );
  } else if (itemProps.dataType === DataTypes.entityReference && itemProps.entityType) {
    return (
      <EntityProperty
        id={index}
        index={index}
        {...itemProps}
        key={itemProps.id}
      />
    );
  } else {
    return (
      <SimpleProperty
        id={index}
        index={index}
        {...itemProps}
        key={itemProps.id}
      />
    );
  }
};
