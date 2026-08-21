import { createStyles } from '@/styles';
import { IFileUploadProps } from './interfaces';
import {
  backgroundStyles,
  borderStyles,
  dimensionsStyles,
  fontStyles,
  marginStyles,
  paddingStyles,
  popupAppearanceStyles,
  shadowStyles,
} from '../_common/styles/utils';
import { addPx } from '@/utils/style';

/**
 * Appearance for the File component.
 *
 * The box half of the appearance (border, background, shadow, dimensions) describes the *thumbnail
 * tile* — the square that holds the image or file icon — and nothing else. In thumbnail mode the
 * uploader renders the tile and the file name stacked inside a wrapper:
 *
 *   .ant-upload-list-item-container   wrapper: tile + file name
 *     .ant-upload-list-item
 *       .styled-file-controls         <- the tile
 *       .thumbnail-item-name          <- the file name
 *   .ant-upload.ant-upload-select     the empty/upload tile, same role as .styled-file-controls
 *
 * Sizing the wrapper instead of the tile would make the configured dimensions bound the tile *and*
 * the file name together, clipping the name. So the tile selectors carry the box appearance and the
 * dimensions, while the wrappers are left to size themselves to their content and the file name is
 * free to take whatever width it needs.
 *
 * In file-name mode there is no tile: the component is a plain file name and an upload button, and a
 * configured border or shadow around that reads as a bug — so **only Font and Margin & Padding
 * apply**, and dimensions/border/background/shadow are not emitted at all. The settings form hides
 * those panels for this display type to match (see settingsForm.ts), so the rule is enforced at both
 * ends rather than leaving inputs that collect values which never render. This mirrors the gating in
 * releases/0.45, expressed as scoped CSS so that unset properties are simply not emitted and can
 * still be set at a higher level.
 */
export const useStyles = createStyles(({ css, cx, prefixCls }, model: IFileUploadProps) => {
  const isThumbnail = model.listType === 'thumbnail' && model.isDragger !== true;

  // The wrappers around the tile take the tile width so the file name ellipsises against it.
  // `fit-content` keeps them correct when no width is configured (the tile then sizes itself).
  const tileWidth = addPx(model.dimensions?.width) ?? 'fit-content';

  // Border/background/shadow of the tile. antd repaints the tile background on :hover and while a
  // file is dragged over it, so the configured appearance is re-asserted in those states at higher
  // specificity — otherwise it visibly disappears mid-interaction.
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  // The tile in both its states: .styled-file-controls once a file is attached, .ant-upload-select
  // while empty. Both carry the configured box appearance and dimensions. The child style hook
  // stands down from sizing these when no computed style is passed to it (see its styleProvided
  // note), so these rules are not fighting its !important declarations.
  const tileAppearance = isThumbnail
    ? `
      &&& .styled-file-controls,
      &&& .thumbnail-stub,
      &&& .${prefixCls}-upload.${prefixCls}-upload-select {
        ${configuredAppearance}
        ${dimensionsStyles(model.dimensions)}
        box-sizing: border-box;

        &&&&:hover,
        &&&&:focus,
        &&&&:focus-within {
          ${configuredAppearance}
        }
      }

      /* In the designer the component renders a stub instead of a live uploader, and .thumbnail-stub
         plays the tile's role — hence its inclusion above. The upload button inside it is only a
         placeholder glyph: it must take the tile's dimensions (so the stub stays clickable at its
         full size) and nothing else. The child hook already pins it to 100%/100% with a transparent
         background and no border, so only the box appearance needs excluding here — which it is,
         because the rule above targets the tile rather than its contents. */

      /* The wrappers stack the tile and the single-line file name. They take the tile width — which
         is what the name ellipsises against — but their height must stay automatic so the name line
         is added *below* the tile instead of eating into it. That is what keeps the tile identical
         whether or not the name is shown. The box appearance belongs to the tile, so it is stripped
         from the wrappers here. */
      .${prefixCls}-upload-list-item-container,
      .${prefixCls}-upload-list-item-container > div,
      .${prefixCls}-upload-list-item {
        width: ${tileWidth} !important;
        height: auto !important;
        max-width: none !important;
        max-height: none !important;
        background: transparent;
        border: none;
        box-shadow: none;
      }

      /* The tile keeps its configured height regardless of the name, so it cannot be squeezed by
         the flex column it sits in. */
      &&& .styled-file-controls,
      &&& .thumbnail-stub {
        flex: none;
      }

      /* The name takes only text styling; its box is the tile width and one line tall. */
      .thumbnail-item-name {
        width: 100% !important;
        max-width: 100% !important;
        flex: none;
      }
    `
    : '';

  // In dragger mode the drop area is the visible box, so it plays the tile's role.
  const draggerAppearance = model.isDragger === true
    ? `
      &&& .${prefixCls}-upload.${prefixCls}-upload-drag {
        ${configuredAppearance}
        ${dimensionsStyles(model.dimensions)}
        box-sizing: border-box;

        &&&&:hover,
        &&&&.${prefixCls}-upload-drag-hover {
          ${configuredAppearance}
        }
      }
    `
    : '';

  const fileUpload = cx('sha-file-upload', css`
    ${marginStyles(model.stylingBoxJson)}
    ${paddingStyles(model.stylingBoxJson)}
    ${fontStyles(model.font, model.styleCss)}

    ${tileAppearance}
    ${draggerAppearance}

    /* Font is restated on the elements that actually hold text: antd sets font and colour on them,
       so a rule on the root is overridden rather than inherited. */
    .${prefixCls}-upload-list-item-name,
    .${prefixCls}-upload-text,
    .${prefixCls}-upload-hint,
    .thumbnail-item-name,
    .thumbnail-item-name a,
    .thumbnail-stub .${prefixCls}-btn,
    .${prefixCls}-btn-link {
      ${fontStyles(model.font, model.styleCss)}
    }

    /* Same call at higher specificity, so a Custom style beats antd where the rule above
       deliberately does not. Emits nothing extra when no Custom style is set. */
    &&& .${prefixCls}-upload-list-item-name,
    &&& .thumbnail-item-name a {
      ${fontStyles(model.font, model.styleCss)}
    }
  `);

  /**
   * The component opens three floating surfaces — the version-history Popover, the delete
   * confirmation Modal and the full-size image preview. All are portalled to the body, so a
   * descendant selector from the root class cannot reach them and each needs its own class passed
   * through the control's popup-specific prop.
   *
   * They take the configured background and font so they read as part of the component, but never
   * the shadow: on an overlay a shadow is structural rather than decorative, and a configured offset
   * would throw a band of colour across whatever the popup covers. Elevation stays with the theme,
   * which is also what users expect a popup to look like. `popupAppearanceStyles` encodes that — its
   * parameter type omits `shadow`, so it cannot be passed by mistake.
   */
  const popupAppearance = `
    ${popupAppearanceStyles(model)}
    ${paddingStyles(model.stylingBoxJson)}
  `;

  // antd paints popovers and modals on an inner element, which would cover the background set on the
  // root, so those are cleared. Font is restated on the elements that actually hold text: antd sets
  // it on them directly, so a rule on the popup root is overridden rather than inherited.
  const popup = cx('sha-file-upload-popup', css`
    &&& {
      ${popupAppearance}
    }

    &&& .${prefixCls}-popover-inner,
    &&& .${prefixCls}-popover-title,
    &&& .${prefixCls}-popover-inner-content {
      background: transparent;
      ${fontStyles(model.font, model.styleCss)}
    }

    &&& .${prefixCls}-popover-inner-content .${prefixCls}-btn-link {
      ${fontStyles(model.font, model.styleCss)}
    }
  `);

  const modal = cx('sha-file-upload-modal', css`
    &&& .${prefixCls}-modal-content {
      ${popupAppearance}
    }

    &&& .${prefixCls}-modal-header,
    &&& .${prefixCls}-modal-body,
    &&& .${prefixCls}-modal-confirm-title,
    &&& .${prefixCls}-modal-confirm-content {
      background: transparent;
      ${fontStyles(model.font, model.styleCss)}
    }
  `);

  // The image preview is a full-screen overlay: it deliberately keeps antd's own dark backdrop
  // rather than the configured background, which would make the image hard to read. Only the
  // toolbar text follows the component font.
  const imagePreview = cx('sha-file-upload-preview', css`
    &&& .${prefixCls}-image-preview-operations {
      ${fontStyles(model.font, model.styleCss)}
    }
  `);

  return {
    fileUpload,
    popup,
    modal,
    imagePreview,
  };
});
