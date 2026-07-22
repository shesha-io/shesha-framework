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

  const componentErrorContainer = cx("component-error-container", css`
    padding: 12px 16px;
    border-radius: 6px;
    border: var(--ant-line-width) var(--ant-line-type);
    margin: 8px 0;
  `);

  const componentErrorHeader = cx("component-error-header", css`
    display: flex;
    align-items: center;
    gap: 8px;
  `);

  const componentErrorMessage = cx("component-error-message", css`
    flex: 1;
  `);

  const componentErrorButton = cx("component-error-button", css`
    padding: 0;
    height: auto;
  `);

  const componentErrorList = cx("component-error-list", css`
    margin: 8px 0 0 0;
    padding-left: 28px;
    list-style-type: disc;
  `);

  const errorIcon = cx("error-icon", css`
    color: var(--ant-color-error);
    font-size: 16px;
  `);

  const warningIcon = cx("warning-icon", css`
    color: var(--ant-color-warning);
    font-size: 16px;
  `);

  const infoIcon = cx("info-icon", css`
    color: var(--ant-color-info);
    font-size: 16px;
  `);

  const componentErrorTextInfo = cx("component-error-text-info", css`
    background: var(--ant-color-info-bg);
    border-color: var(--ant-color-info-border);
  `);
  const componentErrorTextWaring = cx("component-error-text-warning", css`
    background: var(--ant-color-warning-bg);
    border-color: var(--ant-color-warning-border);
  `);
  const componentErrorTextError = cx("component-error-text-error", css`
    background: var(--ant-color-error-bg);
    border-color: var(--ant-color-error-border);
  `);

  return {
    componentErrorInfo,
    componentErrorWaring,
    componentErrorError,
    componentErrorContainer,
    componentErrorHeader,
    componentErrorMessage,
    componentErrorButton,
    componentErrorList,
    errorIcon,
    warningIcon,
    infoIcon,
    componentErrorTextInfo,
    componentErrorTextWaring,
    componentErrorTextError,
  };
});
