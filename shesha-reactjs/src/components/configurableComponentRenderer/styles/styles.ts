import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, token }) => {
  const shaSidebarEditModeContainer = cx("sha-sidebar-edit-mode-container", css`
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        transition: .3s;
        z-index: 6;
        overflow: hidden;
        & > :last-child {
            position: fixed;
            display: flex;
            flex-direction: row;
            justify-content: center;
            bottom: 0;
            background-color: ${token.colorPrimary};
            padding: 13px;
            width: auto;
            cursor: pointer;
            transition: .3s;
            border-radius: 5px;
            width: 50px;
            height: 50px;
            margin: 5px;
        }
    `);

  return {
    shaSidebarEditModeContainer,
  };
});
