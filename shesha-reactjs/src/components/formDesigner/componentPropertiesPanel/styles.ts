import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css }) => {
  const emptyState = css`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  `;

  const notOnCanvas = css`
    padding: 12px;
    opacity: 0;
    animation: sha-not-on-canvas-in 0s linear 300ms forwards;

    @keyframes sha-not-on-canvas-in {
      to { opacity: 1; }
    }
  `;

  return {
    emptyState,
    notOnCanvas,
  };
});
