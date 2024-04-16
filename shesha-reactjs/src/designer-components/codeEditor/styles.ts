import { createStyles } from "antd-style";

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
    return {
        codeEditorModal,
        codeEditorModalBody,
        codeEditorContainer,
    };
});