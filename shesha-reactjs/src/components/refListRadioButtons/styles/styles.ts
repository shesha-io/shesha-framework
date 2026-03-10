import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const buttonsVertical = "buttons-vertical";
  const shaRefListRadioButtons = cx("sha-ref-list-radio-buttons", css`
        .${buttonsVertical} {
          margin-bottom: 3px;
        }
  `);
  return {
    shaRefListRadioButtons,
    buttonsVertical,
  };
});
