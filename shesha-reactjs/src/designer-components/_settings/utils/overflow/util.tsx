export const getOverflowStyle = (overflow: boolean, hideScrollBar: boolean): React.CSSProperties => {
    if (!overflow) return {};
    return {
        overflow: 'auto',
        scrollbarWidth: 'thin',
        '::WebkitScrollbar': {
            width: '8px',
            backgroundColor: 'transparent'
        },
        ...(hideScrollBar && {
            '::WebkitScrollbar': { display: 'none' },
            'msOverflowStyle': 'none',
            'scrollbarWidth': 'none',
        })
    };
};