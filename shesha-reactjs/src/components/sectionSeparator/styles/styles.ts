import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, token }) => {
    const primaryColor = token.colorPrimary;
    const helpIcon = "help-icon-question-circle";
    const shaSectionSeparator = cx("sha-section-separator", css`
        font-weight: 500;
        height: ${sheshaStyles.pageHeadingHeight}px;

        .${helpIcon} {
            fontSize: 14;
            color: #aaa !important;
            margin: auto;
        };

        ::after {
            content: '';
            width: 100%;
            display: block;
            border-bottom: var(--border-thickness) var(--border-style) var(--border-color);
            };
    `);

    return {
        shaSectionSeparator, primaryColor, helpIcon
    };
});