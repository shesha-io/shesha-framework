export const defaultStyles = (): any => {
    return {
        background: { type: 'color', color: '#fff' },
        font: { weight: '400', size: 14, color: '#000', type: 'Segoe UI' },
        dimensions: { width: '100%', height: '32px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
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