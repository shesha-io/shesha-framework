import { IStyleType } from '@/index';

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: {
            weight: '400',
            size: 20,
            color: '#000',
            type: 'Segoe UI',
        },
        border: {
            border: {
                all: {
                    width: 1,
                    style: 'solid',
                    color: '#d9d9d9',
                },
            },
            radius: { all: 8 },
            borderType: 'all',
            radiusType: 'all',
        },
        dimensions: {
            width: '24px',
            height: 'auto',
            minHeight: '0px',
            maxHeight: 'auto',
            minWidth: '0px',
            maxWidth: 'auto',
        },
    };
};
