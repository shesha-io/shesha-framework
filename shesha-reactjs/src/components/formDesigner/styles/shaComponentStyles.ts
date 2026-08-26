import { dimensionsStyles, marginStyles, paddingStyles } from "@/designer-components/_common/styles/utils";
import { IConfigurableFormComponent, IStyleValue } from "@/providers";
import { createStyles, ReturnStyles } from "antd-style";
import { designerClassNames } from "./styles";
import { IToolboxComponent } from "@/interfaces";
import { useMemo } from "react";
import { deepMergeValues } from "@/utils/object";

const getShaComponentStyles = createStyles(({ css, cx, token }, wrapperStyle: IStyleValue) => {
  const wrapperMargin = marginStyles(wrapperStyle.stylingBoxJson);

  // The designer's minimum spacing is kept on the inline axis only. On the block axis it would sit
  // inside the height a component was sized to fill - a `100vh` component is sized to the canvas
  // content box exactly (see `canvasRelativeVh`), so any padding here pushes it past the canvas
  // edge and puts a scrollbar on a canvas that should not need one.
  //
  // Narrow by construction: `getDesignerPadding` already yields 0 for a component whose own margins
  // meet the designer minimum, so this only drops the spacing added to zero-margin components -
  // which sit flush at runtime anyway, making the designer a truer preview rather than a looser one.
  const wrapperBox = wrapperStyle.stylingBoxJson === undefined
    ? undefined
    : { ...wrapperStyle.stylingBoxJson };
  if (wrapperBox !== undefined) {
    delete wrapperBox.paddingTop;
    delete wrapperBox.paddingBottom;
  }
  const wrapperPadding = paddingStyles(wrapperBox);

  const shaComponent = cx(designerClassNames.shaComponent, css`
    ${dimensionsStyles({ height: 'auto', width: 'auto', ...wrapperStyle.dimensions })}
    ${wrapperStyle.dimensions?.width === 'stretch' ? 'flex: 1;' : ''}

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
      /* An outline rather than a border: it draws identically but costs no layout, so the designer
         does not make every component 2px taller than it renders at runtime. Pulled inside the box
         with a negative offset so it still traces the component edge. */
      outline: 1px solid transparent;
      outline-offset: -1px;
      background-color: transparent;

      &:hover {
        outline: 1px dashed ${token.colorPrimary};
      }
    `);

  return { shaComponent, componentDragHandle };
});

export const useShaComponentStyles = (
  { componentModel, toolboxComponent, isDesigner }: { componentModel: IConfigurableFormComponent; toolboxComponent: IToolboxComponent; isDesigner: boolean },
): ReturnStyles<{ shaComponent: string; componentDragHandle: string }> => {
  const defaultWrapperStyle: IStyleValue = useMemo(() => ({
    dimensions: { gridRow: componentModel.dimensions?.gridRow, gridColumn: componentModel.dimensions?.gridColumn },
  }), [componentModel]);

  const wrapperStyle = useMemo(() => {
    const wrapperStyles = toolboxComponent.getWrapperStyle?.(componentModel);
    const wrapperStyle = isDesigner ? deepMergeValues(wrapperStyles?.style ?? {}, wrapperStyles?.designerStyle ?? {}) : wrapperStyles?.style;
    return deepMergeValues(defaultWrapperStyle, wrapperStyle);
  }, [componentModel, defaultWrapperStyle, isDesigner, toolboxComponent]);

  return getShaComponentStyles(wrapperStyle);
};

