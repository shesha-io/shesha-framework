import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {

  const formItem = cx(css`
        margin-bottom: 0px !important;
  `);
  return {
    formItem,
  };
});
