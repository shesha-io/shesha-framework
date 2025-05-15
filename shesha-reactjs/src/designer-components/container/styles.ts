import { createStyles, sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {

    const container = cx("sha-container-component", css`
        .sha-components-container-inner {
         ${sheshaStyles.thinScrollbars}
        }   
    `);

    return {
        container
    };
});