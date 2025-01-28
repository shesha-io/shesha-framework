import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {

    return {
        background: { type: 'color', color: '#fff' },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: {
                all: { width: '1', color: '#d9d9d9', style: 'solid' }
            },
            radius: { all: 8 }
        },
        shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
        position: { value: 'relative', top: 0, right: 0, bottom: 0, left: 0, offset: 'top' },
    };
};

export const defaultHeaderStyles = (): IStyleType => {

    return {
        font: { color: '#000', size: 14, weight: '700', align: 'left', type: 'Arial' },
        background: { type: 'color', color: '#00000005' },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: {
                all: { width: '1px', color: '#d9d9d9', style: 'solid' }
            },
            radius: { all: 8 }
        }
    };
};