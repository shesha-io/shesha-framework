import ComplexProperty, { ContainerRenderer } from './complexProperty';
import React, { FC } from 'react';
import { DataTypes } from '@/interfaces/dataTypes';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { SimpleProperty } from './simpleProperty';
import ArrayEntityProperty from './arrayEntityProperty';
import { ItemChangeDetails } from '@/components/listEditor';
import ArrayProperty from './arrayProperty';

export interface IItemProps {
    itemProps: IModelItem;
    index: number[];
    key: string;
    onChange?: (newValue: IModelItem, changeDetails: ItemChangeDetails) => void;
    containerRendering: ContainerRenderer;
}

export const Item: FC<IItemProps> = ({ itemProps, index, key, containerRendering, onChange }) => {
    if (itemProps.dataType === DataTypes.array && itemProps.dataFormat === DataTypes.object) {
        return <ArrayProperty
            index={index}
            data={itemProps}
            {...itemProps}
            key={key}
            onChange={onChange}
            containerRendering={containerRendering}
        />;
    } else if (itemProps.dataType === DataTypes.object) {
        return <ComplexProperty
            index={index}
            data={itemProps}
            {...itemProps}
            key={key}
            onChange={onChange}
            containerRendering={containerRendering}
        />;
    } else if (itemProps.dataType === DataTypes.array && itemProps.dataFormat === DataTypes.entityReference) {
        return <ArrayEntityProperty
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