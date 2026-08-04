import { dimensionsStyles, marginStyles, paddingStyles } from "@/designer-components/_common/styles/utils";
import { IConfigurableFormComponent, IStyleValue } from "@/providers";
import { createStyles, ReturnStyles } from "antd-style";
import { designerClassNames } from "./styles";
import { IToolboxComponent } from "@/interfaces";
import { useMemo } from "react";
import { deepMergeValues } from "@/utils/object";

const getShaComponentStyles = createStyles(({ css, cx, token }, wrapperStyle: IStyleValue) => {
  const wrapperMargin = marginStyles(wrapperStyle.stylingBoxJson);
  const wrapperPadding = paddingStyles(wrapperStyle.stylingBoxJson);

  const shaComponent = cx(designerClassNames.shaComponent, css`
    ${dimensionsStyles({ height: "auto", ...wrapperStyle.dimensions })}
    ${wrapperMargin}
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
  { componentModel, toolboxComponent }: { componentModel: IConfigurableFormComponent; toolboxComponent: IToolboxComponent },
): ReturnStyles<{ shaComponent: string; componentDragHandle: string }> => {
  const defaultWrapperStyle: IStyleValue = useMemo(() => ({
    dimensions: { gridRow: componentModel.dimensions?.gridRow, gridColumn: componentModel.dimensions?.gridColumn, width: '100%' },
  }), [componentModel]);

  const wrapperStyle = useMemo(() => {
    return deepMergeValues(defaultWrapperStyle, toolboxComponent.getWrapperStyle?.({ ...componentModel }));
  }, [componentModel, defaultWrapperStyle, toolboxComponent]);

  return getShaComponentStyles(wrapperStyle);
};

