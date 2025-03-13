import { IStyleType } from "@/index";

export const defaultStyles = (prev): IStyleType => {
    const { borderWidth, borderColor, borderRadius, borderType } = prev;
    return {
        border: {
            radiusType: 'all', borderType: 'all',
            border: {
                all: { width: borderWidth || '0px', style: borderType, color: borderColor },
                top: { width: '0px', },
                left: { width: '0px', },
                right: { width: '0px', },
                bottom: { width: '0px', }
            },
            radius: { all: borderRadius }
        },
    };
};