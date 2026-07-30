import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css }) => {
  const emptyState = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  return {
    emptyState,
  };
});
