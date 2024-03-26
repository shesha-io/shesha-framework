import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
  const shaMenu = cx(
    "ant-menu",
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
