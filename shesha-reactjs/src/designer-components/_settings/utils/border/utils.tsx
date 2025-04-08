import React from "react";

import { IBorderValue } from "./interfaces";
import {
    MinusOutlined,
    DashOutlined,
    SmallDashOutlined,
    CloseOutlined
} from "@ant-design/icons";
import { IDropdownOption } from "../background/interfaces";
import { addPx } from "../../utils";
import { nanoid } from "@/utils/uuid";
import { DesignerToolbarSettings } from "@/interfaces/toolbarSettings";
import { IRadioOption } from "@/designer-components/settingsInput/interfaces";
import { humanizeString } from "@/utils/string";
import { IConfigurableTheme } from "@/providers";
import { readThemeColor } from "@/components/colorPicker";

export const getBorderStyle = (input: IBorderValue, jsStyle: React.CSSProperties, theme?: IConfigurableTheme): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};
    const border = input.border || {};
    const { all = {}, top = {}, right = {}, bottom = {}, left = {} } = border;

    const handleBorderPart = (part, prefix: string, theme?: IConfigurableTheme) => {
        const hideBorder = input?.border?.[part]?.style === 'none';
        if (part?.width && !jsStyle[prefix] && !jsStyle[`${prefix}Width`]) style[`${prefix}Width`] = addPx(part?.width || all?.width);
        if (part?.style && !jsStyle[prefix] && !jsStyle[`${prefix}Style`]) style[`${prefix}Style`] = hideBorder ? 'none' : part?.style || all?.style;
        if (part?.color && !jsStyle[prefix] && !jsStyle[`${prefix}Color`]) style[`${prefix}Color`] = part?.color || all?.color;

        if (theme && readThemeColor(theme)[`${input?.border?.all?.color}`]) {
            style[`borderColor`] = readThemeColor(theme)[`${input?.border?.all?.color}`];
            style[`borderWidth`] = input?.border?.all?.width;
            style[`borderStyle`] = input?.border?.all?.style;
        } else {
            if (theme && readThemeColor(theme)[`${input?.border?.bottom?.color}`]) {
                style[`borderBottomColor`] = readThemeColor(theme)[`${input?.border?.bottom?.color}`];
                style[`borderBottomWidth`] = input?.border?.bottom?.width;
                style[`borderBottomStyle`] = input?.border?.bottom?.style;
            }
            if (theme && readThemeColor(theme)[`${input?.border?.left?.color}`]) {
                style[`borderLeftColor`] = readThemeColor(theme)[`${input?.border?.left?.color}`];
                style[`borderLeftWidth`] = input?.border?.left?.width;
                style[`borderLeftStyle`] = input?.border?.left?.style;
            }
            if (theme && readThemeColor(theme)[`${input?.border?.right?.color}`]) {
                style[`borderRightColor`] = readThemeColor(theme)[`${input?.border?.right?.color}`];
                style[`borderRightWidth`] = input?.border?.right?.width;
                style[`borderRightStyle`] = input?.border?.right?.style;
            }
            if (theme && readThemeColor(theme)[`${input?.border?.top?.color}`]) {
                style[`borderTopColor`] = readThemeColor(theme)[`${input?.border?.top?.color}`];
                style[`borderTopWidth`] = input?.border?.top?.width;
                style[`borderTopStyle`] = input?.border?.top?.style;
            }
        }
    };


    if (!jsStyle.border) {
        if (input.borderType === 'all') {
            handleBorderPart(all, 'border', theme);
        } else {
            handleBorderPart(top, 'borderTop', theme);
            handleBorderPart(right, 'borderRight', theme);
            handleBorderPart(bottom, 'borderBottom', theme);
            handleBorderPart(left, 'borderLeft', theme);
        }
    };

    if (input?.radius) {
        const { all, topLeft, topRight, bottomLeft, bottomRight } = input.radius;
        if (input?.radiusType === 'all') {
            style.borderTopRightRadius = `${all || 0}px`;
            style.borderBottomRightRadius = `${all || 0}px`;
            style.borderBottomLeftRadius = `${all || 0}px`;
            style.borderTopLeftRadius = `${all || 0}px`;
        } else {
            style.borderTopRightRadius = `${topRight || 0}px`;
            style.borderBottomRightRadius = `${bottomRight || 0}px`;
            style.borderBottomLeftRadius = `${bottomLeft || 0}px`;
            style.borderTopLeftRadius = `${topLeft || 0}px`;
        }
    };

    return style;
};

export const borderStyles: IDropdownOption[] = [
    { value: 'solid', label: <MinusOutlined /> },
    { value: 'dashed', label: <DashOutlined /> },
    { value: 'dotted', label: <SmallDashOutlined /> },
    { value: 'none', label: <CloseOutlined /> }
];

export const radiusConfigType: IRadioOption[] = [
    { value: "all", icon: "ExpandOutlined", title: "All" },
    { value: "custom", icon: "RadiusUprightOutlined", title: "Custom" },
];

export const radiusCorners: IRadioOption[] = [
    { value: 'topLeft', icon: "RadiusUpleftOutlined", title: "Top Left" },
    { value: 'topRight', icon: "RadiusUprightOutlined", title: "Top Right" },
    { value: 'bottomLeft', icon: "RadiusBottomleftOutlined", title: "Bottom Left" },
    { value: 'bottomRight', icon: "RadiusBottomrightOutlined", title: "Bottom Right" }
];

export const borderConfigType: IRadioOption[] = [
    { value: "all", icon: "BorderOutlined", title: "All" },
    { value: "custom", icon: "BorderOuterOutlined", title: "Custom" },
];

export const borderSides = [
    { value: "top", icon: "BorderTopOutlined", title: "Top" },
    { value: "right", icon: "BorderRightOutlined", title: "Right" },
    { value: "bottom", icon: "BorderBottomOutlined", title: "Bottom" },
    { value: "left", icon: "BorderLeftOutlined", title: "Left" }
];


export const borderCorners = [
    { value: "all", icon: "ExpandOutlined", title: "All" },
    { value: "topLeft", icon: "RadiusUpleftOutlined", title: "Top Left" },
    { value: "topRight", icon: "RadiusUprightOutlined", title: "Top Right" },
    { value: "bottomLeft", icon: "RadiusBottomleftOutlined", title: "Bottom Left" },
    { value: "bottomRight", icon: "RadiusBottomrightOutlined", title: "Bottom Right" }
];

const generateCode = (type: string, isCustom: boolean, isResponsive: boolean, path: string) => {

    const devicePath = isResponsive ? 'data[`${contexts.canvasContext?.designerDevice || "desktop"}`]' : 'data';
    return `return getSettingValue(${devicePath}${path ? '?.' + path : ''}?.border?.${type}) !== "${isCustom ? "custom" : "all"}";`;
};

export const getBorderInputs = (path = '', isResponsive: boolean = true) => {

    const borderProp = path ? `${path}.border.border` : 'border.border';

    return [...new DesignerToolbarSettings()
        .addSettingsInput({
            id: nanoid(),
            inputType: 'radio',
            label: 'Border Type',
            propertyName: `${path ? path + '.' : ''}border.borderType`,
            buttonGroupOptions: borderConfigType,
        })
        .addSettingsInputRow({
            id: nanoid(),
            parentId: 'borderStylePnl',
            inline: true,
            readOnly: false,
            hidden: { _code: generateCode('borderType', false, isResponsive, path), _mode: 'code', _value: false } as any,
            inputs: [
                {
                    id: nanoid(),
                    type: 'tooltip',
                    label: '',
                    hideLabel: true,
                    propertyName: '',
                    icon: 'BorderOutlined',
                    width: 20,
                    tooltip: `Styles will apply to all border`,
                },
                {
                    id: nanoid(),
                    type: 'textField',
                    label: "Width",
                    hideLabel: true,
                    propertyName: `${borderProp}.all.width`,
                },
                {
                    id: nanoid(),
                    label: "Style",
                    propertyName: `${borderProp}.all.style`,
                    type: "dropdown",
                    hideLabel: true,
                    width: 60,
                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    dropdownOptions: borderStyles,
                },
                {
                    id: nanoid(),
                    label: `Color`,
                    propertyName: `${borderProp}.all.color`,
                    type: "colorPicker",
                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    hideLabel: true,
                }
            ]
        })
        .addContainer({
            id: 'borderStyleRow',
            parentId: 'borderStylePnl',
            hidden: { _code: generateCode('borderType', true, isResponsive, path), _mode: 'code', _value: false } as any,
            components: borderSides.map(sideValue => {
                const side = sideValue.value;

                return new DesignerToolbarSettings()
                    .addSettingsInputRow({
                        id: nanoid(),
                        parentId: 'borderStylePnl',
                        inline: true,
                        readOnly: false,
                        inputs: [
                            {
                                id: nanoid(),
                                type: 'tooltip',
                                label: 'Icon',
                                hideLabel: true,
                                readOnly: true,
                                width: 20,
                                value: sideValue.icon,
                                propertyName: 'bordericon',
                                icon: sideValue.icon,
                                tooltip: `Styles will apply to ${side} border`,
                            },
                            {
                                id: nanoid(),
                                type: 'textField',
                                label: "Width",
                                hideLabel: true,
                                propertyName: `${borderProp}.${side}.width`,
                            },
                            {
                                id: nanoid(),
                                label: "Style",
                                propertyName: `${borderProp}.${side}.style`,
                                type: "dropdown",
                                hideLabel: true,
                                width: 60,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                dropdownOptions: borderStyles,
                            },
                            {
                                id: nanoid(),
                                label: `Color`,
                                propertyName: `${borderProp}.${side}.color`,
                                type: "colorPicker",
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                hideLabel: true,
                            }
                        ]
                    }).toJson()[0];
            })
        }).toJson()
    ];
};

interface IHideCornerConditions {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
}

export const getCornerInputs = (path = '', isResponsive: boolean = true, hideCornerConditions: IHideCornerConditions = {}) => {

    return [...new DesignerToolbarSettings()
        .addSettingsInput({
            id: nanoid(),
            inputType: 'radio',
            label: 'Radius Type',
            propertyName: `${path ? path + '.' : ''}border.radiusType`,
            defaultValue: 'all',
            buttonGroupOptions: radiusConfigType,
        })
        .addSettingsInputRow({
            id: nanoid(),
            parentId: 'borderStylePnl',
            inline: true,
            readOnly: false,
            hidden: { _code: generateCode('radiusType', false, isResponsive, path), _mode: 'code', _value: false } as any,
            inputs: [
                {
                    id: `borderRadiusStyleRow-all`,
                    parentId: "borderStylePnl",
                    label: "Corner Radius",
                    hideLabel: true,
                    width: 80,
                    defaultValue: 0,
                    type: 'numberField',
                    icon: 'ExpandOutlined',
                    tooltip: 'Styles will apply to all corners',
                    propertyName: path ? `${path}.border.radius.all` : 'border.radius.all',
                }
            ]
        })
        .addSettingsInputRow({
            hidden: { _code: generateCode('radiusType', true, isResponsive, path), _mode: 'code', _value: false } as any,
            id: nanoid(),
            parentId: 'borderStylePnl',
            inline: true,
            readOnly: false,
            inputs: radiusCorners.map(cornerValue => {
                const corner = cornerValue.value as string;

                return {
                    id: `borderRadiusStyleRow-${corner}`,
                    parentId: "borderStylePnl",
                    label: "Corner Radius",
                    hideLabel: true,
                    width: 80,
                    defaultValue: 0,
                    type: 'numberField',
                    icon: cornerValue.icon,
                    hidden: { _code: hideCornerConditions[corner], _mode: 'code', _value: false } as any,
                    tooltip: `${humanizeString(corner)} corner`,
                    propertyName: path ? `${path}.border.radius.${corner}` : `border.radius.${corner}`,
                };
            })
        }).toJson()
    ];
};