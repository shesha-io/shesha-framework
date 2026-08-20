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

  const configuredAppearance = `
    ${borderColorStyles(model?.border)}
    ${backgroundStyles(model?.background)}
  `;

  const configuredBackground = backgroundStyles(model?.background);

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
        ${configuredAppearance}
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
        ${configuredBackground}
        ${textStyle}

        &:hover,
        &:active {
        background: inherit;
          border-color: ${token.colorPrimary} !important;
        }
      }
    }

    .${shaReactTable} {
      margin: unset !important;
      width: 100% !important;
      display: block !important;
      overflow: auto;
      ${configuredAppearance}
      border-width: 1px;
      border-style: solid;
      border-radius: 6px;
      box-sizing: border-box;
      ${sheshaStyles.thinScrollbars}

      /* The table paints its own row and cell backgrounds, and sets the font on the cell elements
         themselves, so both have to be restated all the way down. */
      .sha-table {
        ${configuredBackground}
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

          &.tr-body {
            border-bottom: 1px solid red;
          }
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

      /* Each page number is its own opaque box, which reads as a white chip against a configured
         background. */
      .${prefixCls}-pagination-item {
        ${configuredBackground}

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

      /* The declaration order here is deliberate: configuredAppearance comes last so its
         background wins over the transparent one above. Swapping the two changes what the page
         size changer is painted with. */
      .${prefixCls}-select {
        margin-right: 0 !important;
        background: transparent;
        ${configuredAppearance}
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
        ${configuredAppearance}
        border-width: 1px;
        ${textStyle}

        transition: border-color 0.2s;

        &:hover,
        &:active {
        background: inherit;
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
