import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }, { styles, cardStyles, position = 'top', tabType, tabLineColor }) => {
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
        marginTop = '0px',
        marginBottom = '0px',
        marginRight = '0px',
        marginLeft = '0px',
        paddingTop = '0px',
        paddingRight = '0px',
        paddingLeft = '0px',
        paddingBottom = '0px',
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
        fontSize,
        fontWeight,
        textAlign,
        color,
        fontFamily,
        ...rest
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
        borderTopLeftRadius: cardTopLeftRadius,
        borderTopRightRadius: cardTopRightRadius,
        borderBottomRightRadius: cardBottomRightRadius,
        borderBottomLeftRadius: cardBottomLeftRadius,
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

    const content = cx(
        'content',
        css`
            --ant-tabs-horizontal-margin: 0 !important;
            height: max-content;
            margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important;

            &.ant-tabs-left , &.ant-tabs-right {
                height: ${styles.height || 'auto'} !important;
                min-height: ${styles.minHeight || 'auto'} !important;
                max-height: ${styles.maxHeight || 'auto'} !important;
            }

            .ant-tabs-content-holder {
                --ant-tabs-card-bg: ${backgroundImage || backgroundColor};
                ${rest};
                border: ${borderMap.default};
                box-shadow: ${boxShadow} !important;
                border-left: ${isLeft ? '0px solid transparent' : borderMap.left} !important;
                border-right:${isRight ? '0px solid transparent' : borderMap.right} !important;
                border-bottom      : ${isBottom ? 'none' : borderMap.bottom} !important;
                border-top: ${isTop ? 'none' : borderMap.top} !important;
                background: ${backgroundImage || backgroundColor} !important;
                ${isTop || isLeft ? 'border-top-left-radius: 0px;' : `border-top-left-radius: ${borderTopLeftRadius};`}
                ${isTop || isRight ? 'border-top-right-radius: 0px;' : `border-top-right-radius: ${borderTopRightRadius};`}
                ${isBottom || isLeft ? 'border-bottom-left-radius: 0px;' : `border-bottom-left-radius: ${borderBottomLeftRadius};`}
                ${isBottom || isRight ? 'border-bottom-right-radius: 0px;' : `border-bottom-right-radius: ${borderBottomRightRadius};`}
                padding: ${paddingTop} ${paddingRight} ${paddingBottom} ${paddingLeft} !important;
                background-size: ${backgroundSize} !important;
                background-position: ${backgroundPosition} !important;
                background-repeat: ${backgroundRepeat} !important;

                .ant-tabs-content {
                overflow: auto;
                scrollbar-width: thin;
                ::-webkit-scrollbar { 
                    width: 8px;
                    background-color: transparent;
                }
                    
                height: 100%;
                width: 100%;
            }

            .ant-tabs-tab {
                --ant-tabs-card-bg: ${cardBgImage || cardBgColor};
                ${color && `--ant-tabs-item-hover-color: ${color} !important`};
                ${color && `--ant-tabs-item-active-color: ${color} !important`};
                --ant-line-width: ${isTop ? borderTopWidth || borderWidth : isBottom ? borderBottomWidth || borderWidth : isLeft ? borderLeftWidth || borderWidth : isRight ? borderRightWidth || borderWidth : isBottom};
                --ant-color-border-secondary: ${isTop ? styles.borderTopColor || borderColor : isBottom ?
                styles.borderBottomColor || borderColor : isLeft ? styles.borderLeftColor || borderColor : isRight ? styles.borderRightColor || borderColor : isBottom};
                --ant-line-type:  ${isTop ? styles.borderTopStyle || borderStyle : isBottom ? styles.borderBottomStyle || borderStyle : isLeft ?
                styles.borderLeftStyle || borderStyle : isRight ? styles.borderRightStyle || borderStyle : isBottom};
                background: ${cardBgImage || cardBgColor} !important;
                ${cardStyles};
                background-repeat: ${cardStyles.backgroundRepeat} !important;
                background-size: ${cardStyles.backgroundSize} !important;
                background-position: ${cardStyles.backgroundPosition} !important;
                box-shadow: ${tabType === 'card' && boxShadow} !important;
                ${isLeft && 'border-right-width: 0px !important' || isRight && 'border-left-width: 0px !important' || isTop && 'border-bottom-width: 0px !important' || isBottom && 'border-top-width: 0px !important'};
                 border-radius: ${isTop ? `${cardTopLeftRadius} ${cardTopRightRadius} 0px 0px` :
                isBottom ? `0px 0px ${cardBottomLeftRadius} ${cardBottomRightRadius}` :
                    isLeft ? `${cardTopRightRadius} 0px 0px ${cardBottomRightRadius}` :
                        isRight ? `0px ${cardTopLeftRadius} ${cardBottomLeftRadius} 0px` : cardStyles.borderRadius};

                .ant-tabs-tab-btn {
                    width: 100%;
                }
            }

            .ant-tabs-tab-active {
                --primary-color: ${token.colorPrimary} !important;
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

                .ant-tabs-tab-btn {
                color: ${color ?? token.colorPrimary} !important;
                font-size: ${fontSize} !important;
                font-weight: ${fontWeight} !important;
                font-family: ${fontFamily} !important;
                text-align: ${textAlign} !important;
                width: 100%;
                }
            }

            .ant-tabs-nav {
                --ant-tabs-ink-bar-color: ${tabLineColor || token.colorPrimary} !important;
                margin: 0;
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
                ${(isLeft || isRight) && `
                    height: ${styles.height} !important;
                    min-height: ${styles.minHeight} !important;
                    max-height: ${styles.maxHeight} !important;
                `};

           }
        `
    );

    return {
        content,
    };
});
