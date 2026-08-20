import { createStyles } from '@/styles';

export const useStyles = createStyles(({ cx, css, token }) => {
  const shaSubFormContainer = cx("sub-form-container", css`
    margin: 0px;
  `);

  const shaSubFormPlaceholder = cx("sha-sub-form-placeholder", css`
    display: flex;
    align-items: center;
    gap: ${token.paddingXS}px;
    min-height: 60px;
    padding: ${token.paddingSM}px;
    border: 1px dashed ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    color: ${token.colorTextSecondary};
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

  return { shaSubFormError, shaSubFormPlaceholder, shaSubFormContainer };
});
