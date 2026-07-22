import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const imageWrapper = cx("sha-image-wrapper", css`
    position: relative;
    float: left;
    width: 100%; 
  `);

  return {
    imageWrapper,
  };
});
