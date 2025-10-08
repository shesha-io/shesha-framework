import { createStyles, sheshaStyles } from '@/styles';


export const useStyles = createStyles(({ css, cx }) => {
  const columnFiltersButtonsLeft = "column-filters-buttons-left";
  const columnFiltersButtonsRight = "column-filters-buttons-right";

  const columnFiltersButtons = cx("column-filters-buttons", css`
        display: flex;
        justify-content: space-between;
        margin: ${sheshaStyles.paddingLG}px 0;
        margin-bottom: 38px;
      
        div {
          display: flex;
        }
      
        .${columnFiltersButtonsLeft} {
          justify-content: flex-start;
        }
      
        .${columnFiltersButtonsRight} {
          justify-content: flex-end;
      
          button {
            margin-left: ${sheshaStyles.paddingLG}px;
          }
        }
              
    `);

  return {
    columnFiltersButtons,
    columnFiltersButtonsLeft,
    columnFiltersButtonsRight,
  };
});
