import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const controls = "item-controls";
    const filterItem = cx("filter-item", css`
        display: flex;
        justify-content: space-between;

        .${controls} {
            transition: opacity 0.2s;
            opacity: 0;
            display: flex;
            align-items: center;
        }
        
        &:hover {
            >.${controls} {
                opacity: 1;
            }
        }
    `);

    return {
        filterItem,
        controls,
    };
});