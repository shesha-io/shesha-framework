import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: 'transparent' },
        font: { weight: '400', size: 14, type: 'Segoe UI' },
        border: {
            border: {
                all: { width: '1px', style: 'none', color: '#d9d9d9' },
                top: { width: '1px', style: 'solid', color: '#d9d9d9' },
                bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
                left: { width: '1px', style: 'solid', color: '#d9d9d9' },
                right: { width: '1px', style: 'solid', color: '#d9d9d9' },
            },
            radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            borderType: 'all',
            radiusType: 'all'
        },
        dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        stylingBox: '{"paddingLeft":"0","paddingBottom":"0","paddingTop":"0","paddingRight":"0"}',
    };
};
