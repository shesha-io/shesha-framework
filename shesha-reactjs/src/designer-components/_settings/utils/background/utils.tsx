import React from "react";
import { BgColorsOutlined, DatabaseOutlined, FormatPainterOutlined, InsertRowBelowOutlined, InsertRowLeftOutlined, LinkOutlined, PicCenterOutlined, TableOutlined, UploadOutlined } from "@ant-design/icons";
import { IBackgroundValue, IDropdownOption, IRadioOption } from "./interfaces";


export const toBase64 = file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

export const getBackgroundStyle = async (input: IBackgroundValue, jsStyle: React.CSSProperties, url?: string): Promise<React.CSSProperties> => {

    const style: React.CSSProperties = {};

    if (input?.size) {
        style.backgroundSize = input?.size;
    }

    if (input?.position) {
        style.backgroundPosition = input?.position;
    }

    if (input?.repeat) {
        style.backgroundRepeat = input?.repeat;
    }

    if (!input || jsStyle?.background || jsStyle?.backgroundColor || jsStyle?.backgroundImage) return style;

    if (input?.type === 'color') {
        style.backgroundColor = input?.color;
    } else if (input?.type === 'gradient') {
        const colors = input?.gradient?.colors || [];
        style.backgroundImage = `linear-gradient(${input?.gradient?.direction || 'to right'}, ${Object.values(colors).filter(color => color !== undefined && color !== '').join(', ')})`;
    } else if (input?.type === 'url') {
        style.backgroundImage = `url(${input?.url})`;
    } else if (input?.type === 'image') {
        style.backgroundImage = `url(${input?.uploadFile?.url})`;
    } else if (input?.type === 'storedFile') {
        style.backgroundImage = `url(${url})`;
    }

    return style;
};

export const gradientDirectionOptions: IDropdownOption[] = [
    { value: 'to right', label: 'To Right' },
    { value: 'to left', label: 'To Left' },
    { value: 'to top', label: 'To Top' },
    { value: 'to bottom', label: 'To Bottom' },
    { value: 'to top right', label: 'To Top Right' },
    { value: 'to top left', label: 'To Top Left' },
    { value: 'to bottom right', label: 'To Bottom Right' },
    { value: 'to bottom left', label: 'To Bottom Left' },
];

export const backgroundTypeOptions: IRadioOption[] = [
    { value: 'color', title: 'Background color', icon: <FormatPainterOutlined /> },
    { value: 'gradient', title: 'Gradient background', icon: <BgColorsOutlined /> },
    { value: 'url', title: 'Image url', icon: <LinkOutlined /> },
    { value: 'upload', title: 'Image upload', icon: <UploadOutlined /> },
    { value: 'storedFile', title: 'Stored File', icon: <DatabaseOutlined /> },
];

export const repeatOptions: IRadioOption[] = [
    { value: 'no-repeat', title: 'No Repeat', icon: <PicCenterOutlined /> },
    { value: 'repeat', title: 'Repeat', icon: <TableOutlined /> },
    { value: 'repeat-x', title: 'Repeat X', icon: <InsertRowBelowOutlined /> },
    { value: 'repeat-y', title: 'Repeat Y', icon: <InsertRowLeftOutlined /> },
];

export const sizeOptions: IDropdownOption[] = [{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'auto', label: 'Auto' }];

export const positionOptions: IDropdownOption[] = [{ value: 'center', label: 'Center' }, { value: 'top', label: 'Top' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'bottom', label: 'Bottom' },
{ value: 'top left', label: 'Top Left' }, { value: 'top right', label: 'Top Right' }, { value: 'bottom left', label: 'Bottom Left' }, { value: 'bottom right', label: 'Bottom Right' }];

