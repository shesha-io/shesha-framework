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
    }

    if (input.size) {
        style.backgroundSize = input.size;
    }

    if (input.position) {
        style.backgroundPosition = input.position;
    }

    if (input.repeat) {
        style.backgroundRepeat = input.repeat;
    }

    return style;
};
