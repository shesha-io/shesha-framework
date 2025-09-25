import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const codeEditorModalBody = cx("sha-code-editor-modal-body", css`
        overflow-x: auto;
    `);
  const codeEditorModal = cx("sha-code-editor-modal", css`
        width: 70vw;
    `);
  const codeEditorContainer = cx("sha-code-editor-container", css`
        height: 70vh;
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
