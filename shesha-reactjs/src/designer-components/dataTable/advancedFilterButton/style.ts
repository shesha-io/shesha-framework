import { createStyles } from "@/styles";
import { IAdvancedFilterButtonComponentProps } from "./types";
import { isDefined } from "@/utils";
import { marginStyles } from "@/designer-components/_common/styles/utils";

export const useStyles = createStyles(({ token, cx, css }, model: IAdvancedFilterButtonComponentProps) => {
  const primaryColor = token.colorPrimary;
  const disabledColor = token.colorTextDisabled;

  const buttonContainer = cx("sha-filter-button-container", css`
    ${marginStyles(model.stylingBoxJson)}

    &.disabled {
      opacity: 0.5;
    }

    &.active .ant-btn {
      color: ${primaryColor};
    }
  `);

  const button = cx("filter-btn", css`
    .ant-btn-icon{
     svg {
      font-size: ${isDefined(model.font?.size) ? `${model.font.size}px` : '14px'} !important;
     }
    }
      &.ant-btn-icon-only {
        width: max-content;
        height: max-content;
        padding: 1px 1px;
      }    
    `);

  return {
    primaryColor,
    disabledColor,
    buttonContainer,
    button,
  };
});
