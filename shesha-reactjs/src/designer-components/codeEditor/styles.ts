import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const codeEditorModalBody = cx("sha-code-editor-modal-body", css`
        overflow: auto;
        max-height: 70vh;
    `);
  const codeEditorModal = cx("sha-code-editor-modal", css`
        max-height: 80vh;
    `);
  const codeEditorContainer = cx("sha-code-editor-container", css`
        height: 65vh;
    `);

  const button = cx("sha-code-btn",
    css`
            overflow: hidden;
            text-overflow: ellipsis;
            display: inline-flex;
            align-items: center;
        `);

  return {
    codeEditorModal,
    codeEditorModalBody,
    codeEditorContainer,
    button,
  };
});
