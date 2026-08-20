import { createStyles } from '@/styles';
import { IPhoneNumberComponentProps } from './interfaces';
import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, token }, model: IPhoneNumberComponentProps) => {
  const inputBoxStyles = `
    ${dimensionsStyles(model.dimensions)}
    ${paddingStyles(model.stylingBoxJson)}
  `;

  const phoneNumber = cx('sha-phone-number', css`
      ${borderStyles(model.border)}
      ${backgroundStyles(model.background)}
      ${shadowStyles(model.shadow)}
      ${fontStyles(model.font)}
      ${inputBoxStyles}

      width: 100%;

      .ant-phone-input-wrapper {
        width: 100%;
      }

      .ant-input-group-wrapper,
      .ant-input-wrapper,
      .ant-input-group {
        width: 100%;
      }

      .ant-input {
        width: 100%;
        background: transparent !important;
        ${fontStyles(model.font)}
      }

      .ant-input-group-addon {
        background: transparent !important;

        .ant-select .ant-select-selector {
          background: transparent !important;
        }
      }

      &:hover {
        border-color: ${token.colorPrimary} !important;
      }

      &&&&:hover,
      &&&&:focus,
      &&&&:focus-within,
      &&&&[class*="-status-error"],
      &&&&[class*="-status-warning"] {
        ${backgroundStyles(model.background)}
      }
  `);

  const validationMessage = cx('sha-phone-number-validation-message', css`
    color: ${token.colorError};
    font-size: 14px;
    margin-top: 4px;
    line-height: 1.5715;
  `);

  return {
    phoneNumber,
    validationMessage,
  };
});
