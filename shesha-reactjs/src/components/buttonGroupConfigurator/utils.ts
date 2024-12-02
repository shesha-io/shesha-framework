import { IStyleType } from "@/index";

export const initialValues = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
    };
};