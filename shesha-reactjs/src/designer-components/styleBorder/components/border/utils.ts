import { IBorderValue } from "./interfaces";

export const getBorderStyle = (input: IBorderValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};

    // Handle border radius
    if (input.radius) {
        const { all, topLeft, topRight, bottomLeft, bottomRight } = input.radius;
        style.borderRadius = all ? `${all}px` : `${topLeft || 1}px ${topRight || 1}px ${bottomRight || 1}px ${bottomLeft || 1}px`;
    }

    // Handle border
    if (input.border) {
        const { all, top, right, bottom, left } = input.border;

        const handleBorderPart = (part, prefix: string) => {
            if (part?.width) style[`${prefix}Width`] = `${part.width || 0}${part.unit || 'px'}`;
            if (part?.style) style[`${prefix}Style`] = part.style || 'solid';
            if (part?.color) style[`${prefix}Color`] = part.color;
        };

        handleBorderPart(all, 'border');
        handleBorderPart(top, 'borderTop');
        handleBorderPart(right, 'borderRight');
        handleBorderPart(bottom, 'borderBottom');
        handleBorderPart(left, 'borderLeft');
    }

    return style;
}