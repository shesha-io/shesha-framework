import { IStyleType } from "@/index";

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        dimensions: { width: '100%', height: '54px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
    };
};