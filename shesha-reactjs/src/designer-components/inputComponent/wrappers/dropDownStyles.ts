import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const optionLabel = cx(css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
  `);

  return {
    optionLabel,
  };
});
