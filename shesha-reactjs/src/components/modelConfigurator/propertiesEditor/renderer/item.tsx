import ComplexProperty from './complexProperty';
import React, { FC } from 'react';
import { ArrayFormats, DataTypes, ObjectFormats } from '@/interfaces/dataTypes';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { SimpleProperty } from './simpleProperty';
import ArrayEntityProperty from './arrayEntityProperty';
import { ItemChangeDetails } from '@/components/listEditor';
import ArraySimpleProperty from './arraySimpleProperty';
import ArrayObjectProperty from './arrayObjectProperty';
import { ContainerRenderer } from './itemsContainer';

export interface IItemProps {
  itemProps: IModelItem;
  parent?: IModelItem;
  index: number[];
  key: string;
  onChange?: (newValue: IModelItem, changeDetails: ItemChangeDetails) => void;
  containerRendering: ContainerRenderer;
}

export const Item: FC<IItemProps> = ({ itemProps, index, key, parent, containerRendering, onChange }) => {
  const itemsType = itemProps.properties?.find((p) => p.isItemsType);

  if (itemProps.dataType === DataTypes.array && itemProps.dataFormat === ArrayFormats.childObjects && itemsType?.dataFormat === ObjectFormats.object) {
    return (
      <ArrayObjectProperty
        index={index}
        data={itemProps}
        parent={parent}
        key={key}
        onChange={onChange}
        containerRendering={containerRendering}
      />
    );
  } else if (itemProps.dataType === DataTypes.array && (
    itemProps.dataFormat === ArrayFormats.entityReference ||
    itemProps.dataFormat === ArrayFormats.manyToManyEntities ||
    (itemProps.dataFormat === ArrayFormats.childObjects && itemsType?.dataFormat === ObjectFormats.interface)
  )) {
    return (
      <ArrayEntityProperty
        id={index}
        index={index}
        {...itemProps}
        parent={parent}
        key={key}
      />
    );
  } else if (itemProps.dataType === DataTypes.array && itemProps.dataFormat) {
    return (
      <ArraySimpleProperty
        id={index}
        index={index}
        {...itemProps}
        parent={parent}
        key={key}
      />
    );
  } else if (itemProps.dataType === DataTypes.object && itemProps.dataFormat === ObjectFormats.object) {
    return (
      <ComplexProperty
        index={index}
        data={itemProps}
        {...itemProps}
        parent={parent}
        key={key}
        onChange={onChange}
        containerRendering={containerRendering}
      />
    );
  } else {
    return (
      <SimpleProperty
        id={index}
        index={index}
        {...itemProps}
        parent={parent}
        key={key}
      />
    );
  }
};
