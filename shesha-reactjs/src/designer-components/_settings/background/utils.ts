import { IBackgroundValue } from "./interfaces";

export const getBackgroundStyle = (input?: IBackgroundValue): React.CSSProperties => {
    if (!input) return {};

    const style: React.CSSProperties = {};

    const backgroundSize = input?.size;
    const backgroundRepeat = input.repeat;

    if (input.type === 'color') {
        style.backgroundColor = input.color;
    } else if (input.type === 'gradient') {
        const colors = input.gradient?.colors || [];
        style.backgroundImage = `linear-gradient(${input.gradient?.direction || 'to right'}, ${colors.join(', ')})`;
    } else if (input.type === 'url') {
        style.backgroundImage = `url(${input.url})`;
    } else if (input.type === 'upload') {
        style.backgroundImage = `url(${input.fileId})`;
    } else if (input.type === 'base64') {
        style.backgroundImage = `url(${input.base64})`;
    }

    return { ...style, backgroundSize, backgroundRepeat };
}