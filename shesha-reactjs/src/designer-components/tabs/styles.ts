import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { styles, cardStyles, position }) => {
    const {
        borderWidth,
        borderStyle,
        borderColor,
        borderTopWidth,
        borderBottomWidth,
        borderRightWidth,
        borderLeftWidth,
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomLeftRadius,
        borderBottomRightRadius,
        backgroundColor,
        backgroundImage,
        shadow,
        padding = '15px',
    } = styles;

    const {
        backgroundImage: cardBgImage,
        backgroundColor: cardBgColor,
        width: cardWidth,
        height: cardHeight,
        minWidth: cardMinWidth,
        minHeight: cardMinHeight,
        maxWidth: cardMaxWidth,
        maxHeight: cardMaxHeight,
    } = cardStyles;

    const getBorder = (side) => {
        return `${styles[`${side}Width`] ?? borderWidth} ${styles[`${side}Style`] ?? borderStyle} ${styles[`${side}Color`] ?? borderColor}`;
    };

    const borderMap = {
        top: getBorder('borderTop'),
        bottom: getBorder('borderBottom'),
        left: getBorder('borderLeft'),
        right: getBorder('borderRight'),
        default: `${borderWidth} ${borderStyle} ${borderColor}`,
    };

    const borderRadiusMap = {
        topLeft: position === 'top' || position === 'left' ? '0px' : borderTopLeftRadius,
        topRight: position === 'top' || position === 'right' ? '0px' : borderTopRightRadius,
        bottomLeft: position === 'bottom' || position === 'left' ? '0px' : borderBottomLeftRadius,
        bottomRight: position === 'bottom' || position === 'right' ? '0px' : borderBottomRightRadius,
    };

    const content = cx(
        'tab-content-holder',
        css`
            .ant-tabs-content-holder {
                --ant-tabs-card-bg: ${backgroundImage || backgroundColor};
                ${styles.noBorderStyles || ''};
                border-left: ${position === 'left' ? 'none' : borderMap.left} !important;
                border-right: ${position === 'right' ? 'none' : borderMap.right} !important;
                border-bottom: ${position === 'bottom' ? 'none' : borderMap.bottom} !important;
                border-top: ${position === 'top' ? 'none' : borderMap.top} !important;
                padding: ${padding} !important;
                border-top-left-radius: ${borderRadiusMap.topLeft};
                border-top-right-radius: ${borderRadiusMap.topRight};
                border-bottom-left-radius: ${borderRadiusMap.bottomLeft};
                border-bottom-right-radius: ${borderRadiusMap.bottomRight};
            }

            .ant-tabs-tab:not(.ant-tabs-tab-active) {
                --ant-tabs-card-bg: ${cardBgImage || cardBgColor};
                background: ${cardBgImage || cardBgColor} !important;
                ${cardStyles};
                box-shadow: ${shadow} !important;
                border: ${borderMap[position] || borderMap.default} !important;
                z-index: 1;
            }

            .ant-tabs-tab-active {
                --ant-tabs-card-bg: ${backgroundColor || backgroundImage};
                background: ${backgroundImage || backgroundColor} !important;
                ${styles.noBorderStyles || ''};
                ${cardStyles};
                width: ${cardWidth};
                height: ${cardHeight};
                min-width: ${cardMinWidth};
                min-height: ${cardMinHeight};
                max-width: ${cardMaxWidth};
                max-height: ${cardMaxHeight};
                border: ${borderMap[position] || borderMap.default};
                ${position === 'top' ? 'border-bottom: none' : position === 'left' ? 'border-left: none' : position === 'right' ? 'borderRight: none' : 'border-top: none'}
            }

            .ant-tabs-nav {
                width: ${styles.width};
                max-width: ${styles.maxWidth};
                min-width: ${styles.minWidth};
                margin: 0;
            }

            .ant-tabs-nav::before {
                border-bottom: ${borderMap[position] || borderMap.default} !important;
            }
        `
    );

    return {
        content,
    };
});
