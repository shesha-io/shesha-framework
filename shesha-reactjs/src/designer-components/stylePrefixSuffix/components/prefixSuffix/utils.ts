import { ISizeValue } from "./prefixSuffixComponent";

export const getSizeStyle = (input?: ISizeValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};
    const sizeProperties: (keyof ISizeValue)[] = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'];

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
