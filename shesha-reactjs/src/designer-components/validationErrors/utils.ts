import { IStyleType } from "@/index";
import { sheshaStyles } from '@/styles';

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: "color", color: '', },
        dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            border: {
                all: { width: "", style: 'solid', color: '' },
                top: { width: "", style: 'solid', color: '' },
                bottom: { width: "", style: 'solid', color: '' },
                left: { width: "", style: 'solid', color: '' },
                right: { width: "", style: 'solid', color: '' },
            },
        },
        stylingBox: `{"paddingLeft":${sheshaStyles.paddingLG},"paddingBottom":${sheshaStyles.paddingLG},"paddingTop":${sheshaStyles.paddingLG},"paddingRight":${sheshaStyles.paddingLG},"marginBottom":"${sheshaStyles.paddingMD}"}`
    };
};