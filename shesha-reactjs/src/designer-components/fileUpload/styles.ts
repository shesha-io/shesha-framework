import { createStyles } from '@/styles';
import { IFileUploadProps } from './interfaces';
import {
  backgroundStyles,
  borderStyles,
  dimensionsStyles,
  fontStyles,
  marginStyles,
  paddingStyles,
  shadowStyles,
} from '../_common/styles/utils';
import { addPx } from '@/utils/style';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: IFileUploadProps) => {
  const isThumbnail = model.listType === 'thumbnail' && model.isDragger !== true;

  // The wrappers around the tile take the tile width so the file name ellipsises against it.
  // `fit-content` keeps them correct when no width is configured (the tile then sizes itself).
  const tileWidth = addPx(model.dimensions?.width) ?? 'fit-content';

  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const tileAppearance = isThumbnail
    ? `
      &&& .styled-file-controls,
      &&& .thumbnail-stub {
        ${configuredAppearance}
        ${dimensionsStyles(model.dimensions)}
        box-sizing: border-box;

        &&&&:hover,
        &&&&:focus,
        &&&&:focus-within {
          ${configuredAppearance}
        }
      }


      &&& .${prefixCls}-upload.${prefixCls}-upload-select {
        ${dimensionsStyles(model.dimensions)}
        ${fontStyles({ type: model.font?.type })}
        box-sizing: border-box;
        box-shadow: none;
      }


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

  /* In dragger mode the drop area is the visible box, so it plays the tile's role and takes the
     configured border/background/shadow.
     It does NOT take the configured dimensions. Those describe the thumbnail tile — a ~54px square —
     and the Dimensions panel is hidden for a dragger precisely because it has no tile, so the value
     sitting in the model is a stale or default tile size rather than anything the user chose for the
     drop area. Applying it collapsed the drop area into a narrow column with its prompt text
     overflowing. Instead the area spans the field width and sizes its own height to its content,
     which is how the file list's dragger already behaves. */
  const draggerAppearance = model.isDragger === true
    ? `
      &&& .${prefixCls}-upload.${prefixCls}-upload-drag {
        width: 100%;
        height: auto;
        box-sizing: border-box;

        /* antd repaints the drop area on hover and while a file is dragged over it, so the
           configured appearance is restated at higher specificity or it visibly disappears
           mid-interaction — the same reason the tile rule above restates it. */
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
    .thumbnail-item-name,
    .thumbnail-item-name a,
    .thumbnail-stub .${prefixCls}-btn,
    .${prefixCls}-btn-link {
      ${fontStyles(model.font, model.styleCss)}
    }

    /* The dragger stub's prompt lines take the configured font but are always centred: the stub is a
       centred block (icon above two lines of text), so letting the configured Align through would
       shunt the text to one edge while the icon above it stayed put. */
    .${prefixCls}-upload-text,
    .${prefixCls}-upload-hint {
      ${fontStyles({ ...model.font, align: undefined }, { ...model.styleCss, textAlign: undefined })}
      text-align: center;
    }

    /* Same call at higher specificity, so a Custom style beats antd where the rule above
       deliberately does not. Emits nothing extra when no Custom style is set. */
    &&& .${prefixCls}-upload-list-item-name,
    &&& .thumbnail-item-name a {
      ${fontStyles(model.font, model.styleCss)}
    }
  `);

  /* The three floating surfaces this component opens — the version-history popover, the delete
     confirmation modal and the full-screen image preview — are portalled to the body, so no
     descendant selector from the field can reach them: each takes its class through its own prop.

     They take **font family only**, matching the file list's popups. Colour is left to antd so the
     panel keeps its own text/secondary/danger distinctions — a single configured colour flattens
     them. Size, weight and alignment are excluded because a panel is sized by antd's own type scale
     rather than by the field, and background/border/shadow because a floating surface's elevation is
     the theme's to own. `fontStyles` emits every property it is handed, so the Font model is
     narrowed here rather than passed whole. */
  const popupFontStyles = fontStyles(
    { type: model.font?.type, color: undefined, size: undefined, weight: undefined, align: undefined },
    { fontFamily: model.styleCss?.fontFamily },
  );

  /* Version-history popover. antd sets the font on the title, the content and each row, so the
     configured font is restated on all of them rather than left to inherit from the panel. */
  const popup = cx('sha-file-upload-history-popover', css`
    &&& .${prefixCls}-popover-title,
    &&& .${prefixCls}-popover-content,
    &&& .${prefixCls}-popover-content li,
    &&& .${prefixCls}-popover-content .${prefixCls}-typography {
      ${popupFontStyles}
    }

    &&& .${prefixCls}-popover-content .${prefixCls}-btn-link {
      ${popupFontStyles}
    }
  `);

  /* Delete confirmation modal. */
  const modal = cx('sha-file-upload-confirm-modal', css`
    &&& .${prefixCls}-modal-title,
    &&& .${prefixCls}-modal-confirm-title,
    &&& .${prefixCls}-modal-confirm-content {
      ${popupFontStyles}
    }

    /* The Yes/Cancel buttons keep antd's own colours so the primary/default distinction survives. */
    &&& .${prefixCls}-modal-confirm-btns .${prefixCls}-btn {
      ${popupFontStyles}
    }
  `);

  /* Full-screen image preview. It covers the viewport rather than sitting next to the field, so it
     takes none of the field's appearance — only the operations bar follows the configured family. */
  const imagePreview = cx('sha-file-upload-preview', css`
    &&& .${prefixCls}-image-preview-operations {
      ${popupFontStyles}
    }
  `);

  return {
    fileUpload,
    popup,
    modal,
    imagePreview,
  };
});
