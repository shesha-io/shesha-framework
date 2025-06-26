export const defaultStyles = (): any => {
    return {
        background: { type: 'color', color: '#fff', position: 'center', size: 'cover', repeat: 'no-repeat' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        dimensions: { width: '50%', height: '100%', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
        border: {
            border: {
                all: { width: '1px', style: 'solid', color: '#d9d9d9' },
                top: { width: '1px', style: 'solid', color: '#d9d9d9' },
                bottom: { width: '1px', style: 'solid', color: '#d9d9d9' },
                left: { width: '1px', style: 'solid', color: '#d9d9d9' },
                right: { width: '1px', style: 'solid', color: '#d9d9d9' },
            },
            radius: { all: 0, topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
            borderType: 'all',
            radiusType: 'all'
        },
        style: '',
        shadow: {
            offsetX: 0,
            offsetY: 0,
            color: '#000',
            blurRadius: 0,
            spreadRadius: 0
        }
    };
};