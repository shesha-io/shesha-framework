
export const initialValues = (): any => {
    return {
        background: {
            type: 'color',
            repeat: 'no-repeat',
            size: 'cover',
            position: 'center',
            gradient: { direction: 'to right' }
        },
        font: { weight: '400', size: 14, align: 'center', type: 'Segoe UI' },
        dimensions: { width: 'auto', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            radiusType: 'all',
            borderType: 'all',
            hideBorder: false,
            border: { all: { width: '1px', style: 'solid' } },
            radius: { all: 8 }
        },
        shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
        stylingBox: '{"paddingLeft":"15","paddingBottom":"4","paddingTop":"4","paddingRight":"15"}',
    };
};