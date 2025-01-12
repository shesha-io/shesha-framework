import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { styles, cardStyles }) => {

    const borderTop = `${styles.borderTopWidth ?? styles.borderWidth} ${styles.borderTopStyle ?? styles.borderStyle} ${styles.borderTopColor ?? styles.borderColor}`;
    const borderBottom = `${styles.borderBottomWidth ?? styles.borderWidth} ${styles.borderBottomStyle ?? styles.borderStyle} ${styles.borderBottomColor ?? styles.borderColor}`;
    const borderLeft = `${styles.borderLeftWidth ?? styles.borderWidth} ${styles.borderLeftStyle ?? styles.borderStyle} ${styles.borderLeftColor ?? styles.borderColor}`;
    const borderRight = `${styles.borderRightWidth ?? styles.borderWidth} ${styles.borderRightStyle ?? styles.borderStyle} ${styles.borderRightColor ?? styles.borderColor}`;
    const border = `${styles.borderWidth} ${styles.borderStyle} ${styles.borderColor}`;

    const { width, height, minHeight, maxWidth, maxHeight, minWidth, ...rest } = styles;
    const { width: cardWidth, height: cardHeight, minHeight: cardMinHeight, maxWidth: cardMaxWidth, maxHeight: cardMaxHeight, minWidth: cardMinWidth } = cardStyles;

    const content = cx("tab-content-holder", css`
        .ant-tabs-content-holder {
            --ant-tabs-card-bg: ${styles.backgroundImage || styles.backgroundColor};
            background: ${styles.backgroundImage || styles.backgroundColor} !important; // Fallback
            ${styles}
            
            border: ${border} !important;
            border-left: ${borderLeft};
            border-right: ${borderRight};
            border-bottom: ${borderBottom};
            border-top: ${borderTop};
            padding-top: 15px !important;
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
        }

        .ant-tabs-tab {
            --ant-tabs-card-bg: ${cardStyles.backgroundImage || cardStyles.backgroundColor};
            background: ${cardStyles.backgroundImage || cardStyles.backgroundColor} !important; // Fallback
             ${cardStyles};
            box-shadow: ${styles.shadow} !important;
            border: ${border || borderTop} !important;
            z-index: 1;
            // border-bottom: none !important;
        }

        .ant-tabs-tab-active {
            --ant-tabs-card-bg: ${styles.background || styles.backgroundColor};
            background: ${styles.backgroundImage || styles.backgroundColor} !important;
            ${rest};
            width: ${cardWidth};
            height: ${cardHeight};
            min-width: ${cardMinWidth};
            min-height: ${cardMinHeight};
            max-width: ${cardMaxWidth};
            max-height: ${cardMaxHeight};
            border-bottom: none !important;
        }

        .ant-tabs-nav {
            width: ${width};
            max-width: ${maxWidth};
            min-width: ${minWidth};
            margin: 0;
        }

        .ant-tabs-nav::before {
            border-bottom: ${borderTop === '1px solid #d9d9d9' ? border : borderTop} !important;
        }
  `);
    return {
        content,
    };
});