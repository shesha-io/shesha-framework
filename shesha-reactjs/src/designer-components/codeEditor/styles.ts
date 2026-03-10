import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const codeEditorModalBody = cx("sha-code-editor-modal-body", css`
        overflow: hidden;
        max-height: 70vh;
        .ant-tabs {
          height: 70vh;
        .ant-tabs-content-holder {
            height: 100%;
          .ant-tabs-content {
            height: 100%;
            .ant-tabs-tabpane {
              height: 100%;
              overflow: auto;
              }
            }
          }
        }
    `);
  const codeEditorModal = cx("sha-code-editor-modal", css`
        max-height: 80vh;

        > .ant-modal-footer {
          position: relative;
          background-color: inherit !important;
          z-index: 10;
        }

    `);
  const codeEditorContainer = cx("sha-code-editor-container", css`
        height: 100%;
        display: flex;
        flex-direction: column;
        > div {
          min-height: 300px;
          section {
            min-height: 300px; 
          }
        }
    `);

  const button = cx("sha-code-btn",
    css`
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-flex;
            align-items: center;
            justify-content: normal;
        `);

  return {
    codeEditorModal,
    codeEditorModalBody,
    codeEditorContainer,
    button,
  };
});
