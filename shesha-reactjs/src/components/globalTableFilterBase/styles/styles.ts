import { createStyles } from "antd-style";
import { sheshaStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx, responsive }) => {
    const shaGlobalTableFilter = cx("sha-global-table-filter", css`
    padding-right: ${sheshaStyles.paddingLG}px;
    width: 350px;
  
    ${responsive.lg} {
        width: 55%;
    }
    ${responsive.sm} {
        padding-right: 0;
        width: 100%;
    }
  `); 
  return {
    shaGlobalTableFilter
  };
});