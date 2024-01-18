import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const shaTimepicker = cx("sha-timepicker", css`
        width: 100%;
  `);
    return {
        shaTimepicker,
    };
});