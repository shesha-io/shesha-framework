import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, token }) => {
  return {
    horizontalLayout: css`
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    `,

    header: css`
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding: 0;
      height: auto;
      min-height: 64px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 100;
      position: relative;

      .ant-layout-header {
        padding: 0;
        height: auto;
        line-height: normal;
      }
    `,

    headerContent: css`
      display: flex;
      align-items: center;
      min-height: 64px;
      padding: 0 ${token.paddingLG}px;
      width: 100%;
    `,

    content: css`
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      
      .ant-layout-content {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    `,

    layoutHeading: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: ${token.padding}px ${token.paddingLG}px;
      background: ${token.colorBgContainer};
      border-bottom: 1px solid ${token.colorBorder};
      margin-bottom: 0;

      &.has-heading {
        margin-bottom: ${token.marginMD}px;
      }

      &.fixed-heading {
        position: sticky;
        top: 0;
        z-index: 99;
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 0;
        flex: 1;
      }
    `,

    layoutBackground: css`
      flex: 1;
      padding: ${token.paddingLG}px;
      background: ${token.colorBgLayout};
      min-height: 0;

      &.has-heading {
        padding-top: 0;
      }

      &.fixed-heading {
        padding-top: ${token.paddingLG}px;
      }
    `,

    layoutBackgroundNoPadding: css`
      padding: 0;
    `,

    footer: css`
      padding: ${token.paddingMD}px ${token.paddingLG}px;
      background: ${token.colorBgContainer};
      border-top: 1px solid ${token.colorBorder};
      margin-top: auto;
      height: auto;
      min-height: fit-content;
      
      &:empty {
        display: none;
      }
    `,
  };
});
