import { createStyles } from '@/styles';
import { getTextHoverEffects, getWarningHoverEffects } from '@/styles';

export const useStyles = createStyles(({ css, cx, iconPrefixCls, token }) => {
  const indexViewSelectorBulb = "index-view-selector-bulb";
  const tableViewSelector = cx("table-view-selector", css`
        display: flex;
        align-items: center;
        .title {
            font-size: 16px;
            margin: unset;
            font-weight: 600;
            cursor: pointer;
    
            .${iconPrefixCls} {
                ${getTextHoverEffects(token)}
            }
        }
    
        .${indexViewSelectorBulb} {
            .${iconPrefixCls} {
                ${getWarningHoverEffects(token)}
            }
        }    
    `);

  return {
    tableViewSelector,
    indexViewSelectorBulb,
  };
});
