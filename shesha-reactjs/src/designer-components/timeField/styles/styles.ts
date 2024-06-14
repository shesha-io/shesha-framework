import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const shaTimepicker = cx("sha-timepicker", css`
        width: 100%;
  `);
    return {
        shaTimepicker,
    };
});