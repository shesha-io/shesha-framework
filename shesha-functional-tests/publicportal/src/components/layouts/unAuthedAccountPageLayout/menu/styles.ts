import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx, prefixCls }) => {
  const shaMenu = cx(
    `${prefixCls}-menu`,
    css`
      max-width: 800px;

      @media (max-width: 1600px) {
        max-width: 600px;
      }

      @media (max-width: 1400px) {
        max-width: 450px;
      }
    `
  );

  return {
    shaMenu,
  };
});
