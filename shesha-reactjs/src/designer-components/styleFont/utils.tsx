import React from 'react';
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from "@ant-design/icons";
import { IFontValue } from './interfaces';

export const fontTypes = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Palatino', label: 'Palatino' },
    { value: 'monospace', label: 'Monospace' },
    { value: 'Garamond', label: 'Garamond' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Arial Black', label: 'Arial Black' },
    { value: 'impact', label: 'Impact' },
];

export const fontWeights = [
    { value: '100', label: '100 - thin' },
    { value: '200', label: '200 - extra-light' },
    { value: '300', label: '300 - light' },
    { value: '400', label: '400 - normal' },
    { value: '500', label: '500 - medium' },
    { value: '600', label: '600 - semi-bold' },
    { value: '700', label: '700 - bold' },
    { value: '800', label: '800 - extra-bold' },
    { value: '900', label: '900 - black' },
];


export const alignOptions = [
    { value: 'left', icon: <AlignLeftOutlined />, title: 'Left' },
    { value: 'center', icon: <AlignCenterOutlined />, title: 'Center' },
    { value: 'right', icon: <AlignRightOutlined />, title: 'Right' },
];

export const getFontStyle = (input?: IFontValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};

    if (input.size) {
        const size = input.size;
        if (size) {
            style.fontSize = size + 'px';
        }
    }

    if (input.type) {
        style.fontFamily = input.type;
    }

    if (input.weight) {
        style.fontWeight = input.weight;
    }

    if (input.color) {
        style.color = input.color;
    }

    if (input.align) {
        style.textAlign = input.align;
    }

    if (input.transform) {
        style.transform = input.transform;
    }

    return style;
};