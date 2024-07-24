import { IBackgroundValue } from "./interfaces";

export const toBase64 = file => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
});

export const getBackgroundStyle = async (input?: IBackgroundValue): Promise<React.CSSProperties> => {
    if (!input) return {};
    const style: React.CSSProperties = {};

    if (input.type === 'color') {
        style.backgroundColor = input.color;
    } else if (input.type === 'gradient') {
        const colors = input.gradient?.colors || [];
        style.backgroundImage = `linear-gradient(${input.gradient?.direction || 'to right'}, ${colors.join(', ')})`;
    } else if (input.type === 'url') {
        style.backgroundImage = `url(${input.url})`;
    } else if (input.type === 'upload') {
        style.backgroundImage = `url(${input.file})`;
    } else if (input.type === 'base64') {
        style.backgroundImage = `url(${input.base64})`;
    }

    if (input.size) {
        if (typeof input.size === 'string') {
            style.backgroundSize = input.size;
        } else {
            const width = `${input.size.width.value}${input.size.width.unit}`;
            const height = `${input.size.height.value}${input.size.height.unit}`;
            style.backgroundSize = `${width} ${height}`;
        }
    }

    if (input.position) {
        if (typeof input.position === 'string') {
            style.backgroundPosition = input.position;
        } else {
            const x = `${input.position.width.value}${input.position.width.unit}`;
            const y = `${input.position.height.value}${input.position.height.unit}`;
            style.backgroundPosition = `${x} ${y}`;
        }
    }

    if (input.repeat) {
        style.backgroundRepeat = input.repeat;
    }

    return style;
};
