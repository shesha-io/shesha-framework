import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const controls = "item-controls";
  const filterItem = cx("filter-item", css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative; 

        .${controls} {
            visibility: hidden;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            display: flex;
            align-items: center;
            position: absolute; 
            right: 0; 
        }

        &:hover .${controls} {
            visibility: visible;
            opacity: 1;
        }
    `);

  return {
    filterItem,
    controls,
  };
});


