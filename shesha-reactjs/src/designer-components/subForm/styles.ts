import { createStyles } from '@/styles';

export const useStyles = createStyles(({ cx, css, token }) => {
  const shaSubFormContainer = cx("sub-form-container", css`
    margin: 0px;
  `);

  const shaSubFormError = cx("sha-sub-form-error", css`
    display: flex;
    align-items: center;
    min-height: 60px;
    padding: ${token.paddingSM}px;
    border: 1px dashed ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    .ant-alert {
      width: 100%;
    }
  `);

  return { shaSubFormError, shaSubFormContainer };
});
