import { createStyles } from '@/styles';
import { marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { IAlertComponentProps } from './interfaces';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: IAlertComponentProps) => {
  const shaAlert = cx("sha-alert", css`
        transition: all 0.2s ease;

        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}
        ${marginStyles(model.stylingBoxJson)}

        /* dimensions will by applied to the wrapper div */
        height: stretch;
        width: stretch;

        /* antd gives the icon slot 'line-height: 0', which collapses its line box so the glyph's lower
           edge is clipped by the alert. Laying the slot out as a flex box sizes it to the glyph instead. */
        .${prefixCls}-alert-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;

          > .anticon,
          > svg {
            display: block;
          }
        }
    `);

  return {
    shaAlert,
  };
});
