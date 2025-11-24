import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const componentErrorInfo = cx("component-error-info", css`
    .ant-tooltip-inner {
      background: var(--ant-color-info-bg);
      color: var(--ant-color-info-text);
      border: var(--ant-line-width) var(--ant-line-type) var(--ant-color-info-border);
    }
    .ant-tooltip-arrow:before {
      background: var(--ant-color-info-bg);
    }
  `);
  const componentErrorWaring = cx("component-error-warning", css`
    .ant-tooltip-inner {
      background: var(--ant-color-warning-bg);
      color: var(--ant-color-warning-text);
      border: var(--ant-line-width) var(--ant-line-type) var(--ant-color-warning-border);
    }
    .ant-tooltip-arrow:before {
      background: var(--ant-color-warning-bg);
    }
  `);
  const componentErrorError = cx("component-error-error", css`
    .ant-tooltip-inner {
      background: var(--ant-color-error-bg);
      color: var(--ant-color-error-text);
      border: var(--ant-line-width) var(--ant-line-type) var(--ant-color-error-border);
    }
    .ant-tooltip-arrow:before {
      background: var(--ant-color-error-bg);
    }
  `);

  const componentErrorTextInfo = cx("component-error-text-info", css`
    color: var(--ant-color-info-text);
  `);
  const componentErrorTextWaring = cx("component-error-text-warning", css`
    color: var(--ant-color-warning-text);
  `);
  const componentErrorTextError = cx("component-error-text-error", css`
    color: var(--ant-color-error-text);
  `);

  return {
    componentErrorInfo,
    componentErrorWaring,
    componentErrorError,
    componentErrorTextInfo,
    componentErrorTextWaring,
    componentErrorTextError,
  };
});
