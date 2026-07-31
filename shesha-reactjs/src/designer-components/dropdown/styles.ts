import { createStyles } from '@/styles';
import { IDropdownComponentProps } from './model';
import { backgroundStyles, borderLinesStyles, borderRadiusStyles, borderStyles, dimensionsStyles, fontStyles, marginStyles, paddingStyles, shadowStyles } from '../_common/styles/utils';
import { isDefined } from '@/utils/nullables';

/**
 * Emits the two Appearance style sets.
 *
 * The bare-named model properties style the select control itself (antd renders the visible box as
 * `.ant-select-selector`, not the root element, so border/background/dimensions have to land there
 * to be seen). The `tag` set is scoped to each `.ant-tag` descendant, which is what makes it apply
 * per selected item rather than to the whole control — the same descendant-scoping the checkbox
 * group uses for its repeated child.
 *
 * Only properties actually present in the model emit CSS, so anything left unconfigured keeps
 * cascading from the theme.
 */
export const useStyles = createStyles(({ css, cx, token, prefixCls }, model: IDropdownComponentProps) => {
  const tag = model.tag;
  const textAlign = model.font?.align;
  // Built outside the template: the attribute selector needs quotes, which would terminate the
  // tagged template literal if written inline.
  const tagColourSelector = `.${prefixCls}-tag:not([class*='${prefixCls}-tag-'])`;

  const dropdown = cx('sha-dropdown', css`
      /* Wrapper set — styles the select control. */
      ${dimensionsStyles(model.dimensions)}
      ${marginStyles(model.stylingBoxJson)}

      &.${prefixCls}-select .${prefixCls}-select-selector {
        ${borderStyles(model.border)}
        ${backgroundStyles(model.background)}
        ${shadowStyles(model.shadow)}
        ${paddingStyles(model.stylingBoxJson)}
        ${fontStyles(model.font)}
        height: 100%;
        ${isDefined(model.dimensions?.height) && model.dimensions.height !== 'auto' ? 'overflow-y: auto;' : ''}

        .${prefixCls}-select-selection-overflow {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          height: 100%;
          ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}
        }

        scrollbar-width: thin;
        ::-webkit-scrollbar {
          width: 8px;
          background-color: transparent;
        }
      }

      /* The search input and the rendered selection both need the wrapper font. */
      .${prefixCls}-select-selection-search-input,
      .${prefixCls}-select-selection-item,
      .${prefixCls}-select-selection-placeholder {
        ${fontStyles(model.font)}
      }

      .${prefixCls}-select-selection-item {
        --ant-line-width: 0px !important;
        line-height: unset !important;
        overflow: visible;
        height: 100%;
        display: flex;
        align-items: center;
        ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}

        .${prefixCls}-select-selection-item-content {
          display: flex;
          overflow: visible;
        }

        &:hover {
          border: none !important;
        }
      }

      /* antd tints multi-select items; the tag carries its own background instead. */
      --ant-select-multiple-item-bg: transparent !important;

      /*
       * Tag set — styles each selected item rendered as a tag.
       *
       * Layout and geometry apply to every tag. Colour does not: an option that carries its own
       * colour renders through an antd preset class (.ant-tag-red and friends) or an inline
       * background, and that per-option colour must win over the configured default. Inline styles
       * already beat this class, so only the preset case needs excluding via :not().
       */
      .${prefixCls}-tag {
        margin: 0;
        display: inline-flex;
        align-items: center;
        overflow: hidden;
        cursor: default;
        ${isDefined(textAlign) ? `justify-content: ${textAlign};` : ''}
        ${borderRadiusStyles(tag?.border)}
        ${shadowStyles(tag?.shadow)}
        ${dimensionsStyles(tag?.dimensions)}
        ${paddingStyles(tag?.stylingBoxJson)}
        ${marginStyles(tag?.stylingBoxJson)}
        ${fontStyles(tag?.font)}
      }

      ${tagColourSelector} {
        ${borderLinesStyles(tag?.border)}
        ${backgroundStyles(tag?.background)}
      }

      &.${prefixCls}-select-open,
      &:hover {
        border-color: ${token.colorPrimary} !important;
      }
    `);

  return {
    dropdown,
  };
});
