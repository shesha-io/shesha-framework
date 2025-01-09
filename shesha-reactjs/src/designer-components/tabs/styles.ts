import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { styles }) => {
    const content = cx("tab-content-holder", css`
        .ant-tabs-content-holder {
           background: ${styles.background.color} !important;
           
           paddingTop: 15px !important;
        }
        .ant-tabs-tab {
            background:  ${styles.background.color} !important;
        }

        .ant-tabs-nav {
            margin: 0;
        }
  `);
    return {
        content,
    };
});