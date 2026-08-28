import { createStyles } from '@/styles';
import { backgroundStyles, borderStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { IValidationErrorsComponentProps } from '.';

export const useStyles = createStyles(({ css, cx }, model: IValidationErrorsComponentProps) => {
  const shaValidationErrors = cx("sha-validation-errors", css`
        transition: all 0.2s ease;

        ${fontStyles(model.font)}
        ${borderStyles(model.border)}
        ${backgroundStyles(model.background)}
        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}
        ${marginStyles(model.stylingBoxJson)}

        /* dimensions will by applied to the wrapper div */
        height: stretch;
        width: stretch;
    `);

  return {
    shaValidationErrors,
  };
});
