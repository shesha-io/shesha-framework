import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, }) => {

    const searchField = cx(css`
        width: 100%;
        background: #fff;
        `);

    const content = cx(css`
            .ant-tabs-tab, .ant-tabs-nav-operations {
                height: 24px;
            }

            .ant-tabs-tab {
                --ant-tabs-card-padding-sm: 0 8px;
            }
        `);

    return {
        searchField,
        content
    };
});