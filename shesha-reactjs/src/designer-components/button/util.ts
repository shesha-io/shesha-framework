import { IStyleType } from "@/index";

export const buttonTypes = [
    {
        label: 'default',
        value: 'default',
    },
    {
        label: 'primary',
        value: 'primary',
    },
    {
        label: 'ghost',
        value: 'ghost',
    },
    {
        label: 'dashed',
        value: 'dashed',
    },
    {
        label: 'link',
        value: 'link',
    },
    {
        label: 'text',
        value: 'text',
    }
];

export const defaultStyles = (prev): IStyleType => {
    return {
        background: { type: 'color' },
        font: { weight: '400', size: 14, type: 'Segoe UI', align: 'center' },
        dimensions: { width: prev.block ? '100%' : 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' }
    };
};
