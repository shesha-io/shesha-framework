import { IStyleType } from "@/index";

export const defaultStyles = (prev): IStyleType => {
    return {
        background: { type: 'color' },
        font: { weight: '400', size: 14, type: 'Segoe UI', align: 'center' },
        border: {
            border: { all: { width: '1px', style: 'none', color: '#d9d9d9' } },
            radius: { all: 8 },
            hideBorder: true,
            borderType: 'all',
        },
        shadow: {
            color: '#000000',
            offsetX: 0,
            offsetY: 0,
            blurRadius: 0,
            spreadRadius: 0,
        },
        dimensions: {
            width: prev.block ? '100%' : 'auto',
            height: '32px', minHeight: '0px',
            maxHeight: 'auto',
            minWidth: '0px',
            maxWidth: 'auto'
        }
    };
};
