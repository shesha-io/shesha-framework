import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css, cx }) => {
    const editable = "editable";
    const colorPickerSelector = cx("color-picker-selector", css`
        border: 1px dotted gray;
        width: 32px;
        height: 32px;
        margin-right: 12px;
        display: inline-block;
        border-radius: 5px;
        
        &.${editable} {
          cursor: pointer;  
        }
    `);
    return {
        colorPickerSelector,
        editable,
    };
});