
export const initialValues = (): any => {
    return {
        background: { type: 'color' },
        font: { weight: '400', size: 14, align: 'center', type: 'Segoe UI' },
        dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            radiusType: 'all', borderType: 'all', hideBorder: false, border: { all: { width: '1px', style: 'solid' } },
            radius: { all: 8 }
        },
    };
};