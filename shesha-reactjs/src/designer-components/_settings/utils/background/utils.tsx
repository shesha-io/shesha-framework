import React from "react";
import { IBackgroundValue, IDropdownOption, IRadioOption } from "./interfaces";


export const toBase64 = file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

export const getBackgroundImageUrl = async (propertyName: IBackgroundValue, backendUrl: string, httpHeaders: any) => {
    return (
        propertyName?.storedFile?.id && propertyName?.type === 'storedFile'
            ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${propertyName?.storedFile?.id}`, {
                headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' },
            })
                .then((response) => {
                    return response.blob();
                })
                .then((blob) => {
                    return URL.createObjectURL(blob);
                })
            : ''
    );
};

export const getBackgroundStyle = (input: IBackgroundValue, jsStyle: React.CSSProperties, url?: string): React.CSSProperties => {

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
        const colorsString = Object.values(colors).filter(color => color !== undefined && color !== '').join(', ');
        style.backgroundImage = `linear-gradient(${input?.gradient?.direction || 'to right'}, ${colorsString})`;
    } else if (input?.type === 'url') {
        style.backgroundImage = `url(${input?.url})`;
    } else if (input?.type === 'image') {
        style.backgroundImage = `url(${input?.uploadFile})`;
    } else if (input?.type === 'storedFile') {
        style.backgroundImage = `url(${url})`;
    }

    return style;
};

export const gradientDirectionOptions: IDropdownOption[] = [
    { value: 'to right', label: 'To right' },
    { value: 'to left', label: 'To left' },
    { value: 'to top', label: 'To top' },
    { value: 'to bottom', label: 'To bottom' },
    { value: 'to top right', label: 'To top right' },
    { value: 'to top left', label: 'To top left' },
    { value: 'to bottom right', label: 'To bottom right' },
    { value: 'to bottom left', label: 'To bottom left' },
];

export const backgroundTypeOptions: IRadioOption[] = [
    {
        value: "color",
        icon: "FormatPainterOutlined",
        title: "Color"
    },
    {
        value: "gradient",
        icon: "BgColorsOutlined",
        title: "Gradient"
    },
    {
        value: "image",
        icon: "PictureOutlined",
        title: "Image"
    },
    {
        value: "url",
        icon: "LinkOutlined",
        title: "URL"
    },
    {
        value: "storedFile",
        icon: "DatabaseOutlined",
        title: "Stored File"
    },
];

export const repeatOptions: IRadioOption[] = [
    { value: 'no-repeat', title: 'No Repeat', icon: 'noRepeatIcon' },
    { value: 'repeat', title: 'Repeat', icon: 'repeatIcon' },
    { value: 'repeat-x', title: 'Repeat X', icon: 'repeatXIcon' },
    { value: 'repeat-y', title: 'Repeat Y', icon: 'repeatYIcon' },
];

export const sizeOptions: IDropdownOption[] = [{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'auto', label: 'Auto' }];

export const positionOptions: IDropdownOption[] = [
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'top left', label: 'Top left' },
    { value: 'top right', label: 'Top right' },
    { value: 'bottom left', label: 'Bottom left' },
    { value: 'bottom right', label: 'Bottom right' }];

