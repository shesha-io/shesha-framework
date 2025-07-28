import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }, { style }) => {
    const pager = cx("sha-pager", css`
        * { 
            --ant-pagination-item-size-sm: calc(${style?.fontSize} * 1.5px) !important;
            --ant-pagination-item-size: calc(${style?.fontSize} * 1.5px) !important;
            font-size: ${style?.fontSize} !important;
            color: ${style?.color} !important;
            font-weight: ${style?.fontWeight} !important;
            -ms-overflow-style: none;
            scrollbar-width: none;
            font-family: ${style?.fontFamily} !important;
            .ant-pagination-item-container {
                display: flex !important;
                align-items: center !important;
            }
            .ant-pagination-item-ellipsis {
                position: relative !important;
            }
            .ant-pagination-item-link-icon{
            position: absolute !important;
            }
            .ant-pagination-next button {
            font-size: ${style?.fontSize} !important;
            }
        }
    `);

    const dropdown = cx("sha-dropdown", css`
        
        // height: calc(${style?.fontSize} * 1.5);

        .ant-select-selection-item {
         height: calc(${style?.fontSize} * 1.5);
         display: flex;
         align-items: center;
        }

        * {
            --ant-color-text : ${style?.color} !important;
            --ant-font-size : ${style?.fontSize} !important;
            --ant-font-family : ${style?.fontFamily} !important;
            font-weight: ${style?.fontWeight} !important;
            font-family: ${style?.fontFamily} !important;
        }
    `);

    const popup = cx("sha-popup", css`
        .ant-select-item-option-content {
            font-size: ${style?.fontSize} !important;
            font-family: ${style?.fontFamily} !important;
            color: ${style?.color} !important;
            font-weight: ${style?.fontWeight} !important;
        }
    `);

    const pagerContainer = cx("sha-pager-container", css`
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        justify-content: center;
    `);

    return {
        pager,
        dropdown,
        popup,
        pagerContainer,
    };
});