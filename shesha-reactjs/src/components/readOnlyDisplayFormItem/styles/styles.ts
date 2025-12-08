import { createStyles, sheshaStyles, getTextHoverEffects } from '@/styles';
import { CSSProperties } from 'react';

interface UseStylesParams {
  textAlign?: CSSProperties['textAlign'];
};

export const useStyles = createStyles(({ css, cx, prefixCls, token }, params: UseStylesParams) => {
  const { textAlign } = params;

  const readOnlyModeToggler = "read-only-mode-toggler";
  const readOnlyDisplayFormItem = cx("read-only-display-form-item", css`
        width: 100%;
        max-width: 100%;
        overflow: hidden;
        box-sizing: border-box;
        display: flex;

        &.${prefixCls}-form-item {
            margin-bottom: unset;
        }
  
        .${readOnlyModeToggler} {
              margin-left: ${sheshaStyles.paddingLG}px;
  
              &:not(.disabled) {
                cursor: pointer;
                ${getTextHoverEffects(token)}
            }
        }

        /* Ensure content doesn't overflow */
        > * {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Handle Space component for multiple items */
        .${prefixCls}-space {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
        }

        /* Handle tags and other components */
        .${prefixCls}-tag {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
        }
  `);

  const inputField = css`
    padding: 0px 8px;
    margin: 0;
    margin-right: 8px;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    // white-space: nowrap;
  `;

  const wrapper = css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 4px;
    box-sizing: border-box;
    justify-content: ${textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'};
  `;

  return {
    readOnlyDisplayFormItem,
    readOnlyModeToggler,
    inputField,
    wrapper,
  };
});