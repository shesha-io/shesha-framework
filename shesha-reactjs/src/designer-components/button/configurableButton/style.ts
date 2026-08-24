import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from "@/designer-components/_common/styles/utils";
import { createStyles } from "@/styles";
import { IConfigurableButtonProps } from ".";
import { isDefined } from "@/utils";
import { IBackgroundValue, IFontValue } from "@/designer-components/_settings/utils";
import { getFullSizeComponentDimensions } from "@/components/formDesigner/utils/stylingUtils";

export const useStyles = createStyles(({ css, cx, token }, { model, isSameUrl, isGhostType }: { model: IConfigurableButtonProps; isSameUrl: boolean; isGhostType: boolean }) => {
  const isButtonStyle = ['primary', 'default'].includes(model.buttonType ?? '');

  const background: IBackgroundValue = {
    ...model.background,
    ...(isSameUrl && !isGhostType ? { color: token.colorPrimaryBg } : {}),
    ...(isGhostType ? { type: 'color', color: 'transparent' } : {}),
  };

  const font: IFontValue = {
    ...model.font,
    ...(isSameUrl && !isGhostType ? { color: token.colorText } : {}),
    ...(isGhostType ? { color: undefined } : {}),
  };


  const configurableButton = cx('sha-configurable-button', css`
      display: flex;
      ${isDefined(model.font?.align) ? `align-items: ${model.font.align};` : 'align-items: center;'}
      max-width: 100%;

      &&&&.ant-btn {
        ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
        ${fontStyles(font)}
        ${paddingStyles(model.stylingBoxJson)}
        ${marginStyles(model.stylingBoxJson)}
        ${isButtonStyle && !isGhostType ? borderStyles(model.border, true) : ''}
        ${isButtonStyle ? backgroundStyles(background) : ''}
        ${isButtonStyle && !isGhostType ? shadowStyles(model.shadow) : ''}
        ${isDefined(model.font?.align) ? `justify-content: ${model.font.align};` : ''}

        ${isGhostType ? `
          color: ${model.font?.color ?? token.colorText} !important;
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        ` : ''}

        span {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
      }
  `);

  return {
    configurableButton,
  };
});
