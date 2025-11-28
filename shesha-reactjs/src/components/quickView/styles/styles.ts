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
    padding: 0;
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
      align-items: center;
      justify-content: flex-end;

      > label {
        display: flex;
        align-items: center;
        height: 100%;
      }
    }

    .ant-form-item-control {
      .read-only-display-form-item {
        white-space: normal !important;
        word-wrap: break-word;
        overflow-wrap: break-word;
        word-break: break-all;

        > div {
          white-space: normal !important;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-all;
          height: auto !important;
          min-height: 32px;

          > div {
            white-space: normal !important;
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-all;
            flex: auto !important;
          }
        }
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
