import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaEditableDisplayFormItemInfo = "sha-editable-display-form-item-info";
  const shaLabelIconPlacement = "sha-label-icon-placement";
  const shaEditableDisplayFormItem = cx("sha-editable-display-form-item", css`
        .${shaEditableDisplayFormItemInfo} {
            margin-left: 4px;
        }
    
        .${shaLabelIconPlacement} {
            &.default {
            }
    
            &.right {
                position: absolute;
                top: 5px;
            }
        }
  `);
  return {
    shaEditableDisplayFormItem,
    shaEditableDisplayFormItemInfo,
    shaLabelIconPlacement,
  };
});
