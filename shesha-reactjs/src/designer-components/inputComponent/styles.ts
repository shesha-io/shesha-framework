import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const inlineInputs = cx(css`
        align-items: end !important;
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
        margin-top: 5px;
    `);

  const rowInputs = cx(css`
        display: flex;
        flex-wrap: wrap;
        gap: 0px 8px;
        margin-top: 5px;
        `);

  const icon = cx(css`
        --icon-fill-color: #1C1B1F;
    `);
  return {
    inlineInputs,
    rowInputs,
    icon,
  };
});
