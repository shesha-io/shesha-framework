import { IStyleType } from "@/index";

export const defaultStyles = (prev): IStyleType => {
    const bodyBgColor = prev?.backgroundColor || '#fff';

    return {
        background: { type: 'color', color: '#fff' },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: {
                all: { width: '1px', color: '#d9d9d9', style: 'solid' }
            },
            radius: { all: 8 }
        },
        shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
        position: { value: 'relative', top: 0, right: 0, bottom: 0, left: 0, offset: 'top' },
    };
};

export const defaultHeaderStyles = (prev): IStyleType => {
    const headerBgColor = prev?.headerBackgroundColor || '#00000005';

    return {
        font: { color: '#000', size: 14, weight: '700', align: 'left', type: 'Arial' },
        background: { type: 'color', color: headerBgColor },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: {
                all: { width: '.75px', color: '#d9d9d9', style: 'solid' }, bottom: { width: 0 }
            },
            radius: { all: 8 }
        }
    };
};