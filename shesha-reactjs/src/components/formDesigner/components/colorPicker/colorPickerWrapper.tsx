import ColorPicker from '@/components/colorPicker';
import React, { FC } from 'react';
import { ColorResult } from 'react-color';

export interface IColorPickerWrapperProps {
    value?: ColorResult;
    onChange?: (color: ColorResult) => void;
    title?: string;
    color?: ColorResult;
}

export const ColorPickerWrapper: FC<IColorPickerWrapperProps> = ({ value, ...props }) => {
    return <ColorPicker {...props} color={value} />;
};