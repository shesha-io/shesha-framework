import React from 'react';
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined } from "@ant-design/icons";
import { IFontValue } from './interfaces';

export const fontTypes = [
    { value: 'Arial', title: 'Arial' },
    { value: 'Helvetica', title: 'Helvetica' },
    { value: 'Times New Roman', title: 'Times New Roman' },
    { value: 'Courier New', title: 'Courier New' },
    { value: 'Verdana', title: 'Verdana' },
    { value: 'Georgia', title: 'Georgia' },
    { value: 'Palatino', title: 'Palatino' },
    { value: 'Garamond', title: 'Garamond' },
    { value: 'Comic Sans MS', title: 'Comic Sans MS' },
    { value: 'Trebuchet MS', title: 'Trebuchet MS' },
    { value: 'Arial Black', title: 'Arial Black' },
    { value: 'impact', title: 'Impact' },
];

export const fontWeights = [
    { value: 100, title: 'thin' },
    { value: 200, title: 'extra-light' },
    { value: 300, title: 'light' },
    { value: 400, title: 'normal' },
    { value: 500, title: 'medium' },
    { value: 600, title: 'semi-bold' },
    { value: 700, title: 'bold' },
    { value: 800, title: 'extra-bold' },
    { value: 900, title: 'black' },
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