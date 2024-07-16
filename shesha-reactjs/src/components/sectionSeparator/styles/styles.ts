import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx, token }) => {
    const primaryColor = token.colorPrimary;
    const helpIcon = "help-icon-question-circle";
    const titleContainer = 'title-container';
    const shaSectionSeparator = cx("sha-section-separator", css`
        font-weight: 500;
        height: ${sheshaStyles.pageHeadingHeight}px;

        ::after {
            content: '';
            width: 100%;
            display: block;
            border-bottom: var(--border-thickness) var(--border-style) var(--border-color);
            };

        .${titleContainer} {
            display: flex;
            vertical-align: middle;
            width: 100%
        }
    `);

    return {
        shaSectionSeparator, primaryColor, helpIcon, titleContainer
    };
});