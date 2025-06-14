import { IStyleType } from '@/index';

export const defaultStyles = (): IStyleType => {
    return {
        background: { type: 'color', color: '#fff' },
        font: {
            weight: '400',
            size: 24,
            color: '#000',
            type: 'Segoe UI',
        },
        border: {
            border: {
                all: {
                    width: 0,
                    style: 'solid',
                    color: '#ffffff',
                },
            },
            radius: { all: 8 },
            borderType: 'all',
            radiusType: 'all',
        },
        dimensions: {
            width: 'auto',
            height: 'auto',
            minHeight: '0px',
            maxHeight: 'auto',
            minWidth: '0px',
            maxWidth: 'auto',

        },
    };
};
