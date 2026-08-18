import { createStyles, sheshaStyles } from '@/styles';

// No model parameter: callers style this component by passing a `className`, which is composed
// onto the picker root, rather than by threading a style model through here.
export const useStyles = createStyles(({ css, cx, token, iconPrefixCls }) => {
  const shaIconPickerSelectedIcon = "sha-icon-picker-selected-icon";

  /*
   * Trigger styles only. Everything visual (border, background, font, spacing) is left to the
   * caller's className so a configured appearance is not fighting a default here — this block
   * sets the affordance and nothing else.
   */
  const shaIconPicker = cx("sha-icon-picker", css`
    .${shaIconPickerSelectedIcon} {
      display: inline-flex;
      align-items: center;

      &:not(.sha-readonly) {
        cursor: pointer;
      }

      /* The button is a placeholder for "no icon chosen yet", not a control in its own right:
         strip its chrome so it presents as a bare glyph, like the selected state does. */
      .ant-btn {
        background: transparent;
        border-color: transparent;
        box-shadow: none;
        color: inherit;

        &:hover,
        &:focus,
        &:active {
          background: transparent;
          border-color: transparent;
          color: inherit;
        }
      }
    }
  `);

  const shaIconPickerSearch = "sha-icon-picker-search";
  const shaIconPickerSearchInputContainer = "sha-icon-picker-search-input-container";
  const shaIconPickerIconList = "sha-icon-picker-icon-list";
  const shaIconPickerIconListGroup = "sha-icon-picker-icon-list-group";
  const shaIconPickerIconListGroupHeader = "sha-icon-picker-icon-list-group-header";
  const shaIconPickerIconListGroupBody = "sha-icon-picker-icon-list-group-body";
  const shaIconPickerIconListIcon = "sha-icon-picker-icon-list-icon";
  const shaIconPickerIconListIconName = "sha-icon-picker-icon-list-icon-name";

  const shaIconPickerModal = cx("sha-icon-picker-modal", css`
    .${shaIconPickerSearch} {
      display: flex;
      margin-bottom: ${sheshaStyles.paddingLG}px;

      .${shaIconPickerSearchInputContainer} {
        margin-left: ${sheshaStyles.paddingLG}px;
        flex: 1;
      }
    }

    .${shaIconPickerIconList} {
      max-height: 600px;
      overflow-y: auto;

      .${shaIconPickerIconListGroup} {
        .${shaIconPickerIconListGroupHeader} {
          font-size: 16px;
          font-weight: 500;
          margin: ${sheshaStyles.paddingLG}px 0;
        }

        .${shaIconPickerIconListGroupBody} {
          display: grid;
          grid-template-columns: auto auto auto auto;

          .${shaIconPickerIconListIcon} {
            padding: 12px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            &:hover {
              background: ${token.colorPrimaryBgHover};
              border-radius: 4px;

              .${iconPrefixCls},
              .${shaIconPickerIconListIconName} {
                transform: scale(1.25);
              }
            }

            .${shaIconPickerIconListIconName} {
              margin-top: 12px;
            }
          }
        }
      }
    }
  `);

  return {
    shaIconPicker,
    shaIconPickerSelectedIcon,
    shaIconPickerModal,
    shaIconPickerSearch,
    shaIconPickerSearchInputContainer,
    shaIconPickerIconList,
    shaIconPickerIconListGroup,
    shaIconPickerIconListGroupHeader,
    shaIconPickerIconListGroupBody,
    shaIconPickerIconListIcon,
    shaIconPickerIconListIconName,
  };
});
