import { createStyles, sheshaStyles } from '@/styles';
import { IStyleValue } from '@/providers/form/models';
import { backgroundStyles } from '@/designer-components/_common/styles/utils';
import { isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

export const useStyles = createStyles(({ css, cx, prefixCls }, model?: IStyleValue) => {
  const pickerEllipsisBtnWidth = "45px";

  const pickerInputGroup = "picker-input-group";
  const pickerInputGroupInput = "picker-input-group-input";
  const pickerInputGroupEllipsis = "sha-entity-picker-button";
  const entityPickerModalPagerContainer = "entity-picker-modal-pager-container";

  const shaReactTable = "sha-react-table";
  const shaGlobalTableFilter = "sha-global-table-filter";
  const fontFamily = isNotNullOrWhiteSpace(model?.font?.type)
    ? model.font.type
    : model?.styleCss?.fontFamily;
  const fontFamilyStyle = isNullOrWhiteSpace(fontFamily) ? '' : `font-family: ${fontFamily};`;

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
     a descendant selector — it gets the style model passed down as a value instead.

     Only two things are applied here: the configured background on the dialog panel, and the font
     family on its content. Everything inside — the table, the search box, the pager, the buttons —
     is left to render its own default styling. */
  const entityPickerModal = cx("entity-picker-modal", css`
    /* antd paints the dialog panel on -modal-container; the class itself lands on the outer
       element, whose background sits behind that panel and never shows. */
    .${prefixCls}-modal-container {
      ${backgroundStyles(model?.background)}
    }

    /* antd paints the header, body and footer on their own elements, which would cover the
       background on the panel above. */
    .${prefixCls}-modal-header,
    .${prefixCls}-modal-body,
    .${prefixCls}-modal-footer {
      background: transparent;
    }

    /* Inherited by the dialog content. Controls that set their own font-family (antd does so on a
       few) are not chased down: this is the family for the dialog, not an override of each child. */
    ${fontFamilyStyle}

    .${prefixCls}-modal-body {
      .${prefixCls}-alert {
        margin-bottom: 8px;
      }
    }

    .${shaGlobalTableFilter} {
      margin: unset !important;
      width: 100%;
      padding: unset;

      /* The search box is an Input.Search: an input plus a button. Neither inherits the family
         (see the footer rule below), so both are named here. The placeholder is a pseudo-element
         and follows the input, so it needs no rule of its own. */
      input,
      .${prefixCls}-btn {
        ${fontFamilyStyle}
      }
    }

    .${shaReactTable} {
      margin: unset !important;
      width: 100% !important;
      display: block !important;
      overflow: auto;
      border-radius: 6px;
      box-sizing: border-box;
      ${sheshaStyles.thinScrollbars}

      /* The table sets a family on its header and body cells only when the caller passes one, and
         the picker deliberately passes no styling so the table keeps its own defaults otherwise.
         That leaves the cells on the theme family rather than inheriting the dialog one, so the
         family alone is restated here. Nothing else about the cells is touched. */
      .th, .td {
        ${fontFamilyStyle}
      }
    }

    .${entityPickerModalPagerContainer} {
      display: flex;
      justify-content: flex-end;
      margin: ${sheshaStyles.paddingLG}px 0;

      /* antd sets font-family on the pagination items themselves (token.fontFamily), so the page
         numbers and the prev/next/jump controls never inherit the dialog family. The page-size
         select is a Select, whose own rule is font-family: inherit, so it follows its container -
         which is one of these items. */
      .${prefixCls}-pagination-item,
      .${prefixCls}-pagination-prev,
      .${prefixCls}-pagination-next,
      .${prefixCls}-pagination-jump-prev,
      .${prefixCls}-pagination-jump-next,
      .${prefixCls}-pagination-options,
      .${prefixCls}-pagination-total-text {
        ${fontFamilyStyle}
      }

      .${prefixCls}-select {
        margin-right: 0 !important;
        ${fontFamilyStyle}
      }
    }

    .${prefixCls}-modal-footer {
      padding: 12px 0 !important;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      column-gap: 12px;

      /* Form controls do not inherit font-family: the browser gives input, button and select
         their own UA font, and antd inherits font-size and colour on them but not the family.
         So the footer buttons (Close, Add New) have to be named explicitly. */
      .${prefixCls}-btn {
        ${fontFamilyStyle}
      }
    }

    /* The dialog close (X) is rendered outside the header/body/footer, on the modal root. */
    .${prefixCls}-modal-close {
      ${fontFamilyStyle}
    }
  `);

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
