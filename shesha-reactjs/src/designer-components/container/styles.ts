import { createStyles } from '@/styles';
import { getOverflowStyle } from '../_settings/utils/overflow/util';

export const useStyles = createStyles(({ css, cx }, { radius }) => {

    const overflow = getOverflowStyle(true, false);
    const overflowStyles = {
        ...overflow
    };

    const container = cx("sha-container-component", css`
        ${radius}
        overflow: hidden;
        .sha-components-container-inner {
         ${overflowStyles}
        }
    `);

    return {
        container
    };
});