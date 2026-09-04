import { createStyles, sheshaStyles } from '@/styles';
import { IStyleValue } from '@/providers/form/models';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { backgroundStyles, borderStyles, fontStyles } from '@/designer-components/_common/styles/utils';

const borderColorStyles = (model: IBorderValue | undefined): string => {
  if (!model) return '';
  const sides = model.borderType === 'all'
    ? ([['border-color', model.border?.all]] as const)
    : ([
      ['border-top-color', model.border?.top],
      ['border-right-color', model.border?.right],
      ['border-bottom-color', model.border?.bottom],
      ['border-left-color', model.border?.left],
    ] as const);

  return sides
    .filter(([, side]) => Boolean(side?.color))
    .map(([property, side]) => `${property}: ${side?.color} !important;`)
    .join(' ');
};

export const useStyles = createStyles(({ css, cx, token, prefixCls }, model?: IStyleValue) => {
  const pickerEllipsisBtnWidth = "45px";

  const pickerInputGroup = "picker-input-group";
  const pickerInputGroupInput = "picker-input-group-input";
  const pickerInputGroupEllipsis = "sha-entity-picker-button";
  const entityPickerModalPagerContainer = "entity-picker-modal-pager-container";

  const shaReactTable = "sha-react-table";
  const shaGlobalTableFilter = "sha-global-table-filter";

  /* Only the modal panel itself (.ant-modal-container below) is painted with the configured
     background. A solid color looks fine repeated across every inner element, but a gradient or
     image tiles independently on each one and reads as busy, so every child below is instead
     made transparent and lets the panel's background show through - see `transparentBackground`. */
  const configuredAppearance = `
    ${borderColorStyles(model?.border)}
    ${backgroundStyles(model?.background)}
  `;

  /* Cancels every property `backgroundStyles` can set (color/gradient shorthand as well as the
     image/size/repeat/position set), so a configured image or gradient doesn't repeat on this
     element regardless of which background type is configured. */
  const transparentBackground = `
    background: transparent;
    background-image: none;
  `;

  const textStyle = fontStyles(
    { type: model?.font?.type, color: model?.font?.color },
    { fontFamily: model?.styleCss?.fontFamily, color: model?.styleCss?.color },
  );

  const entityPickerContainer = cx("entity-picker-container", css`
    width: 100%;
    .${pickerInputGroup} {
      .${pickerInputGroupInput} {
        width: calc(100% + ${pickerEllipsisBtnWidth});
      }
    }

    .global-tablefilter {
      padding-right: unset !important;
    }
  `);

  /* The dialog is portalled to the body, so the picker's Appearance class cannot reach it through
     a descendant selector — it gets the style model passed down as a value instead. */
  const entityPickerModal = cx("entity-picker-modal", css`
    /* antd paints the dialog panel on -modal-container; the class itself lands on the outer
       element, whose background sits behind that panel and never shows. */
    .${prefixCls}-modal-container {
      ${configuredAppearance}
      ${borderStyles(model?.border)}
    }

    /* antd paints the header, body and footer on their own elements, which would cover the
       background on the panel above. */
    .${prefixCls}-modal-header,
    .${prefixCls}-modal-body,
    .${prefixCls}-modal-footer {
      background: transparent;
    }

    /* antd sets the font on each of these elements itself, so a value inherited from the panel
       never reaches them. */
    .${prefixCls}-modal-title {
      ${textStyle}
    }

    .${prefixCls}-modal-body {
      ${textStyle}

      /* The alert deliberately keeps its own panel: it is an information callout, and tinting it
         with the field background would lose the distinction it is drawn to make. */
      .${prefixCls}-alert {
        margin-bottom: 8px;
      }
    }

    .${shaGlobalTableFilter} {
      margin: unset !important;
      width: 100%;
      padding: unset;

      .${prefixCls}-input-affix-wrapper, .${prefixCls}-btn {
        ${transparentBackground}
        ${borderColorStyles(model?.border)}
        border-width: 1px !important;

        input {
          ${textStyle}
        }

        &:hover,
        &:focus,
        &:focus-within,
        &:active {
          border-color: ${token.colorPrimary} !important;
        }
      }

      .${prefixCls}-btn {
        ${transparentBackground}
        ${textStyle}

       &:hover,
        &:active {
          ${transparentBackground}
          border-color: ${token.colorPrimary} !important;
        }
      }
    }

    .${shaReactTable} {
      margin: unset !important;
      width: 100% !important;
      display: block !important;
      overflow: auto;
      ${transparentBackground}
      ${borderColorStyles(model?.border)}
      border-width: 1px;
      border-style: solid;
      border-radius: 6px;
      box-sizing: border-box;
      ${sheshaStyles.thinScrollbars}

      /* The table paints its own row and cell backgrounds, and sets the font on the cell elements
         themselves, so both have to be restated all the way down. */
      .sha-table {
        ${transparentBackground}
        ${textStyle}

        * {
          ${textStyle}
        }

        .tr.tr-head {
          &,
          .th,
          .th * {
            ${textStyle}
          }
        }

        /* A sticky/anchored column has other columns' cells scrolling underneath it, so unlike the
           rest of the table it can't be fully transparent - it would let that scrolling content
           bleed through. A flat fallback color would solve that but stand out as a mismatched
           patch against a configured gradient or image, so instead the column blurs whatever is
           behind it: it still reads as part of the same themed surface, for any background type,
           without needing to know what that background actually is.

           This has to apply to every row, not just the header: body cells get their own opaque
           striping color as an inline style (see rowCell.tsx), so !important is needed here to
           actually clear it to transparent - otherwise there is nothing for the blur to show
           through and only the header would appear to work. */
        .th.fixed-column,
        .td.fixed-column {
          background: transparent !important;
          background-image: none !important;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      }
    }

    .${entityPickerModalPagerContainer} {
      ${textStyle}
      display: flex;
      justify-content: flex-end;
      margin: ${sheshaStyles.paddingLG}px 0;

      .${prefixCls}-pagination-total-text {
        ${textStyle}
      }

      /* Each page number is its own opaque box by default, which would repeat a configured
         gradient or image instead of letting the modal panel's background show through it. */
      .${prefixCls}-pagination-item {
        ${transparentBackground}

        a {
          ${textStyle}
        }
      }

      .${prefixCls}-pagination-prev, .${prefixCls}-pagination-next {
      color: orange;
        .anticon {
          ${textStyle}
        }
      }

      .${prefixCls}-select {
        margin-right: 0 !important;
        ${transparentBackground}
        ${borderColorStyles(model?.border)}
        border-width: 1px;
        ${textStyle}

        .${prefixCls}-select-selector {
          transition: border-color 0.2s;
        }

        &:hover .${prefixCls}-select-selector,
        &.${prefixCls}-select-focused .${prefixCls}-select-selector,
        &:active .${prefixCls}-select-selector {
          border-color: ${token.colorPrimary} !important;
        }
      }
    }

    .${prefixCls}-modal-footer {
      padding: 12px 0 !important;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      column-gap: 12px;

      .${prefixCls}-btn {
        ${transparentBackground}
        ${borderColorStyles(model?.border)}
        border-width: 1px;
        ${textStyle}

        transition: border-color 0.2s;

        &:hover,
        &:active {
          ${transparentBackground}
          ${borderColorStyles(model?.border)}
          border-width: 1px;
          border-color: ${token.colorPrimary} !important;
        }
      }
    }
  `);

  /* Layout only, for the same reason as the container above: font and colour come from the
     designer component's Appearance class, which scopes them to this element. */
  const entitySelect = cx("entity-select", css`
    flex-basis: unset !important;

    .${prefixCls}-select-selector {
      overflow: auto;
      scrollbar-width: thin;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        width: 8px;
      }
    }
  `);

  return {
    entityPickerContainer,
    pickerInputGroup,
    pickerInputGroupInput,
    pickerInputGroupEllipsis,
    entityPickerModalPagerContainer,
    entityPickerModal,
    entitySelect,
  };
});
