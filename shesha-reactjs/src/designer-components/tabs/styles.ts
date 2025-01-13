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

    const isLeft = position === 'left';
    const isRight = position === 'right';
    const isTop = position === 'top';
    const isBottom = position === 'bottom';

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

    const content = cx(
        'content',
        css`
            .ant-tabs-content-holder {
                --ant-tabs-card-bg: ${backgroundImage || backgroundColor};
                border: ${borderMap.default};
                border-left: ${borderMap.left} !important;
                border-right:${borderMap.right} !important;
                border-bottom: ${isBottom ? 'none' : borderMap.bottom} !important;
                border-top: ${isTop ? 'none' : borderMap.top} !important;
                background: ${backgroundImage || backgroundColor} !important;
                padding: ${padding} !important;
                ${isTop || isLeft ? 'border-top-left-radius: 0px' : 'border-top-left-radius:' + borderTopLeftRadius}
                ${isTop || isRight ? 'border-top-left-radius: 0px' : 'border-top-right-radius:' + borderTopRightRadius}
                ${isBottom || isLeft ? 'border-bottom-left-radius: 0px' : 'border-bottom-left-radius:' + borderBottomLeftRadius}
                ${isBottom || isRight ? 'border-bottom-right-radius: 0px' : 'border-bottom-right-radius:' + borderBottomRightRadius}
               
            }

            .ant-tabs-tab {
                --ant-tabs-card-bg: ${cardBgImage || cardBgColor};
                --ant-line-width: ${isTop ? borderTopWidth || borderWidth : isBottom ? borderBottomWidth || borderWidth : isLeft ? borderLeftWidth || borderWidth : isRight ? borderRightWidth || borderWidth : isBottom};
                --ant-color-border-secondary: ${isTop ? styles.borderTopColor || borderColor : isBottom ?
                styles.borderBottomColor || borderColor : isLeft ? styles.borderLeftColor || borderColor : isRight ? styles.borderRightColor || borderColor : isBottom};
                --ant-line-type:  ${isTop ? styles.borderTopStyle || borderStyle : isBottom ? styles.borderBottomStyle || borderStyle : isLeft ?
                styles.borderLeftStyle || borderStyle : isRight ? styles.borderRightStyle || borderStyle : isBottom};
                background: ${cardBgImage || cardBgColor} !important;
                ${cardStyles};
                box-shadow: ${shadow} !important;
                z-index: 1;
                ${isLeft && 'border-right: 0px' || isRight && 'border-left: 0px' || isTop && 'border-bottom: 0px' || isBottom && 'border-top: 0px'};
            }

            .ant-tabs-tab-active {
                --ant-tabs-card-bg: ${backgroundColor || backgroundImage};
                --ant-color-bg-container: ${backgroundImage || backgroundColor};
                background: ${backgroundImage || backgroundColor} !important;
                ${cardStyles};
                width: ${cardWidth};
                height: ${cardHeight};
                min-width: ${cardMinWidth};
                min-height: ${cardMinHeight};
                max-width: ${cardMaxWidth};
                max-height: ${cardMaxHeight};
            }

            .ant-tabs-nav {
                width: ${styles.width};
                max-width: ${styles.maxWidth};
                min-width: ${styles.minWidth};
                margin: 0;
            }

            .ant-tabs-nav::before {
                --ant-line-width: ${isLeft ? borderLeftWidth || borderWidth : isRight ? borderRightWidth || borderWidth :
                isTop ? borderTopWidth || borderWidth : borderBottomWidth || borderWidth};
                --ant-color-border-secondary: ${isLeft ? styles.borderLeftColor || borderColor : isRight ? styles.borderRightColor || borderColor :
                isTop ? styles.borderTopColor || borderColor : styles.borderBottomColor || borderColor};
                --ant-line-type:  ${isLeft ? styles.borderLeftStyle || borderStyle : isRight ? styles.borderRightStyle || borderStyle :
                isTop ? styles.borderTopStyle || borderStyle : styles.borderBottomStyle || borderStyle};
           }
        `
    );

    return {
        content,
    };
});
