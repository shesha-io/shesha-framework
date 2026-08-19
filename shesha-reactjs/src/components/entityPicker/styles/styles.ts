import { createStyles, sheshaStyles } from '@/styles';
import { IStyleValue } from '@/providers/form/models';
import { backgroundStyles, cssPropertiesToString, fontStyles, borderStyles, splitTextProperties } from '@/designer-components/_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: IStyleValue) => {
  const pickerEllipsisBtnWidth = "45px";

  const pickerInputGroup = "picker-input-group";
  const pickerInputGroupInput = "picker-input-group-input";
  const pickerInputGroupEllipsis = "sha-entity-picker-button";
  const entityPickerModalPagerContainer = "entity-picker-modal-pager-container";

  const shaReactTable = "sha-react-table";
  const shaGlobalTableFilter = "sha-global-table-filter";

  /* Only the box half of the Custom style. Its text half is re-emitted through `textStyle` below,
     narrowed to family and colour, so emitting the whole thing here would put the size, weight and
     alignment back on the dialog. */
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${cssPropertiesToString(splitTextProperties(model.styleCss).box)}
  `;

  /* The background on its own, for the elements that only need to stop being opaque white rather
     than take the full box. */
  const configuredBackground = backgroundStyles(model.background);

  /* The dialog takes only family and colour from the Font panel. Size, weight and alignment are
     chosen for a single-line input and would fight the dialog's own layout: an input's font size
     would blow out the table rows, and its `text-align` would shove every cell and the title to
     one side. Those three keep cascading from the theme instead. */
  const textStyle = fontStyles(
    { type: model.font?.type, color: model.font?.color },
    { fontFamily: model.styleCss?.fontFamily, color: model.styleCss?.color },
  );

  /* Layout only. The configured Appearance (border, background, font, dimensions, spacing) is
     emitted by the designer component's own emotion class onto the wrapper inside this container,
     so nothing here may paint a box of its own. */
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
      .ant-alert {
        margin-bottom: 8px;
      }
    }

    .${shaGlobalTableFilter} {
      ${configuredAppearance}
      margin: unset !important;
      width: 100%;
      padding: unset;

      .${prefixCls}-input-affix-wrapper {
        ${configuredBackground}

        input {
          ${textStyle}
        }
      }

      .${prefixCls}-btn {
        ${configuredBackground}
        ${textStyle}
      }
    }

    .${shaReactTable} {
      margin: unset !important;
      width: 100% !important;
      display: block !important;
      overflow: auto;
      ${configuredAppearance}
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
      }
    }

    .${entityPickerModalPagerContainer} {
      ${textStyle}
      display: flex;
      justify-content: flex-end;
      margin: ${sheshaStyles.paddingLG}px 0;

      .ant-pagination-total-text {
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

      /* The declaration order here is deliberate: configuredAppearance comes last so its
         background wins over the transparent one above. Swapping the two changes what the page
         size changer is painted with. */
      .${prefixCls}-select {
        margin-right: 0 !important;
        background: transparent;
        ${configuredAppearance}
        ${textStyle}
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
        ${textStyle}
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
