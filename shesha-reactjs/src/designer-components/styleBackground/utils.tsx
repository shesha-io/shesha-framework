import React from "react";
import { BgColorsOutlined, DatabaseOutlined, FormatPainterOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
import { IBackgroundValue } from "./interfaces";


export const toBase64 = file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});


export const getBackgroundStyle = async (input?: IBackgroundValue, url?: string): Promise<React.CSSProperties> => {

    if (!input) return {};
    const style: React.CSSProperties = {};

    if (input.type === 'color') {
        style.backgroundColor = input.color;
    } else if (input.type === 'gradient') {
        const colors = input?.gradient?.colors || [];
        style.backgroundImage = `linear-gradient(${input.gradient?.direction || 'to right'}, ${Object.values(colors).filter(color => color !== undefined && color !== '').join(', ')})`;
    } else if (input.type === 'url') {
        style.backgroundImage = `url(${input.url})`;
    } else if (input.type === 'upload') {
        style.backgroundImage = `url(${input?.file?.file})`;
    } else if (input.type === 'storedFile') {
        style.backgroundImage = `url(${url})`;
    }


    if (input.size) {
        style.backgroundSize = input.size;
    }

    if (input.position) {
        style.backgroundPosition = input.position;
    }

    if (input.repeat) {
        style.backgroundRepeat = input.repeat;
    }

    return style;
};

export const gradientDirectionOptions = [
    { value: 'to right', label: 'To Right' },
    { value: 'to left', label: 'To Left' },
    { value: 'to top', label: 'To Top' },
    { value: 'to bottom', label: 'To Bottom' },
    { value: 'to top right', label: 'To Top Right' },
    { value: 'to top left', label: 'To Top Left' },
    { value: 'to bottom right', label: 'To Bottom Right' },
    { value: 'to bottom left', label: 'To Bottom Left' },
];

export const backgroundTypeOptions = [
    { value: 'color', label: 'Background color', icon: <FormatPainterOutlined /> },
    { value: 'gradient', label: 'Gradient background', icon: <BgColorsOutlined /> },
    { value: 'url', label: 'Image url', icon: <LinkOutlined /> },
    { value: 'upload', label: 'Image upload', icon: <UploadOutlined /> },
    { value: 'storedFile', label: 'Stored File', icon: <DatabaseOutlined /> },
];

export const repeatOptions = [
    { value: 'no-repeat', label: 'No Repeat' },
    { value: 'repeat', label: 'Repeat' },
    { value: 'repeat-x', label: 'Repeat X' },
    { value: 'repeat-y', label: 'Repeat Y' },
];
