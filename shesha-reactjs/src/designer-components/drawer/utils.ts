export const defaultStyles = (): any => {
    return {
        background: { type: 'color', color: '#fff' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
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
    };
};

export const initialStyle = {
    footerBackground: {
        type: 'color',
        color: '#fff',
        repeat: 'no-repeat',
        size: 'cover',
        position: 'center',
        gradient: { direction: 'to right', colors: {} }
    },
    headerBackground: {
        type: 'color',
        color: '#fff',
        repeat: 'no-repeat',
        size: 'cover',
        position: 'center',
        gradient: { direction: 'to right', colors: {} }
    },
    headerShadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#000',
        blurRadius: 0,
        spreadRadius: 0
    },
    footerShadow: {
        offsetX: 0,
        offsetY: 0,
        color: '#000',
        blurRadius: 0,
        spreadRadius: 0
    },  
};