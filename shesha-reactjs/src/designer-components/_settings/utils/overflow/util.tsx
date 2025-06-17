export const getOverflowStyle = (overflow: boolean, hideScrollBar: boolean): React.CSSProperties => {
    if (!overflow) return {};
    return {
        overflow: 'auto',
        scrollbarWidth: 'thin',
        '::WebkitScrollbar': {
            width: '8px'
        },
        ...(hideScrollBar && {
            '::WebkitScrollbar': { display: 'none' },
            'msOverflowStyle': 'none',
            'scrollbarWidth': 'none',
        }),
        scrollbarColor: '#8B8B8B transparent',
    };
};