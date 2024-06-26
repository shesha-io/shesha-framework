import { createStyles } from '@/styles';
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, token }) => {
    const shaSectionSeparator = cx("sha-section-separator", css`
        border-bottom: 2px solid ${token.colorPrimary};
        font-weight: 500;
        margin-bottom: ${sheshaStyles.paddingMD}px;
    `);

    return {
        shaSectionSeparator
    };
});