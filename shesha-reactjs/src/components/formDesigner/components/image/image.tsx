import React, { FC } from 'react';
import { Image } from 'antd';

export enum ImageStorageFormat {
    url = 'url',
    storedFile = 'stored-file',
    base64 = 'base64',
}
export interface IImageFieldProps {
    storageFormat: ImageStorageFormat;
    value?: string;
    onChange?: (newValue: string) => void;
    readOnly: boolean;

    height?: string | number;
    width?: string | number;
}

export const ImageField: FC<IImageFieldProps> = (props) => {
    const { value, height, width } = props;
    return (
        <Image
            src={value}
            height={height}
            width={width}
        />
    );
};