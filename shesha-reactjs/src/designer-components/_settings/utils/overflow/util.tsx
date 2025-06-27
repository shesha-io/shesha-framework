export const getOverflowStyle = (overflow: boolean, hideScrollBar: boolean): React.CSSProperties => {
    if (!overflow) return {};
    return {
        overflow: 'auto',
        scrollbarWidth: hideScrollBar ? 'none' : 'thin',
        scrollbarColor: hideScrollBar ? undefined : '#8B8B8B transparent',
    };
};