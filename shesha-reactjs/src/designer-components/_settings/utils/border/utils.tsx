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

export const getBorderStyle = (input: IBorderValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};

    // Handle border
    if (input.border) {
        const { all, top, right, bottom, left } = input.border;

        const handleBorderPart = (part, prefix: string) => {
            if (part?.width) style[`${prefix}Width`] = addPx(part.width);
            if (part?.style) style[`${prefix}Style`] = part.style || 'solid';
            if (part?.color) style[`${prefix}Color`] = part.color || 'black';
        };

        handleBorderPart(all, 'border');
        handleBorderPart(top, 'borderTop');
        handleBorderPart(right, 'borderRight');
        handleBorderPart(bottom, 'borderBottom');
        handleBorderPart(left, 'borderLeft');
    }

    if (input.hideBorder) style.border = 'none';


    // Handle border radius
    if (input.radius) {
        const { all, topLeft, topRight, bottomLeft, bottomRight } = input.radius;
        style.borderRadius = `${all}px`;
        style.borderRadius = `${topLeft || all || 8}px ${topRight || all || 8}px ${bottomRight || all || 8}px ${bottomLeft || all || 8}px`;
    }

    return style;
};

export const borderStyles: IDropdownOption[] = [
    { value: 'solid', label: <MinusOutlined /> },
    { value: 'dashed', label: <DashOutlined /> },
    { value: 'dotted', label: <SmallDashOutlined /> },
    { value: 'none', label: <CloseOutlined /> },
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
]