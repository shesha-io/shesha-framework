import React from "react";
import { BgColorsOutlined, DatabaseOutlined, FormatPainterOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
import { IBackgroundValue } from "./interfaces";

export const toBase64 = file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

export const getBackgroundStyle = async (input?: IBackgroundValue): Promise<React.CSSProperties> => {
    if (!input) return {};
    const style: React.CSSProperties = {};

    if (input.type === 'color') {
        style.backgroundColor = input.color;
    } else if (input.type === 'gradient') {
        const colors = input.gradient?.colors || [];
        style.backgroundImage = `linear-gradient(${input.gradient?.direction || 'to right'}, ${colors.join(', ')})`;
    } else if (input.type === 'url') {
        style.backgroundImage = `url(${input.url})`;
    } else if (input.type === 'upload') {
        style.backgroundImage = `url(${input.file})`;
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
    { value: 'to right', title: 'To Right' },
    { value: 'to left', title: 'To Left' },
    { value: 'to top', title: 'To Top' },
    { value: 'to bottom', title: 'To Bottom' },
    { value: 'to top right', title: 'To Top Right' },
    { value: 'to top left', title: 'To Top Left' },
    { value: 'to bottom right', title: 'To Bottom Right' },
    { value: 'to bottom left', title: 'To Bottom Left' },
];

export const backgroundTypeOptions = [
    { value: 'color', title: 'Background color', icon: <FormatPainterOutlined /> },
    { value: 'gradient', title: 'Gradient background', icon: <BgColorsOutlined /> },
    { value: 'url', title: 'Image url', icon: <LinkOutlined /> },
    { value: 'upload', title: 'Image upload', icon: <UploadOutlined /> },
    { value: 'storedFile', title: 'Stored File', icon: <DatabaseOutlined /> },
];