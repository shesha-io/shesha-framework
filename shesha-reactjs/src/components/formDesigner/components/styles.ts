import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const settingsFormItem = cx(css`
        margin: 0px !important;
    }
  `);
  return {
    settingsFormItem,
  };
});
