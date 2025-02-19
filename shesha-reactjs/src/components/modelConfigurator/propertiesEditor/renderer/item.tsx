import ComplexProperty, { ContainerRenderer } from './complexProperty';
import EntityProperty from './entityProperty';
import GenericEntityProperty from './genericEntityProperty';
import JsonProperty from './jsonProperty';
import React, { FC } from 'react';
import { DataTypes } from '@/interfaces/dataTypes';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { SimpleProperty } from './simpleProperty';
import ArrayEntityProperty from './arrayEntityProperty';

export interface IItemProps {
    itemProps: IModelItem;
    index: number[];
    key: string;
    containerRendering: ContainerRenderer;
}

export const Item: FC<IItemProps> = ({ itemProps, index, key, containerRendering }) => {
    if (itemProps.dataType === DataTypes.object 
      || (itemProps.dataType === DataTypes.array && itemProps.dataFormat === DataTypes.object)) {
        return <ComplexProperty
            id={index}
            index={index}
            {...itemProps}
            key={key}
            containerRendering={containerRendering}
        />;
    } else if (itemProps.dataType === DataTypes.array && itemProps.dataFormat === DataTypes.entityReference) {
        return <ArrayEntityProperty
            id={index}
            index={index}
            {...itemProps}
            key={key}
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