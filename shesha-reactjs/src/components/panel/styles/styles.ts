import { createStyles, sheshaStyles } from '@/styles';
import { ICollapsiblePanelProps } from '..';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { backgroundStyles, borderLinesStyles, borderRadiusStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, paddingValue, shadowStyles } from '@/designer-components/_common/styles/utils';
import { StyleBoxValue } from '@/providers';

/** Is value defined and greater than 0 */
const isG0 = (value: string | number | undefined): boolean => isDefined(value) && parseFloat(String(value)) > 0;

const defaultHeaderPadding: StyleBoxValue = { _type: 'styleBox', paddingBottom: 8, paddingTop: 8, paddingLeft: 16, paddingRight: 16 };
const defaultPadding: StyleBoxValue = { _type: 'styleBox', paddingBottom: 16, paddingTop: 16, paddingLeft: 16, paddingRight: 16 };
const defaultMargin: StyleBoxValue = { _type: 'styleBox', marginBottom: 5 };

/* export const useHeaderComponentsContainerStyles = createStyles(({ css, cx, token, prefixCls }) => {
};*/

export const shaHeaderComponentsContainer = "sha-header-components-container";

export const useStyles = createStyles(({ css, cx, token, prefixCls }, model: ICollapsiblePanelProps) => {
  const noContentPadding = "no-content-padding";
  const hideWhenEmpty = "hide-empty";

  const borderValue = model.border?.border;
  const hasBorder = (model.border?.borderType === 'all' && isG0(borderValue?.all?.width)) ||
    (model.border?.borderType === 'custom' && (isG0(borderValue?.top?.width) || isG0(borderValue?.right?.width) || isG0(borderValue?.bottom?.width) || isG0(borderValue?.left?.width)));

  const dimensions = dimensionsStyles({ ...model.dimensions, width: '100%' });
  const padding = paddingStyles(model.stylingBoxJson ?? defaultPadding);

  const headerDimensions = dimensionsStyles({ ...model.headerStyles?.dimensions, width: undefined, minWidth: undefined, maxWidth: undefined });
  const headerPadding = paddingStyles(model.headerStyles?.stylingBoxJson ?? defaultHeaderPadding);

  const shaCollapsiblePanel = cx("ant-collapse-component", css`
    &.${hideWhenEmpty}:not(:has(.ant-collapse-body .sha-component)):not(:has(.${prefixCls}-collapse-content-box .sha-component)):not(:has(.ant-collapse-body .ant-form-item)) {
      display: none;
    }
    --primary-color: ${token.colorPrimary};
    --ant-line-width: ${hasBorder ? '0px' : '1px'} !important;
    --ant-collapse-header-bg: transparent !important;
    ${dimensions}
    ${marginStyles(model.stylingBoxJson ?? defaultMargin)}

    > .ant-collapse-item {
      display: flex;
      flex-direction: column;
      ${shadowStyles(model.shadow)}
      ${borderRadiusStyles(model.border, true)}
      height: 100%;
    }
   
    > .ant-collapse-item > .ant-collapse-panel {
      flex: 1;
      ${backgroundStyles(model.background)}
      ${padding}
      position: relative;
      ${model.ghost === true ? '' : borderLinesStyles(model.border)}
      ${borderRadiusStyles({
        ...model.border,
        radiusType: 'custom',
        radius: { topLeft: 0, topRight: 0, bottomRight: model.border?.radius?.bottomRight ?? model.border?.radius?.all, bottomLeft: model.border?.radius?.bottomLeft ?? model.border?.radius?.all },
      }, true)}
      overflow: auto;
      ${sheshaStyles.thinScrollbars}

      > .ant-collapse-content-box {
        --ant-collapse-content-padding: 0px !important;
        padding: 0px !important;
        width: 100%;
        height: 100%;
        overflow: ${'auto' /* typeof overflow === 'object' ? (overflow.overflow ?? 'auto') : 'auto'*/};
      }
    }

    > .ant-collapse-item > .ant-collapse-header {
      ${'' /* headerRest as CSSObject*/}
      position: relative;
      width: 100%;
      visibility: ${model.hideCollapseContent === true ? 'hidden' : 'visible'};
      ${backgroundStyles(model.headerStyles?.background ?? { type: 'color', color: 'transparent' })}
      ${headerDimensions}
      ${headerPadding}
      ${borderLinesStyles(model.headerStyles?.border)}
      ${model.accentStyle === true ? 'border-top: 3px solid var(--primary-color);' : ''}
      ${model.ghost === true || model.isSimpleDesign === true ? '' : borderRadiusStyles(model.border, true)}
      align-items: center !important;

      .ant-collapse-header-text {
        ${fontStyles(model.headerStyles?.font)}
        align-self: center;
      }

      .ant-collapse-title {
        flex: 1;
        overflow: auto;
        height: 100%;

        > .${shaHeaderComponentsContainer} > .sha-drop-hint {
          height: 100% !important;
        }
      }

      .ant-collapse-extra {
        align-self: center;
      }

      .ant-collapse-expand-icon {
        align-self: center;
        margin-right: 8px;
      }
    }

    > .ant-collapse-item.ant-collapse-item-active > .ant-collapse-header {
      ${model.ghost === true || model.isSimpleDesign === true ? '' : borderRadiusStyles({
        ...model.border,
        radiusType: 'custom',
        radius: { topLeft: model.border?.radius?.topLeft ?? model.border?.radius?.all, topRight: model.border?.radius?.topRight ?? model.border?.radius?.all, bottomRight: 0, bottomLeft: 0 },
      }, true)}
    }

    &.${prefixCls}-collapse-ghost {
      > .ant-collapse-item {
        > .ant-collapse-header {
          --ant-collapse-header-padding: 5px 0px !important;
          border-radius: 0 !important;
          border: none;
          border-bottom: 2px solid ${token.colorPrimary};
          ${model.accentStyle === true ? 'border-top: 3px solid var(--primary-color);' : ''}
          font-weight: ${isDefined(model.headerStyles?.font?.weight) ? model.headerStyles.font.weight : '500'};
        }

        > .ant-collapse-content {
          border: none;

          > .ant-collapse-content-box {
            padding: 5px 0;
          }
        }
      }
    }
  `);

  const headerPaddingValue = paddingValue(model.headerStyles?.stylingBoxJson ?? defaultHeaderPadding);

  const shaSimpleDesign = cx(css`
    --primary-color: ${token.colorPrimary};

    > .ant-collapse-item > .ant-collapse-header-text {
      ${fontStyles(model.headerStyles?.font)}
    }

    &.${prefixCls}-collapse-ghost {
      > .ant-collapse-item > .ant-collapse-header {
        --ant-collapse-header-padding: ${isNullOrWhiteSpace(headerPaddingValue) ? '12px 16px' : headerPaddingValue} !important;
        padding: 12px 16px !important;
        font-size: 14px;
      }
    }

    > .ant-collapse-item > .${prefixCls}-collapse-content-box {
      padding: 5px 0;
      ${dimensions}
      height: max-content;
      overflow: ${'auto' /* typeof overflow === 'object' ? (overflow.overflow ?? 'auto') : 'auto'*/};
      ${padding}
    }

    > .ant-collapse-item > .ant-collapse-header {
      visibility: ${model.hideCollapseContent === true ? 'hidden' : 'visible'};
      ${model.accentStyle === true ? 'border-top: 3px solid var(--primary-color);' : ''}
      font-size: 14px;
      ${headerDimensions}
      ${'' /* width: ${width};
      min-width: ${minWidth};
      max-width: ${maxWidth};
      */}
    }
  `);

  return {
    shaCollapsiblePanel,
    noContentPadding,
    hideWhenEmpty,
    shaSimpleDesign,
  };
});
