import { IStyleType } from "@/index";
import { ICollapsiblePanelComponentProps } from "./interfaces";

export const defaultStyles = (prev: ICollapsiblePanelComponentProps): IStyleType => {
    const bodyColor = prev.bodyColor || '#fff';
    const { ghost, borderRadius } = prev;

    return {
        background: { type: 'color', color: bodyColor },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            radiusType: 'all', borderType: 'custom',
            border: {
                ...ghost ? { all: { width: '1px', color: '#d9d9d9', style: 'solid' } }
                    : {
                        all: { width: '1px', color: '#d9d9d9', style: 'solid' },
                        top: { width: '1px', color: '#d9d9d9', style: 'none' },
                        bottom: { width: '1px', color: '#d9d9d9', style: 'solid' },
                        left: { width: '1px', color: '#d9d9d9', style: 'solid' },
                        right: { width: '1px', color: '#d9d9d9', style: 'solid' },
                    },
            },
            radius: { all: borderRadius || 8 }
        },
        shadow: { blurRadius: 0, color: 'rgba(0, 0, 0, 0.15)', offsetX: 0, offsetY: 0, spreadRadius: 0 },
        stylingBox: '{"marginBottom":"5","paddingLeft":"8","paddingBottom":"8","paddingTop":"8","paddingRight":"8"}'
    };
};

export const defaultHeaderStyles = (prev: ICollapsiblePanelComponentProps): IStyleType => {
    const headerBgColor = prev?.headerColor || '#fff';
    const { isSimpleDesign, borderRadius } = prev;

    return {
        font: { color: '#000', size: 14, weight: isSimpleDesign ? '400' : '500', align: 'left', type: 'Segoe UI' },
        background: {
            type: 'color',
            color: headerBgColor,
            repeat: 'no-repeat',
            position: 'center',
            size: 'cover',
        },
        dimensions: { width: 'auto', height: 'auto', minHeight: '0', maxHeight: 'auto', minWidth: '0', maxWidth: 'auto' },
        border: {
            radiusType: 'all',
            borderType: 'all',
            border: {
                all: { width: '1px', color: '#d9d9d9', style: 'solid' },
            },
            radius: { all: borderRadius || 8 }
        },
        stylingBox: '{"paddingLeft":"8","paddingBottom":"8","paddingTop":"8","paddingRight":"8"}'
    };
};

