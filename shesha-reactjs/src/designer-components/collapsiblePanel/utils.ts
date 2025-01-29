import { IStyleType } from "@/index";
import { ICollapsiblePanelComponentProps } from "./interfaces";

export const defaultStyles = (prev: ICollapsiblePanelComponentProps): IStyleType => {
    const bodyColor = prev.bodyColor || '#fff';
    const { ghost, borderRadius } = prev;

    return {
        background: { type: 'color', color: bodyColor },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: {
                ...ghost ? { all: { width: '0px', color: '#d9d9d9', style: 'solid' }, top: { width: '0px', style: 'solid' }, bottom: { width: '0px' }, left: { width: '0px' }, right: { width: '0px' } }
                    : { all: { width: '1px', color: '#d9d9d9', style: 'solid' } },
            },
            radius: { all: borderRadius || 8, topLeft: '0', topRight: '0' }
        },
        shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
        position: { value: 'relative', top: 0, right: 0, bottom: 0, left: 0, offset: 'top' },
    };
};

export const defaultHeaderStyles = (prev: ICollapsiblePanelComponentProps): IStyleType => {
    const headerBgColor = prev?.headerColor || '#00000005';
    const { isSimpleDesign, ghost, borderRadius } = prev;

    return {
        font: { color: '#000', size: 14, weight: isSimpleDesign ? '400' : '700', align: 'left', type: 'Arial' },
        background: { type: 'color', color: headerBgColor },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0', maxHeight: 'auto', minWidth: '0', maxWidth: 'auto' },
        border: {
            selectedCorner: 'all', selectedSide: 'all',
            border: {
                ...ghost ? { all: { width: '0px', color: '#d9d9d9', style: 'solid' }, top: { width: '3px', style: 'solid', color: 'var(--primary-color)' }, bottom: { width: isSimpleDesign ? 0 : '2px', style: 'solid', color: 'var(--primary-color)' } }
                    : { all: { width: '1px', color: '#d9d9d9', style: 'solid' } },
            },
            radius: { all: borderRadius, bottomLeft: '0', bottomRight: '0', topLeft: isSimpleDesign || ghost ? '0' : borderRadius, topRight: isSimpleDesign || ghost ? '0' : borderRadius }
        }
    };
};