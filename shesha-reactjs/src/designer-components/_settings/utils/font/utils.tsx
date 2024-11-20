import React from 'react';
import { IFontValue } from './interfaces';

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
    { value: 'impact', label: 'Impact' }
];

export const fontWeights = [
    { value: '100', label: 'sectionSeparator' },
    { value: '400', label: 'sectionSeparator' },
    { value: '500', label: 'sectionSeparator' },
    { value: '700', label: 'sectionSeparator' },
    { value: '900', label: 'sectionSeparator' },
]

export const textAlign = [
    { value: 'left', label: 'AlignLeftOutlined' },
    { value: 'center', label: 'AlignCenterOutlined' },
    { value: 'right', label: 'AlignRightOutlined' },
]