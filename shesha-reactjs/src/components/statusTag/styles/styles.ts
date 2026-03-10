import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx }) => {
  const shaStatusTag = cx("sha-status-tag", css`
    text-transform: uppercase;
    text-align: center;
    margin: 3px 0;
    align-self: center;
    margin: 0 ${sheshaStyles.paddingMD}px !important;   
  `);
  return {
    shaStatusTag,
  };
});
