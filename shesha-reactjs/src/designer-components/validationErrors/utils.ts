import { IStyleType } from "@/index";
import { sheshaStyles } from '@/styles';

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: "color", color: '', },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            border: {
                all: { width: '1px', style: 'solid', color: '' },
                top: { width: '1px', style: 'solid', color: '' },
                bottom: { width: '1px', style: 'solid', color: '' },
                left: { width: '1px', style: 'solid', color: '' },
                right: { width: '1px', style: 'solid', color: '' },
            },
            radius: { all: 8, topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
            borderType: 'all',
            radiusType: 'all'
        },
        stylingBox: `{"paddingLeft":${sheshaStyles.paddingLG},"paddingBottom":${sheshaStyles.paddingLG},"paddingTop":${sheshaStyles.paddingLG},"paddingRight":${sheshaStyles.paddingLG},"marginBottom":"${sheshaStyles.paddingMD}"}`
    };
};