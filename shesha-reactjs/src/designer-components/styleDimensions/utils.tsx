import React from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";

export const getSizeStyle = (input?: IDimensionsValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};
    const sizeProperties: (keyof IDimensionsValue)[] = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'];

    sizeProperties.forEach(prop => {
        const sizeValue = input[prop];
        if (sizeValue && typeof sizeValue === 'object') {
            const { value, unit } = sizeValue;
            if (value) {
                style[prop] = /^\d+(\.\d+)?$/.test(value as string) ? `${value}${unit ?? 'px'}` : `${value}`;
            }
        }
    });

    if (input.overflow) {
        style.overflow = input.overflow;
    };

    return style;
};

export const overflowOptions = [
    { value: "visible", title: "Visible", icon: <EyeOutlined /> },
    { value: "hidden", title: "Hidden", icon: <EyeInvisibleOutlined /> },
    { value: "scroll", title: "Scroll", icon: <ColumnWidthOutlined /> },
    { value: "auto", title: "Auto", icon: <BorderlessTableOutlined /> }
];
