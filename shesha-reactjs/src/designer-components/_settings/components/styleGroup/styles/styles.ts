import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {

    const collapseHeader = cx(css`
       .ant-collapse-header-text {
       line-height: 1.5;
       min-height: 0px !important;
       height: 15px !important;
       }
    `);

    return {
        collapseHeader
    };
});