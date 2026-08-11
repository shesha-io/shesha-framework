import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, token }) => {
  const subFormError = css`
    display: flex;
    align-items: center;
    min-height: 60px;
    padding: ${token.paddingSM}px;
    border: 1px dashed ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    .ant-alert {
      width: 100%;
    }
  `;

  return { subFormError };
});
