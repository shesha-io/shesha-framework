import { createStyles, sheshaStyles } from '@/styles';
import { IStyleValue } from '@/providers/form/models';
import {
  backgroundStyles,
  borderStyles,
  cssPropertiesToString,
  fontStyles,
  marginStyles,
  paddingStyles,
  shadowStyles,
} from '@/designer-components/_common/styles/utils';

/**
 * The trigger is laid out as a flex row, which makes `text-align` inert. Map the Font panel
 * alignment onto `justify-content` so the Align input keeps working. `justify` has no flex
 * equivalent for a single item and falls back to start.
 */
const justifyContentFor = (align: AlignSetting | undefined): string => {
  switch (align) {
    case 'right':
    case 'end':
      return 'flex-end';
    case 'center':
      return 'center';
    default:
      return 'flex-start';
  }
};

/**
 * Styles for both the plain picker and the configurable form component.
 *
 * The model is optional: consumers that only need the picker itself (the settings-form icon input)
 * call `useStyles()` and get the trigger and modal styles, while the form component passes its
 * style model and additionally gets `iconPickerStyles` carrying the configured appearance.
 *
 * It is typed as the shared `IStyleValue` rather than the form component props: this file sits in
 * the base component, so depending on `designer-components/iconPicker` would point the dependency
 * the wrong way and close an import cycle back through `ShaIconTypes`.
 */
export const useStyles = createStyles(({ css, cx, token, iconPrefixCls }, model?: IStyleValue) => {
  const shaIconPickerSelectedIcon = "sha-icon-picker-selected-icon";

  /*
   * Trigger styles only. Everything visual (border, background, font, spacing) is left to the
   * configured appearance below, so a styled component is never fighting a default here — this
   * block sets the affordance and strips the placeholder button chrome, nothing more.
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

  /*
   * The configured box goes on the glyph, not on the picker root: the root spans the whole form
   * column, so a border or background there would draw a full-width box around a small icon.
   * On the glyph it hugs the icon, which is what styling a glyph-only component should mean.
   */
  const configuredAppearance = `
    ${borderStyles(model?.border)}
    ${backgroundStyles(model?.background)}
    ${shadowStyles(model?.shadow)}
    ${paddingStyles(model?.stylingBoxJson)}
    ${fontStyles(model?.font)}
    ${cssPropertiesToString(model?.styleCss)}
  `;

  const iconPickerStyles = cx('sha-icon-picker-container', css`
      ${marginStyles(model?.stylingBoxJson)}
      box-sizing: border-box;

      /* Align the trigger within the form column. IconPicker nests the glyph two unstyled,
         block-level divs deep, so the alignment has to be passed down or those full-width divs
         swallow it before it reaches the icon. */
      display: flex;
      justify-content: ${justifyContentFor(model?.font?.align)};

      > div,
      > div > .${shaIconPickerSelectedIcon} {
        display: flex;
        align-items: center;
        justify-content: inherit;
        flex: 1;
      }

      &&&& .${iconPrefixCls} {
        ${configuredAppearance}
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      /* Size the placeholder button from the configured font and padding rather than the antd
         control height, so the empty state matches the selected one. */
      &&&& .ant-btn {
        height: auto;
        width: auto;
        min-width: 0;
        padding: 0;
        border: none;
      }

      /* Hold the configured box through hover and focus so it does not fall back to antd
         defaults mid-interaction. */
      &&&&:hover .${iconPrefixCls},
      &&&&:focus .${iconPrefixCls},
      &&&&:focus-within .${iconPrefixCls} {
        ${configuredAppearance}
      }
    `);

  /**
   * Disabled greys the picker out and blocks interaction; read-only leaves it at full strength
   * because the value is still being presented.
   */
  const disabled = cx('sha-icon-picker-disabled', css`
      cursor: not-allowed;
      opacity: 0.4;

      /* The trigger sets pointer-events: all on itself when not read-only, so the block has to be
         re-applied on the descendant rather than only here. */
      &&& * {
        pointer-events: none;
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
    // Form-component styles
    iconPickerStyles,
    disabled,
  };
});
