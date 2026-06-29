import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css }) => {
  const innerEntityReferenceSpanBoxStyle = css`
    width: 100%;
    margin: 0;
    padding: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    flex-basis: fit-content;
  `;


  const innerEntityReferenceButtonBoxStyle = css`
    background-color: transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0 11px;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
  `;

  const spin = css`
    margin-right: 8px;
    display: inline-block;
    vertical-align: middle;
  `;

  const inlineBlock = css`
    display: inline-block;
    vertical-align: middle;
  `;

  const formLabel = css`
    .ant-form-item-label {
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;

      > label {
        height: auto;
        white-space: normal;
        text-align: right;
        padding-top: 4px;
      }
    }

    .ant-form-item-control-input-content {
      .read-only-display-form-item {
        width: 100%;
        max-width: 100%;
        height: auto;
        overflow: visible;
      }

      .read-only-display-form-item > *:not(.ant-tag):not([data-tag-wrapper="true"]) {
        overflow: visible;
        text-overflow: clip;
        white-space: normal !important;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
    }
  `;

  return {
    innerEntityReferenceSpanBoxStyle,
    innerEntityReferenceButtonBoxStyle,
    spin,
    inlineBlock,
    formLabel,
  };
});
