import { IShadowValue } from "./interfaces";
import { initialShadowValue } from "./shadowComponent";

export const getShadowStyle = (input?: IShadowValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};
    const { offsetX, offsetY, blurRadius, color, spreadRadius } = { ...initialShadowValue.box, ...input.box };
    const { offsetX: textShadowOffsetX, offsetY: textShadowOffsetY, blurRadius: textShadowBlurRadius, color: textShadowColor, spreadRadius: textShadowSpreadRadius } = { ...initialShadowValue.text, ...input.text };

    const shadow = `${offsetX || 0}px ${offsetY || 0}px ${blurRadius || 0}px ${spreadRadius || 0}px ${color || '#00000004'}`;
    const textShadow = `${textShadowOffsetX || 0}px ${textShadowOffsetY || 0}px ${textShadowBlurRadius || 0}px ${textShadowSpreadRadius || 0}px ${textShadowColor || '#00000004'}`;

    style.boxShadow = shadow;
    style.textShadow = textShadow;

    return style;
};

