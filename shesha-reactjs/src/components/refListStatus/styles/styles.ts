import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const shaStatusTag = "sha-status-tag";
    const shaStatusTagContainer = cx("sha-status-tag-container", css`
        display: flex;
        align-items: center;
      
        .${shaStatusTag} {
          text-transform: uppercase;
          text-align: center;
          align-self: center;
          display: flex;
          width: fit-content;
          justify-content: flex-start;
          align-items: center;
          text-align: center;
          align-self: center;
          margin: 0px 8px !important;
      
          .sha-help-icon {
            cursor: help;
            font-size: 14px;
            color: #ad393981;
          }
        }
    `);
    return {
        shaStatusTagContainer,
        shaStatusTag,
    };
});