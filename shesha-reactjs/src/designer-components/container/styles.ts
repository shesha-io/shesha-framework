import { createStyles } from '@/styles';
import { getOverflowStyle } from '../_settings/utils/overflow/util';

export const useStyles = createStyles(({ css, cx }, { radius }) => {

    const { borderRadius, borderTopRightRadius, borderBottomLeftRadius, borderTopLeftRadius, borderBottomRightRadius } = radius || {};
    const overflow = getOverflowStyle(true, false);
    const overflowStyles = {
        ...overflow
    };

    const container = cx("sha-container-component", css`
        border-radius: ${borderRadius}px;
        border-top-left-radius: ${borderTopLeftRadius}px;
        border-top-right-radius: ${borderTopRightRadius}px;
        border-bottom-left-radius: ${borderBottomLeftRadius}px;
        border-bottom-right-radius: ${borderBottomRightRadius}px;
        overflow: hidden;
        .sha-components-container-inner {
         ${overflowStyles}
        }
    `);

    return {
        container
    };
});