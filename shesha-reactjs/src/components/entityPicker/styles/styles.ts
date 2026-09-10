import { createStyles, sheshaStyles } from '@/styles';
import { IStyleValue } from '@/providers/form/models';
import { backgroundStyles } from '@/designer-components/_common/styles/utils';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export const useStyles = createStyles(({ css, cx, prefixCls }, model?: IStyleValue) => {
  const pickerEllipsisBtnWidth = "45px";

  const pickerInputGroup = "picker-input-group";
  const pickerInputGroupInput = "picker-input-group-input";
  const pickerInputGroupEllipsis = "sha-entity-picker-button";
  const entityPickerModalPagerContainer = "entity-picker-modal-pager-container";

  const shaReactTable = "sha-react-table";
  const shaGlobalTableFilter = "sha-global-table-filter";

  /* Only the family: the picker configures the dialog typeface, but size, weight and colour are
     left to each control so the table, buttons and search keep their own defaults. */
  const fontFamily = model?.font?.type ?? model?.styleCss?.fontFamily;
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
    }

    .${shaReactTable} {
      margin: unset !important;
      width: 100% !important;
      display: block !important;
      overflow: auto;
      border-radius: 6px;
      box-sizing: border-box;
      ${sheshaStyles.thinScrollbars}
    }

    .${entityPickerModalPagerContainer} {
      display: flex;
      justify-content: flex-end;
      margin: ${sheshaStyles.paddingLG}px 0;

      .${prefixCls}-select {
        margin-right: 0 !important;
      }
    }

    .${prefixCls}-modal-footer {
      padding: 12px 0 !important;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      column-gap: 12px;
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
