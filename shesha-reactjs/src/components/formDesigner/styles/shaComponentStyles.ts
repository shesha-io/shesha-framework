import { dimensionsStyles, marginStyles, paddingStyles } from "@/designer-components/_common/styles/utils";
import { IConfigurableFormComponent, IStyleValue } from "@/providers";
import { createStyles, ReturnStyles } from "antd-style";
import { designerClassNames } from "./styles";
import { IToolboxComponent } from "@/interfaces";
import { useMemo } from "react";
import { deepMergeValues } from "@/utils/object";
import { DEFAULT_DESIGNER_PADDING } from "../utils/stylingUtils";
import { isNullOrWhiteSpace } from "@/utils";

const getShaComponentStyles = createStyles(({ css, cx, token }, wrapperStyle: IStyleValue) => {
  const wrapperMargin = marginStyles(wrapperStyle.stylingBoxJson);
  const wrapperPadding = paddingStyles(wrapperStyle.stylingBoxJson);

  const shaComponent = cx(designerClassNames.shaComponent, css`
    ${dimensionsStyles({ height: 'auto', width: 'auto', ...wrapperStyle.dimensions })}
    ${wrapperStyle.dimensions?.width === 'stretch' ? 'flex: 1;' : ''}

    ${wrapperMargin}

    >.ant-form-item {
      ${isNullOrWhiteSpace(wrapperPadding) ? 'margin-bottom: 0;' : ''}
      
      .ant-form-item-label {
        padding-bottom: 3px;
      }
    }
  `);

  const componentDragHandle = cx(designerClassNames.componentDragHandle, css`
      ${wrapperPadding}

      visibility: visible;
      border-radius: 2px;
      position: relative;
      cursor: grab !important;
      box-sizing: border-box;
      display: block;
      border: 1px solid transparent;
      background-color: transparent;

      &:hover {
        border: 1px dashed ${token.colorPrimary};
      }  
    `);

  return { shaComponent, componentDragHandle };
});

export const useShaComponentStyles = (
  { componentModel, toolboxComponent, isDesigner }: { componentModel: IConfigurableFormComponent; toolboxComponent: IToolboxComponent; isDesigner: boolean },
): ReturnStyles<{ shaComponent: string; componentDragHandle: string }> => {
  const defaultWrapperStyle: IStyleValue = useMemo(() => ({
    dimensions: { gridRow: componentModel.dimensions?.gridRow, gridColumn: componentModel.dimensions?.gridColumn },
    ...(toolboxComponent.isInput || toolboxComponent.isOutput === true ? {} : { stylingBoxJson: DEFAULT_DESIGNER_PADDING.stylingBoxJson }),
  }), [componentModel.dimensions?.gridColumn, componentModel.dimensions?.gridRow, toolboxComponent.isInput, toolboxComponent.isOutput]);

  const wrapperStyle = useMemo(() => {
    const wrapperStyles = toolboxComponent.getWrapperStyle?.(componentModel);
    const wrapperStyle = isDesigner ? deepMergeValues(wrapperStyles?.style ?? {}, wrapperStyles?.designerStyle ?? {}) : wrapperStyles?.style;
    return deepMergeValues(defaultWrapperStyle, wrapperStyle);
  }, [componentModel, defaultWrapperStyle, isDesigner, toolboxComponent]);

  return getShaComponentStyles(wrapperStyle);
};

