import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        border: {
            border: {
                all: { width: '0px', style: 'solid', color: '#d9d9d9' },
                top: { width: '0px', style: 'solid', color: '#d9d9d9' },
                bottom: { width: '0px', style: 'solid', color: '#d9d9d9' },
                left: { width: '0px', style: 'solid', color: '#d9d9d9' },
                right: { width: '0px', style: 'solid', color: '#d9d9d9' },
            },
            radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            borderType: 'all',
            radiusType: 'all'
        },
        dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
    };
};