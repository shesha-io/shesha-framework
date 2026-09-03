import { backgroundStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from "@/designer-components/_common/styles/utils";
import { IKeyInformationBarComponentProps } from "@/designer-components/keyInformationBar/interfaces";
import { createStyles } from "@/styles";
import { getFullSizeComponentDimensions } from "../formDesigner/utils/stylingUtils";
import { addPx } from "@/utils/style";
import { getDefault, isDefined } from "@/utils";

export const useStyles = createStyles(({ css, cx, token }, model: IKeyInformationBarComponentProps) => {
  const vertical = model.orientation === 'vertical';
  const divThickness = getDefault(addPx(model.dividerThickness), '0.62px');
  const width = getDefault(addPx(model.dividerWidth), '100%');
  const height = getDefault(addPx(model.dividerHeight), '100%');
  const margin = addPx(model.dividerMargin ?? 0);

  const flexItem = "flex-item";
  const flexItemWrapper = "flex-item-wrapper";
  const divider = "divider";
  const content = "content";
  const flexContainer = cx("flex-container", css`
        background-color: ${token.colorTextLightSolid};
        flex-wrap: wrap;
         ${model.orientation !== 'vertical' && isDefined(model.gap) ? `gap: ${addPx(model.gap) ?? model.gap};` : ''}
        ${dimensionsStyles(getFullSizeComponentDimensions(model.dimensions))}
        ${isDefined(model.alignItems)
            ? !vertical ? `justify-content: ${model.alignItems};` : `align-items: ${model.alignItems};`
            : ''
        }
        ${borderStyles(model.border)}
        ${backgroundStyles(model.background)}
        ${shadowStyles(model.shadow)}
        ${fontStyles(model.font)}
        ${paddingStyles(model.stylingBoxJson)}
        ${marginStyles(model.stylingBoxJson)}
        
        .${flexItemWrapper} {
            display: flex;
            min-width: 0px;
            box-sizing: border-box;
            flex: 1;
            flex-direction: ${vertical ? 'column' : 'row'};

            .${content} {
                flex: 1;
                display: flex;
                flex-direction: row;
                align-items: center;
                overflow: hidden;
                width: 100%;
                
                .ant-form-item-control-input {
                    min-height: 0;
                }

                * {
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                span, div {
                    min-width: 15px;
                    display: block;
                }
                
                .ant-typography {
                    margin: unset !important;
                    padding: 0px !important;
                    display: block !important;
                    place-items: unset !important;
                    grid: none !important;
                }
                    
                &.ant-form-item-control-input-content, .ant-form-item-control-input {
                    min-height: 0;
                    max-width: 100%;
                }

                button {
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    
        .${divider}{
            align-self: center;
            background-color: ${model.dividerColor ?? '#b4b4b4'};
            width: ${!vertical ? divThickness : width};
            height: ${vertical ? divThickness : height};
            margin: ${vertical ? `${margin} 0px` : `0px ${margin}`};
            max-height: 100%;
            max-width: 100%;
            flex-shrink: 0;
            flex-grow: 0;
        }
    `);
  return {
    flexContainer,
    flexItem,
    flexItemWrapper,
    divider,
    content,
  };
});
