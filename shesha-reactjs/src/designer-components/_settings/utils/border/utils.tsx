import React from "react";

import { IBorderValue } from "./interfaces";
import {
    ExpandOutlined,
    RadiusUpleftOutlined,
    RadiusUprightOutlined,
    RadiusBottomleftOutlined,
    RadiusBottomrightOutlined,
    MinusOutlined,
    DashOutlined,
    SmallDashOutlined,
    CloseOutlined
} from "@ant-design/icons";
import { IDropdownOption } from "../background/interfaces";
import { addPx } from "../../utils";
import { nanoid } from "@/utils/uuid";

export const getBorderStyle = (input: IBorderValue, jsStyle: React.CSSProperties): React.CSSProperties => {
    if (!input || jsStyle?.border) return {};

    const style: React.CSSProperties = {};

    // Handle border
    const { all, top, right, bottom, left } = input?.border;

    const handleBorderPart = (part, prefix: string) => {
        if (part?.width && !jsStyle?.[prefix] && !jsStyle?.[`${prefix}Width`]) style[`${prefix}Width`] = input?.hideBorder ? 0 : addPx(part.width) || 0;
        if (part?.style && !jsStyle?.[prefix] && !jsStyle?.[`${prefix}Style`]) style[`${prefix}Style`] = part.style || 'solid';
        if (part?.color && !jsStyle?.[prefix] && !jsStyle?.[`${prefix}Color`]) style[`${prefix}Color`] = part.color || 'black';
    };

    handleBorderPart(all, 'border');
    handleBorderPart(top, 'borderTop');
    handleBorderPart(right, 'borderRight');
    handleBorderPart(bottom, 'borderBottom');
    handleBorderPart(left, 'borderLeft');

    // Handle border radius
    if (input?.radius) {
        const { all, topLeft, topRight, bottomLeft, bottomRight } = input?.radius;
        style.borderRadius = `${all}px`;
        style.borderRadius = `${topLeft || all || 8}px ${topRight || all || 8}px ${bottomRight || all || 8}px ${bottomLeft || all || 8}px`;
    }

    return style;
};

export const borderStyles: IDropdownOption[] = [
    { value: 'solid', label: <MinusOutlined /> },
    { value: 'dashed', label: <DashOutlined /> },
    { value: 'dotted', label: <SmallDashOutlined /> },
    { value: 'none', label: <CloseOutlined /> }
];

export const radiusCorners: IDropdownOption[] = [
    { value: 'all', label: <ExpandOutlined /> },
    { value: 'topLeft', label: <RadiusUpleftOutlined /> },
    { value: 'topRight', label: <RadiusUprightOutlined /> },
    { value: 'bottomLeft', label: <RadiusBottomleftOutlined /> },
    { value: 'bottomRight', label: <RadiusBottomrightOutlined /> }
];

export const borderSides = [
    {
        value: "all",
        icon: "BorderOutlined",
        title: "All"
    },
    {
        value: "top",
        icon: "BorderTopOutlined",
        title: "Top"
    },
    {
        value: "right",
        icon: "BorderRightOutlined",
        title: "Right"
    },
    {
        value: "bottom",
        icon: "BorderBottomOutlined",
        title: "Bottom"
    },
    {
        value: "left",
        icon: "BorderLeftOutlined",
        title: "Left"
    }
];

export const borderCorners = [
    {
        value: "all",
        icon: "ExpandOutlined",
        title: "All"
    },
    {
        value: "topLeft",
        icon: "RadiusUpleftOutlined",
        title: "Top Left"
    },
    {
        value: "topRight",
        icon: "RadiusUprightOutlined",
        title: "Top Right"
    },
    {
        value: "bottomLeft",
        icon: "RadiusBottomleftOutlined",
        title: "Bottom Left"
    },
    {
        value: "bottomRight",
        icon: "RadiusBottomrightOutlined",
        title: "Bottom Right"
    }
];

export const getBorderInputs = (isResponsive: boolean = true, path = '') => borderSides.map(value => {
    const side = value.value;
    const code = isResponsive ? 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]' + `${path ? '?.' + path : ''}` + '?.border?.selectedSide)' + `!== "${side}"` +
        ' || getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]' + `${path ? '?.' + path : ''}` + '?.border?.hideBorder);'
        : 'return  getSettingValue(data?' + `${path ? '.' + path : ''}` + '.border?.selectedSide)' + `!== "${side}"` + ' || getSettingValue(data' + `${path ? '?.' + path : ''}` + '?.border?.hideBorder);';

    return {
        id: nanoid(),
        parentId: 'borderStylePnl',
        inline: true,
        readOnly: false,
        hidden: { _code: code, _mode: 'code', _value: false } as any,
        inputs: [
            {
                label: "Border",
                hideLabel: true,
                type: "button",
                propertyName: path ? `${path}.border.hideBorder` : "border.hideBorder",
                icon: "EyeOutlined",
                iconAlt: "EyeInvisibleOutlined",
                tooltip: "Select a border side to which the style will be applied",
            },
            {
                label: "Select Side",
                hideLabel: true,
                propertyName: path ? `${path}.border.selectedSide` : "border.selectedSide",
                type: "radio",
                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                buttonGroupOptions: borderSides
            },
            {
                type: 'text',
                label: "Width",
                hideLabel: true,
                propertyName: path ? `${path}.border.border.${side}.width` : `border.border.${side}.width`,
            },
            {
                label: "Style",
                propertyName: path ? `${path}.border.border.${side}.style` : `border.border.${side}.style`,
                type: "dropdown",
                hideLabel: true,
                width: 60,
                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                dropdownOptions: borderStyles,
            },
            {
                label: `Color ${side}`,
                propertyName: path ? `${path}.border.border.${side}.color` : `border.border.${side}.color`,
                type: "color",
                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                hideLabel: true,
            }
        ]
    };
});

export const getCornerInputs = (isResponsive: boolean = true, path = '') => radiusCorners.map(value => {
    const corner = value.value;
    const code = isResponsive ? 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]' + `${path ? '?.' + path : ''}` + '?.border?.selectedCorner)' + `!== "${corner}"`
        : 'return  getSettingValue(data?' + `${path ? '.' + path : ''}` + '.border?.seclectedCorner)' + `!== "${corner}"`;

    return {
        id: nanoid(),
        parentId: 'borderStylePnl',
        inline: true,
        readOnly: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]' + `${path ? '?.' + path : ''}` + '?.border?.hideBorder);', _mode: 'code', _value: false } as any,
        hidden: { _code: code, _mode: 'code', _value: false } as any,
        inputs: [
            {
                id: "corner-selector",
                label: "Corner Radius",
                propertyName: path ? `${path}.border.selectedCorner` : "border.selectedCorner",
                type: "radio",
                defaultValue: "all",
                tooltip: "Select a corner to which the radius will be applied",
                buttonGroupOptions: borderCorners,
            },
            {
                id: `borderRadiusStyleRow-${corner}`,
                parentId: "borderStylePnl",
                label: "Corner Radius",
                hideLabel: true,
                width: 65,
                defaultValue: 0,
                inputType: 'number',
                tooltip: "Select a corner to which the radius will be applied",
                propertyName: path ? `${path}.border.radius.${corner}` : `border.radius.${corner}`,
            }]
    };
});