import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const cmoponentErrorInfo = cx("component-error-info", css`
    .ant-tooltip-inner {
      background: var(--ant-color-info-bg);
      color: var(--ant-color-info-text);
      border: var(--ant-line-width) var(--ant-line-type) var(--ant-color-info-border);
    }
    .ant-tooltip-arrow:before {
      background: var(--ant-color-info-bg);
    }
  `);
  const cmoponentErrorWaring = cx("component-error-warning", css`
    .ant-tooltip-inner {
      background: var(--ant-color-warning-bg);
      color: var(--ant-color-warning-text);
      border: var(--ant-line-width) var(--ant-line-type) var(--ant-color-warning-border);
    }
    .ant-tooltip-arrow:before {
      background: var(--ant-color-warning-bg);
    }
  `);
  const cmoponentErrorError = cx("component-error-error", css`
    .ant-tooltip-inner {
      background: var(--ant-color-error-bg);
      color: var(--ant-color-error-text);
      border: var(--ant-line-width) var(--ant-line-type) var(--ant-color-error-border);
    }
    .ant-tooltip-arrow:before {
      background: var(--ant-color-error-bg);
    }
  `);

  const cmoponentErrorTextInfo = cx("component-error-text-info", css`
    color: var(--ant-color-info-text);
  `);
  const cmoponentErrorTextWaring = cx("component-error-text-warning", css`
    color: var(--ant-color-warning-text);
  `);
  const cmoponentErrorTextError = cx("component-error-text-error", css`
    color: var(--ant-color-error-text);
  `);

  return {
    cmoponentErrorInfo,
    cmoponentErrorWaring,
    cmoponentErrorError,
    cmoponentErrorTextInfo,
    cmoponentErrorTextWaring,
    cmoponentErrorTextError,
  };
});
