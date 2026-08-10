import { createStyles } from '@/styles';
import { paddingStyles, shadowStyles } from '../_common/styles/utils';
import { IAlertComponentProps } from './interfaces';

export const useStyles = createStyles(({ css, cx }, model: IAlertComponentProps) => {
  const shaAlert = cx("sha-alert", css`
        transition: all 0.2s ease;

        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}
        /* dimensions will by applied to the wrapper div */
        height: 100%;
        width: 100%;
    `);

  return {
    shaAlert,
  };
});
