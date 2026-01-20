import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
   const shaStatusTag = cx("sha-status-tag", css`
    text-transform: uppercase;
    text-align: center;
    margin: 3px 0;
    align-self: center;  
  `); 
  return {
    shaStatusTag,
  };
});