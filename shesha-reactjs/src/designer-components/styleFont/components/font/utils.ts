import { IFontValue } from "./interfaces";

export const getFontStyle = (input?: IFontValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};

    if (input.size) {
        const { value, unit } = input.size;
        if (value) {
            style.fontSize = /^\d+(\.\d+)?$/.test(value as string) ? `${value}${unit}` : value;
        }
    }

    if (input.lineHeight) {
        style.lineHeight = `${input.lineHeight.value}${input.lineHeight.unit}`;
    }

    if (input.type) {
        style.fontFamily = input.type;
    }

    if (input.weight) {
        style.fontWeight = input.weight;
    }

    if (input.color) {
        style.color = input.color;
    }

    if (input.align) {
        console.log("Align::", input.align);
        style.textAlign = input.align;
    }

    console.log("Font Style::", input, style);
    return style;
};