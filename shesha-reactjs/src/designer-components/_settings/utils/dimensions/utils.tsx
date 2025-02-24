import React from "react";
import { EyeOutlined, EyeInvisibleOutlined, ColumnWidthOutlined, BorderlessTableOutlined } from "@ant-design/icons";
import { IDimensionsValue } from "./interfaces";

export const getSizeStyle = (input: IDimensionsValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};
    const sizeProperties: (keyof IDimensionsValue)[] = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'];

    sizeProperties.forEach(prop => {
        const sizeValue = input[prop];

        if (sizeValue) {
            style[prop] = /^\d+(\.\d+)?$/.test(sizeValue + '') ? `${sizeValue}px` : `${sizeValue}`;
        }

        if (sizeValue) {
            style[prop] = /^\d+(\.\d+)?$/.test(sizeValue + '') ? `${sizeValue}px` : `${sizeValue}`;
        }
    });

    if (input?.overflow) {
        style.overflow = input?.overflow;
    };

    return style;
};

export const overflowOptions = [
    { value: "visible", label: "Visible", icon: <EyeOutlined /> },
    { value: "hidden", label: "Hidden", icon: <EyeInvisibleOutlined /> },
    { value: "scroll", label: "Scroll", icon: <ColumnWidthOutlined /> },
    { value: "auto", label: "Auto", icon: <BorderlessTableOutlined /> },
];
