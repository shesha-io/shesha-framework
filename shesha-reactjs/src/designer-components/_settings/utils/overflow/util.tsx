export const getOverflowStyle = (overflow: boolean, hideScrollBar: boolean): React.CSSProperties => {
    if (!overflow) return {};
    return {
        overflow: 'auto',
        scrollbarWidth: 'thin',
        '::-webkit-scrollbar': {
            width: '8px',
            backgroundColor: 'transparent'
        },
        ...(hideScrollBar && {
            '::-webkit-scrollbar': { display: 'none' },
            'msOverflowStyle': 'none',
            'scrollbarWidth': 'none',
        })
    };
};