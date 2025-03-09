import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, { styles, cardStyles, position = 'top', tabType }) => {
    const {
        borderWidth,
        borderStyle,
        borderColor,
        borderTopWidth,
        borderBottomWidth,
        borderRightWidth,
        borderLeftWidth,
        backgroundColor,
        backgroundImage,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
        boxShadow,
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        marginTop = '0px',
        marginBottom = '0px',
        marginRight = '-1px',
        marginLeft = '-1px',
        paddingTop = '0px',
        paddingRight = '0px',
        paddingLeft = '0px',
        paddingBottom = '0px',
        overflow,
        fontSize,
        fontWeight,
        color,
        fontFamily,
        rest
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
        const width = `${side}Width`;
        const style = `${side}Style`;
        const color = `${side}Color`;
        return `${styles[width] ?? borderWidth} ${styles[style] ?? borderStyle} ${styles[color] ?? borderColor}`;
    };

    const borderMap = {
        top: getBorder('borderTop'),
        bottom: getBorder('borderBottom'),
        left: getBorder('borderLeft'),
        right: getBorder('borderRight'),
        default: `${borderWidth} ${borderStyle} ${borderColor}`,
    };

    const borderTopLeftRadius = styles.borderRadius?.split(' ')[0] || 0;
    const borderTopRightRadius = styles.borderRadius?.split(' ')[1] || 0;
    const borderBottomRightRadius = styles.borderRadius?.split(' ')[2] || 0;
    const borderBottomLeftRadius = styles.borderRadius?.split(' ')[3] || 0;

    const cardTopLeftRadius = cardStyles.borderRadius?.split(' ')[0] || 0;
    const cardTopRightRadius = cardStyles.borderRadius?.split(' ')[1] || 0;
    const cardBottomRightRadius = cardStyles.borderRadius?.split(' ')[2] || 0;
    const cardBottomLeftRadius = cardStyles.borderRadius?.split(' ')[3] || 0;

    const content = cx(
        'content',
        css`
            .ant-tabs-content-holder {
                --ant-tabs-card-bg: ${backgroundImage || backgroundColor};
                border: ${borderMap.default};
                ${rest};
                box-shadow: ${boxShadow} !important;
                width: ${width};
                max-width: ${isLeft || isRight ? width : maxWidth};
                min-width: ${minWidth};
                height: ${height};
                max-height: ${maxHeight};
                min-height: ${minHeight};
                border-left: ${isLeft ? '0px solid transparent' : borderMap.left} !important;
                border-right:${isRight ? '0px solid transparent' : borderMap.right} !important;
                border-bottom: ${isBottom ? 'none' : borderMap.bottom} !important;
                border-top: ${isTop ? 'none' : borderMap.top} !important;
                background: ${backgroundImage || backgroundColor} !important;
                margin: ${isTop ? `0 ${marginRight} ${marginBottom} ${marginLeft}` : isBottom ? `${marginTop} ${marginRight} 0 ${marginLeft}` : isLeft ? `${marginTop} ${marginRight} ${marginBottom} 0` : `${marginTop} 0 ${marginBottom} ${marginLeft}`};
                ${isTop || isLeft ? 'border-top-left-radius: 0px;' : `border-top-left-radius: ${borderTopLeftRadius};`}
                ${isTop || isRight ? 'border-top-right-radius: 0px;' : `border-top-right-radius: ${borderTopRightRadius};`}
                ${isBottom || isLeft ? 'border-bottom-left-radius: 0px;' : `border-bottom-left-radius: ${borderBottomLeftRadius};`}
                ${isBottom || isRight ? 'border-bottom-right-radius: 0px;' : `border-bottom-right-radius: ${borderBottomRightRadius};`}
                padding: ${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft} !important;
                background-size: ${backgroundSize} !important;
                background-position: ${backgroundPosition} !important;
                background-repeat: ${backgroundRepeat} !important;
                overflow: ${overflow} !important;
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
                box-shadow: ${tabType === 'card' && boxShadow} !important;
                ${isLeft && 'border-right-width: 0px !important' || isRight && 'border-left-width: 0px !important' || isTop && 'border-bottom-width: 0px !important' || isBottom && 'border-top-width: 0px !important'};
                 border-radius: ${isTop ? `${cardTopLeftRadius} ${cardTopRightRadius} 0px 0px` :
                isBottom ? `0px 0px ${cardBottomLeftRadius} ${cardBottomRightRadius}` :
                    isLeft ? `${cardTopRightRadius} 0px 0px ${cardBottomRightRadius}` :
                        isRight ? `0px ${cardTopLeftRadius} ${cardBottomLeftRadius} 0px` : cardStyles.borderRadius};
            }

            .ant-tabs-tab-active {
                --ant-tabs-card-bg: ${backgroundColor || backgroundImage};
                --ant-color-bg-container: ${backgroundColor || backgroundImage};
                --ant-line-width: ${isTop ? borderTopWidth || borderWidth : isBottom ? borderBottomWidth || borderWidth : isLeft ? borderLeftWidth || borderWidth : isRight ? borderRightWidth || borderWidth : isBottom};
                --ant-color-border-secondary: ${isTop ? styles.borderTopColor || borderColor : isBottom ?
                styles.borderBottomColor || borderColor : isLeft ? styles.borderLeftColor || borderColor : isRight ? styles.borderRightColor || borderColor : isBottom};
                --ant-line-type:  ${isTop ? styles.borderTopStyle || borderStyle : isBottom ? styles.borderBottomStyle || borderStyle : isLeft ?
                styles.borderLeftStyle || borderStyle : isRight ? styles.borderRightStyle || borderStyle : isBottom};
                --ant-color-bg-container: ${backgroundImage || backgroundColor};
                background: ${tabType === 'card' ? backgroundImage || backgroundColor : ''} !important;
                ${cardStyles};
                ${isLeft && `border-right-width: ${styles.borderLeftWidth} !important` || isRight && 'border-left-width: 0px !important' || isTop && 'border-bottom-width: 0px !important' || isBottom && 'border-top-width: 0px !important'};
                ${isLeft ? `margin-right: calc(var(--ant-line-width) * -1) !important` : isRight ? `margin-left: calc(var(--ant-line-width) * -1) !important` : isTop ? `margin-bottom: 0` : `margin-top: 0`};
                width: ${cardWidth};
                height: ${cardHeight};
                min-width: ${cardMinWidth};
                min-height: ${cardMinHeight};
                max-width: ${cardMaxWidth};
                max-height: ${cardMaxHeight};
                z-index: 2;

                * {
                color: ${color ?? token.colorPrimary} !important;
                font-size: ${fontSize} !important;
                font-weight: ${fontWeight} !important;
                font-family: ${fontFamily} !important;
                }
            }

            .ant-tabs-nav {
                margin: 0;
                width: ${isTop || isBottom ? width : 'auto'};
                height: ${isTop || isBottom ? 'auto' : height};
                max-width: ${isTop || isBottom ? maxWidth : 'auto'};
                max-height: ${isTop || isBottom ? 'auto' : maxHeight};
                min-width: ${isTop || isBottom ? minWidth : '0'};
                min-height: ${isTop || isBottom ? '0' : minHeight};
                margin: ${isTop ? `${marginTop} ${marginRight} 0 ${marginLeft}` : isBottom ? `0 ${marginRight} ${marginBottom} ${marginLeft}` : isLeft ? `${marginTop} 0 ${marginBottom} ${marginLeft}` : `${marginTop} ${marginRight} ${marginBottom} 0`};
            }

            .ant-tabs-nav::before {
                --ant-line-width: ${isLeft ? borderLeftWidth || borderWidth : isRight ? borderRightWidth || borderWidth :
                isTop ? borderTopWidth || borderWidth : borderBottomWidth || borderWidth};
                --ant-color-border-secondary: ${isLeft ? styles.borderLeftColor || borderColor : isRight ? styles.borderRightColor || borderColor :
                isTop ? styles.borderTopColor || borderColor : styles.borderBottomColor || borderColor};
                --ant-line-type:  ${isLeft ? styles.borderLeftStyle || borderStyle : isRight ? styles.borderRightStyle || borderStyle :
                isTop ? styles.borderTopStyle || borderStyle : styles.borderBottomStyle || borderStyle};
           }

           .ant-tabs-nav-list {
                ${isLeft && `border-right: ${borderMap.left}` || isRight && `border-left: ${borderMap.right}`};
           }
        `
    );

    return {
        content,
    };
});
