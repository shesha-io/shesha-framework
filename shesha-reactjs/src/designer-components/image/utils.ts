import { IStyleType } from "@/index";

export const defaultStyles = (prev): IStyleType => {
    const { borderWidth, borderColor, borderRadius, borderType } = prev;
    return {
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: { all: { width: borderWidth, style: borderType, color: borderColor } },
            radius: { all: borderRadius }
        },
    };
};