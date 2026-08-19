import { createStyles, sheshaStyles } from '@/styles';
import { IStyleValue } from '@/providers/form/models';
import { backgroundStyles, cssPropertiesToString, fontStyles, shadowStyles, borderStyles } from '@/designer-components/_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, styleValue: IStyleValue) => {
  const pickerEllipsisBtnWidth = "45px";

  const pickerInputGroup = "picker-input-group";
  const pickerInputGroupInput = "picker-input-group-input";
  const pickerInputGroupEllipsis = "sha-entity-picker-button";
  const entityPickerModalPagerContainer = "entity-picker-modal-pager-container";

  const shaReactTable = "sha-react-table";
  const shaGlobalTableFilter = "sha-global-table-filter";
  // Border, background and shadow are what antd repaints in the interactive and validation
  // states, so they are kept together and re-asserted wherever antd would override them.
  const configuredAppearance = `
    ${borderStyles(styleValue.border)}
    ${backgroundStyles(styleValue.background)}
    ${shadowStyles(styleValue.shadow)}
    ${cssPropertiesToString(styleValue.styleCss)}
  `;

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

  /* The dialog is portalled to the body, so the picker's own Appearance class cannot reach it via
     a descendant selector — it gets the style model passed down instead.

     It inherits background and border from the field that opened it, so the dialog reads as
     belonging to that field rather than sitting on antd's hardcoded white panel. Shadow is
     deliberately excluded (see popupAppearanceStyles): elevation is what makes an overlay look
     native, so it stays with the theme. Dimensions are excluded too — the dialog is sized by its
     own width setting, and the field's width would squash the table inside it. */


  const entityPickerModal = cx("entity-picker-modal", css`
          ${configuredAppearance}
         
        /* antd paints the header and body on their own elements, which would cover the inherited
           background on the content panel above. */
        .${prefixCls}-modal-header,
        .${prefixCls}-modal-body,
        .${prefixCls}-modal-footer {
          background: transparent;
        }

        /* antd sets font on the title element itself, so an inherited value never reaches it. */
        .${prefixCls}-modal-title {
          ${fontStyles(styleValue.font)}
        }

        .${prefixCls}-modal-body {
          ${fontStyles(styleValue.font)}

          .ant-alert {
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
          border: 1px solid ${styleValue.border?.border?.all?.color ?? '#d9d9d9'};
          ${borderStyles(styleValue.border)}
          border-radius: 6px;
          box-sizing: border-box;
          ${sheshaStyles.thinScrollbars}
        }
      
        .${entityPickerModalPagerContainer} {
          display: flex;
          justify-content: flex-end;
          margin: ${sheshaStyles.paddingLG}px 0;
      
          .${prefixCls}-pagination-options-size-changer {
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
