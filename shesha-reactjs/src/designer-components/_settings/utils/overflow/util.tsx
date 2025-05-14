import { CSSProperties } from "react";

export const getOverflowStyle = (overflow: CSSProperties['overflow'], hideScrollBar: boolean): React.CSSProperties => {
    if (!overflow) return {};
    return {
        overflow: overflow,
        scrollbarWidth: 'thin',
        '::-webkit-scrollbar': {
            width: '8px',
            backgroundColor: 'transparent'
        },
        ...(hideScrollBar && {
            '::-webkit-scrollbar': { display: 'none' },
            'msOverflowStyle': 'none',
            'scrollbarWidth': 'none'
        })
    };
};