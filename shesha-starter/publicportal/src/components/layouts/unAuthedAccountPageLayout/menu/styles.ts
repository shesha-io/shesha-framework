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

  const shaHamburgerItem = cx(
    ``,
    css`
      .${prefixCls}icon {
        &.${prefixCls}icon-menu {
          margin-right: 10px;
        }
      }
    `
  );

  return {
    shaHamburgerItem,
    shaMenu,
  };
});
