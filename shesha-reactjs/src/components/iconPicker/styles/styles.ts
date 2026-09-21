import { createStyles, sheshaStyles } from '@/styles';
import { IStyleValue } from '@/providers/form/models';
import {
  backgroundStyles,
  borderStyles,
  cssPropertiesToString,
  fontStyles,
  justifyContentFor,
  marginStyles,
  paddingStyles,
  shadowStyles,
} from '@/designer-components/_common/styles/utils';

// Styles for both the plain picker and the configurable form component; `model` is optional since callers of the plain picker skip it.
export const useStyles = createStyles(({ css, cx, token, iconPrefixCls }, model?: IStyleValue) => {
  const shaIconPickerSelectedIcon = "sha-icon-picker-selected-icon";

  // Trigger styles only; visual appearance is left to configuredAppearance below.
  const shaIconPicker = cx("sha-icon-picker", css`
    .${shaIconPickerSelectedIcon} {
      display: inline-flex;
      align-items: center;

      &:not(.sha-readonly) {
        cursor: pointer;
      }

      /* Strip button chrome so the "no icon chosen" placeholder presents as a bare glyph. */
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

  // The configured box goes on the glyph, not the picker root, so it hugs the icon instead of the whole form column.
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

      /* Passed down through IconPicker's two unstyled wrapper divs, or they'd swallow the alignment. */
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

      /* Size the placeholder button from configured font/padding so the empty state matches the selected one. */
      &&&& .ant-btn {
        height: auto;
        width: auto;
        min-width: 0;
        padding: 0;
        border: none;
      }

      /* Hold the configured box through hover/focus so it doesn't fall back to antd defaults. */
      &&&&:hover .${iconPrefixCls},
      &&&&:focus .${iconPrefixCls},
      &&&&:focus-within .${iconPrefixCls} {
        ${configuredAppearance}
      }
    `);

  // Disabled greys the picker out and blocks interaction; read-only leaves it at full strength.
  const disabled = cx('sha-icon-picker-disabled', css`
      cursor: not-allowed;
      opacity: 0.4;

      /* Re-applied on the descendant since the trigger sets pointer-events: all on itself when not read-only. */
      &&& * {
        pointer-events: none;
      }
    `);

  const shaIconPickerSearch = "sha-icon-picker-search";
  const shaIconPickerSearchInputContainer = "sha-icon-picker-search-input-container";
  const shaIconPickerBrowseArea = "sha-icon-picker-browse-area";
  const shaIconPickerIconList = "sha-icon-picker-icon-list";
  const shaIconPickerIconListIcon = "sha-icon-picker-icon-list-icon";
  const shaIconPickerIconListIconName = "sha-icon-picker-icon-list-icon-name";
  const shaIconPickerCategoryIndex = "sha-icon-picker-category-index";
  const shaIconPickerCategoryIndexItem = "sha-icon-picker-category-index-item";
  const shaIconPickerCategoryIndexItemLabel = "sha-icon-picker-category-index-item-label";
  const shaIconPickerCategoryIndexItemCount = "sha-icon-picker-category-index-item-count";
  const shaIconPickerLegacyList = "sha-icon-picker-legacy-list";
  const shaIconPickerIconListGroupBody = "sha-icon-picker-icon-list-group-body";

  const shaIconPickerModal = cx("sha-icon-picker-modal", css`
    /* Body height/display/overflow are set via the Modal's styles={{ body: {...} }} prop, not a class, so it reliably wins over antd's own injected Modal styles. */

    .${shaIconPickerSearch} {
      flex: 0 0 auto;
      display: flex;
      gap: ${sheshaStyles.paddingLG}px;
      margin-bottom: ${sheshaStyles.paddingLG}px;

      .${shaIconPickerSearchInputContainer} {
        flex: 1;
      }
    }

    .${shaIconPickerBrowseArea} {
      flex: 1;
      min-height: 0;
      display: flex;
      gap: ${sheshaStyles.paddingLG}px;
    }

    .${shaIconPickerIconList} {
      flex: 1;
      height: 100%;
      min-width: 0;
      /* Overrides flex's default "auto" min-height, which would let react-window's Grid grow to fit instead of scrolling. */
      min-height: 0;
    }

    .${shaIconPickerIconListIcon} {
      padding: 8px 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      overflow: hidden;

      &:hover {
        background: ${token.colorPrimaryBgHover};
        border-radius: 4px;

        .${iconPrefixCls} {
          transform: scale(1.25);
        }
      }

      .${shaIconPickerIconListIconName} {
        margin-top: 8px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
      }
    }

    .${shaIconPickerCategoryIndex} {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      flex: 0 0 auto;
      /* border-box so width includes the border/padding below, keeping the divider aligned with the Select above. */
      box-sizing: border-box;
      width: 280px;
      height: 100%;
      min-height: 0;
      overflow-y: auto;
      border-right: 1px solid ${token.colorBorderSecondary};
      padding-right: ${sheshaStyles.paddingLG}px;

      .${shaIconPickerCategoryIndexItem} {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 6px 12px;
        margin-bottom: 4px;
        border-radius: 16px;
        border: 1px solid ${token.colorBorder};
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        /* Otherwise a <button> shrink-wraps to content, pushing the sidebar wider than its fixed 280px column. */
        width: 100%;
        box-sizing: border-box;
        min-width: 0;

        &:hover {
          background: ${token.colorPrimaryBgHover};
          border-color: ${token.colorPrimary};
        }

        &.active {
          background: ${token.colorPrimary};
          border-color: ${token.colorPrimary};
          color: ${token.colorWhite};
        }

        .${shaIconPickerCategoryIndexItemLabel} {
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .${shaIconPickerCategoryIndexItemCount} {
          color: ${token.colorTextTertiary};
          font-size: 12px;
        }

        &.active .${shaIconPickerCategoryIndexItemCount} {
          color: ${token.colorWhite};
          opacity: 0.85;
        }
      }
    }

    .${shaIconPickerLegacyList} {
      flex: 1;
      min-height: 0;
      overflow-y: auto;

      .${shaIconPickerIconListGroupBody} {
        display: grid;
        grid-template-columns: auto auto auto auto;
      }
    }
  `);

  return {
    shaIconPicker,
    shaIconPickerSelectedIcon,
    shaIconPickerModal,
    shaIconPickerSearch,
    shaIconPickerSearchInputContainer,
    shaIconPickerBrowseArea,
    shaIconPickerIconList,
    shaIconPickerIconListIcon,
    shaIconPickerIconListIconName,
    shaIconPickerCategoryIndex,
    shaIconPickerCategoryIndexItem,
    shaIconPickerCategoryIndexItemLabel,
    shaIconPickerCategoryIndexItemCount,
    shaIconPickerLegacyList,
    shaIconPickerIconListGroupBody,
    // Form-component styles
    iconPickerStyles,
    disabled,
  };
});
