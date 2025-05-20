export const defaultStyles = (): any => {
    return {
        background: { type: 'color', color: '' },
        font: {
            weight: '400',
            size: 12,
            color: '#000',
            type: 'Segoe UI',
            align: 'center'
        },
        border: {
            border: {
                all: {
                    width: '1px',
                    style: 'solid',
                    color: '#d9d9d9'
                }
            },
            radius: { all: 4 },
            selectedBorder: 'all',
            selectedCorner: 'all'
        },
        dimensions: {
            width: 'auto',
            height: '24px',
            minHeight: '0px',
            maxHeight: 'auto',
            minWidth: '0px',
            maxWidth: 'auto'
        }
    };
};