import React from "react";
import { IBorderValue } from "./interfaces";
import {
    ExpandOutlined,
    RadiusUpleftOutlined,
    RadiusUprightOutlined,
    RadiusBottomleftOutlined,
    RadiusBottomrightOutlined,
    BorderOutlined,
    BorderTopOutlined,
    BorderRightOutlined,
    BorderBottomOutlined,
    BorderLeftOutlined,
    MinusOutlined,
    DashOutlined,
    SmallDashOutlined,
    CloseOutlined
} from "@ant-design/icons";

export const getBorderStyle = (input: IBorderValue): React.CSSProperties => {
    if (!input || input.hideBorder) return {};

    const style: React.CSSProperties = {};

    // Handle border radius
    if (input.radius) {
        const { all, topLeft, topRight, bottomLeft, bottomRight } = input.radius;
        style.borderRadius = `${all}px`;
        style.borderRadius = `${topLeft || all || 6}px ${topRight || all || 6}px ${bottomRight || all || 6}px ${bottomLeft || all || 6}px`;
    }

    // Handle border
    if (input.border) {
        const { all, top, right, bottom, left } = input.border;

        const handleBorderPart = (part, prefix: string) => {
            if (part?.width) style[`${prefix}Width`] = `${part.width || 0}${part.unit || 'px'}`;
            if (part?.style) style[`${prefix}Style`] = part.style || 'solid';
            if (part?.color) style[`${prefix}Color`] = part.color || 'black';
        };

        handleBorderPart(all, 'border');
        handleBorderPart(top, 'borderTop');
        handleBorderPart(right, 'borderRight');
        handleBorderPart(bottom, 'borderBottom');
        handleBorderPart(left, 'borderLeft');
    }

    return style;
};


export const radiusOptions = [
    { value: 'all', icon: <ExpandOutlined />, title: 'all' },
    { value: 'topLeft', icon: <RadiusUpleftOutlined />, title: 'top left' },
    { value: 'topRight', icon: <RadiusUprightOutlined />, title: 'top right' },
    { value: 'bottomLeft', icon: <RadiusBottomleftOutlined />, title: 'bottom left' },
    { value: 'bottomRight', icon: <RadiusBottomrightOutlined />, title: 'bottom right' },
];

export const borderOptions = [
    { value: 'all', icon: <BorderOutlined />, title: 'all' },
    { value: 'top', icon: <BorderTopOutlined />, title: 'top' },
    { value: 'right', icon: <BorderRightOutlined />, title: 'right' },
    { value: 'bottom', icon: <BorderBottomOutlined />, title: 'bottom' },
    { value: 'left', icon: <BorderLeftOutlined />, title: 'left' },
];

export const styleOptions = [
    { value: 'solid', icon: <MinusOutlined />, title: 'solid' },
    { value: 'dashed', icon: <DashOutlined />, title: 'dashed' },
    { value: 'dotted', icon: <SmallDashOutlined />, title: 'dotted' },
    { value: 'none', icon: <CloseOutlined />, title: 'none' },
];