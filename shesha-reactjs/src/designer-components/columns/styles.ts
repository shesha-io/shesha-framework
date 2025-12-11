import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
    const columns = cx(`sha-columns`, css`
       >.${prefixCls}-row {
        max-width: 100%;
       }
    `);


    return {
        columns
    };
});