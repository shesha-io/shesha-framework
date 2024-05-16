import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx}) => {

    const shaSidebarEditModeContainer = cx("sha-sidebar-edit-mode-container", css`
        width: 100%;
        height: 100vh;
        border: 2px solid #10239e;
        position: absolute;
        top: 0;
        transition: .3s;
        z-index: 6;
        & > :last-child {
            position: absolute;
            bottom: 0;
            background-color: #10239e;
            padding: 10px;
            width: 100%;
            cursor: pointer;
            transition: .3s;
        }
    `);

    return {
        shaSidebarEditModeContainer
    };
});
