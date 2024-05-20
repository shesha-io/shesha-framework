import { colors } from "@/styles/variables";
import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const shaMainLayout = cx(
    `${prefixCls}-layout`,
    css`
      * {
        font-family: "Roboto", sans-serif;
      }

      min-height: 100vh;
      overflow: auto;

      .${prefixCls}-layout-header {
        border: none;
        box-shadow: 1px 1px 5px 2px ${colors.grey};
        display: flex;
        justify-content: space-between;
        background: #fff;
        height: auto;
        border-bottom: 1px solid #d9d9d9;
        line-height: 80px;
        padding: 0 10%;
        overflow: hidden;
      }

      .${prefixCls}-layout-content {
        padding: 50px 15%;
        overflow: hidden;
      }
    `
  );

  return {
    shaMainLayout,
  };
});
