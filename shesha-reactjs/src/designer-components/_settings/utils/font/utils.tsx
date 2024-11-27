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
        style.fontWeight = input.weight.split(' - ')[0];
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
    { value: 'Segoe UI', label: 'Segoe UI' },
    { value: 'Palatino', label: 'Palatino' },
    { value: 'monospace', label: 'Monospace' },
    { value: 'Garamond', label: 'Garamond' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Arial Black', label: 'Arial Black' },
    { value: 'Impact', label: 'Impact' },
    { value: '-apple-system', label: 'San Francisco' },
    { value: 'BlinkMacSystemFont', label: 'BlinkMac System Font' },
    { value: 'SF Mono', label: 'San Francisco Mono' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' }, 
    { value: 'Ubuntu', label: 'Ubuntu' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'PT Sans', label: 'PT Sans' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Fira Sans', label: 'Fira Sans' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Noto Sans', label: 'Noto Sans' },
    { value: 'Droid Sans', label: 'Droid Sans' },
    { value: 'Crimson Text', label: 'Crimson Text' },
    { value: 'PT Serif', label: 'PT Serif' }
];


export const fontWeights = [
    { value: '100', label: 'sectionSeparator' },
    { value: '400', label: 'sectionSeparator' },
    { value: '500', label: 'sectionSeparator' },
    { value: '700', label: 'sectionSeparator' },
    { value: '900', label: 'sectionSeparator' },
];

export const textAlign = [
    { value: 'left', label: 'AlignLeftOutlined' },
    { value: 'center', label: 'AlignCenterOutlined' },
    { value: 'right', label: 'AlignRightOutlined' },
];