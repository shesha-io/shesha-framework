import { createStyles } from '@/styles';
import { marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { IAlertComponentProps } from './interfaces';

export const useStyles = createStyles(({ css, cx }, model: IAlertComponentProps) => {
  const shaAlert = cx("sha-alert", css`
        transition: all 0.2s ease;

        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}
        ${marginStyles(model.stylingBoxJson)}

        /* dimensions will by applied to the wrapper div */
        height: stretch;
        width: stretch;
    `);

  return {
    shaAlert,
  };
});
