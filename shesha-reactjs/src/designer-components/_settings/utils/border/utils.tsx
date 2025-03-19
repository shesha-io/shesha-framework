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

export const getBorderStyle = (input: IBorderValue, jsStyle: React.CSSProperties): React.CSSProperties => {
    if (!input || jsStyle?.border) return {};

    const style: React.CSSProperties = {};
    const { all, top, right, bottom, left } = input?.border;


    const handleBorderPart = (part, prefix: string) => {
        const hideBorder = input?.border?.[part]?.style === 'none';
        if (part?.width && !jsStyle[prefix] && !jsStyle[`${prefix}Width`]) style[`${prefix}Width`] = addPx(part?.width || all?.width);
        if (part?.style && !jsStyle[prefix] && !jsStyle[`${prefix}Style`]) style[`${prefix}Style`] = hideBorder ? 'none' : part?.style || all?.style;
        if (part?.color && !jsStyle[prefix] && !jsStyle[`${prefix}Color`]) style[`${prefix}Color`] = part?.color || all?.color;
    };

    if (input.borderType === 'all') {
        handleBorderPart(all, 'border');
    } else {
        handleBorderPart(top, 'borderTop');
        handleBorderPart(right, 'borderRight');
        handleBorderPart(bottom, 'borderBottom');
        handleBorderPart(left, 'borderLeft');
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

    return [...new DesignerToolbarSettings()
        .addSettingsInput({
            id: nanoid(),
            inputType: 'radio',
            label: 'Border Type',
            propertyName: `${path ? path + '.' : ''}border.borderType`,
            defaultValue: 'all',
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
                    label: 'Icon',
                    hideLabel: true,
                    propertyName: 'borderIcon',
                    icon: 'BorderOutlined',
                    width: 20,
                    tooltip: `Styles will apply to all border`,
                },
                {
                    id: nanoid(),
                    type: 'textField',
                    label: "Width",
                    hideLabel: true,
                    propertyName: path ? `${path}.border.border.all.width` : `border.border.all.width`,
                },
                {
                    id: nanoid(),
                    label: "Style",
                    propertyName: path ? `${path}.border.border.all.style` : `border.border.all.style`,
                    type: "dropdown",
                    hideLabel: true,
                    width: 60,
                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    dropdownOptions: borderStyles,
                },
                {
                    id: nanoid(),
                    label: `Color`,
                    propertyName: path ? `${path}.border.border.all.color` : `border.border.all.color`,
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
                                propertyName: path ? `${path}.border.border.${side}.width` : `border.border.${side}.width`,
                            },
                            {
                                id: nanoid(),
                                label: "Style",
                                propertyName: path ? `${path}.border.border.${side}.style` : `border.border.${side}.style`,
                                type: "dropdown",
                                hideLabel: true,
                                width: 60,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                dropdownOptions: borderStyles,
                            },
                            {
                                id: nanoid(),
                                label: `Color`,
                                propertyName: path ? `${path}.border.border.${side}.color` : `border.border.${side}.color`,
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

export const getCornerInputs = (path = '', isResponsive: boolean = true) => {

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
                    width: 65,
                    defaultValue: 0,
                    type: 'numberField',
                    icon: 'ExpandOutlined',
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
                const corner = cornerValue.value;

                return {
                    id: `borderRadiusStyleRow-${corner}`,
                    parentId: "borderStylePnl",
                    label: "Corner Radius",
                    hideLabel: true,
                    width: 65,
                    defaultValue: 0,
                    type: 'numberField',
                    icon: cornerValue.icon,
                    propertyName: path ? `${path}.border.radius.${corner}` : `border.radius.${corner}`,
                };
            })
        }).toJson()
    ];
};