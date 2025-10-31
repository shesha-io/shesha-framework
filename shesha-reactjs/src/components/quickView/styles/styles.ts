import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const innerEntityReferenceSpanBoxStyle = cx('sha-quick-view-inner-entity-reference-span-box', css`
    width: 100%;
    margin: 0;
    padding: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    flex-basis: fit-content;
  `);


  const innerEntityReferenceButtonBoxStyle = cx('sha-quick-view-inner-entity-reference-button-box', css`
    background-color: transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
  `);

  const spin = cx('sha-quick-view-spin', css`
    margin-right: 8px;
    display: inline-block;
    vertical-align: middle;
  `);

  const inlineBlock = cx('sha-quick-view-inline-block', css`
    display: inline-block;
    vertical-align: middle;
  `);

  const quickViewContent = cx('sha-quick-view-content', css`
    /* Force text wrapping for all form elements */
    .ant-form-item-control-input-content {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
      max-width: 100%;
      overflow: hidden;
    }

    /* Handle long text in readonly display items */
    .sha-display-form-item .sha-display-form-item-wrapper {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
      max-width: 100%;
      overflow: hidden;
    }

    /* Handle spans and text content */
    span:not(.anticon):not(.ant-select-selection-item) {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
      max-width: 100%;
    }

    /* Handle input fields */
    .ant-input,
    .ant-input-number-input,
    .ant-select-selection-item {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
    }

    /* Handle long URLs and links */
    a {
      word-break: break-all !important;
      overflow-wrap: break-word !important;
      max-width: 100%;
    }

    /* Ensure proper form layout doesn't break */
    .ant-form-item {
      overflow: hidden;
    }

    .ant-form-item-label {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
    }
  `);

  return {
    innerEntityReferenceSpanBoxStyle,
    innerEntityReferenceButtonBoxStyle,
    spin,
    inlineBlock,
    quickViewContent,
  };
});
