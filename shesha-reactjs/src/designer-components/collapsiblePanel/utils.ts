import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {

    return {
        background: { type: 'color', color: '#fff' },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: {
                all: { width: '0', color: '#000', style: 'solid' }, top: { width: '0' }, right: { width: '0' },
                bottom: { width: '0' }, left: { width: '0' }
            },
            radius: { all: 4 }
        },
        shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
        position: { value: 'relative', top: 0, right: 0, bottom: 0, left: 0, offset: 'top' },
        display: "block"
    };
};