import { CSSProperties } from 'react';
import { createStyles } from '@/styles';
import { IAttachmentsEditorProps } from './interfaces';
import {
  backgroundStyles,
  fontStyles,
} from '../_common/styles/utils';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

/**
 * The evaluated nested Custom styles. The framework only executes the root `model.style` into
 * `model.styleCss`, so the thumbnail and downloaded-file scripts are evaluated in the Factory and
 * handed in here — this hook stays a pure style builder.
 */
export interface IAttachmentsEditorStyleModel extends IAttachmentsEditorProps {
  thumbnailStyleCss?: CSSProperties | undefined;
  downloadedFileStyleCss?: CSSProperties | undefined;
}

export const useStyles = createStyles((
  { css, cx, token, prefixCls },
  model: IAttachmentsEditorStyleModel,
) => {
  /* Popups are portalled to the body, so no descendant selector from the classes above can reach
     them: each needs its own class passed through the popup-specific prop.

     A popup takes **background, text colour and font family only**.

     Size, weight and alignment are deliberately excluded. A popup is a floating panel whose layout
     antd sizes from its own type scale — the action row, the history list and the confirm dialog
     all rely on it — so a field configured at 15px/700 would resize and re-align the panel's rows
     rather than just recolouring them. Colour and family are what make the popup read as belonging
     to the field that opened it; the rest is the panel's own business.

     Border, dimensions and shadow are excluded for the same reason: the panel is sized by its
     content, the field width would clip it, and a configured shadow offset would throw a band of
     colour across whatever the popup covers.

     antd 6 renders the panel as `-popover-container` (it is what carries the background, radius and
     elevation) with `-popover-title` and `-popover-content` inside it — not the `-popover-inner` /
     `-popover-inner-content` of antd 5. */
  const popupFontStyles = fontStyles(
    { color: model.font?.color, type: model.font?.type },
    { color: model.styleCss?.color, fontFamily: model.styleCss?.fontFamily },
  );

  /* Family only — for links and buttons, whose colour is their own (primary, danger, …). */
  const popupButtonFontStyles = fontStyles(
    { type: model.font?.type },
    { fontFamily: model.styleCss?.fontFamily },
  );

  /* A popup is a floating surface, so it needs an opaque background. The container's own set is
     deliberately transparent (it is a scrolling box, not a painted panel), which would leave the
     popup on antd's white; fall back to the theme's elevated surface colour so it stays legible on
     a dark theme instead of hardcoding white. */
  const popupBackground = isNotNullOrWhiteSpace(model.background?.color)
    ? backgroundStyles(model.background)
    : `background: ${token.colorBgElevated};`;
  const popupArrowColor = isNotNullOrWhiteSpace(model.background?.color)
    ? model.background.color
    : token.colorBgElevated;

  const popupBase = `
    /* The arrow is painted from a CSS variable rather than a background on the element, so it is
       recoloured by setting that variable — a background rule on the arrow does nothing. */
    &&& { --${prefixCls}-tooltip-arrow-background-color: ${popupArrowColor}; }

    &&& .${prefixCls}-popover-container {
      ${popupBackground}
    }

    /* antd sets the colour and family on the title and content elements themselves, so they are
       restated here rather than left to inherit from the panel. */
    &&& .${prefixCls}-popover-title,
    &&& .${prefixCls}-popover-content {
      ${popupFontStyles}
    }
  `;

  /* Hover popover holding the per-file action buttons (replace, delete, history, download). */
  const actionsPopover = cx('sha-file-list-actions-popover', css`
    ${popupBase}
  `);

  /* Version-history popover. Its rows are a list rather than a single block of text, and antd sets
     the font on each row, so the configured font is restated there for the same reason. */
  const historyPopover = cx('sha-file-list-history-popover', css`
    ${popupBase}

    &&& .${prefixCls}-popover-content li,
    &&& .${prefixCls}-popover-content .${prefixCls}-typography {
      ${popupFontStyles}
    }

    &&& .${prefixCls}-popover-content .${prefixCls}-btn-link {
      ${popupButtonFontStyles}
      color: ${token.colorPrimary};

      &:hover {
        color: ${token.colorPrimaryHover};
      }
    }
  `);

  /* Delete confirmation. antd renders a Popconfirm through the same popover shell, so it shares the
     panel appearance; only its own message and button elements need the font restated. */
  const confirmPopover = cx('sha-file-list-confirm-popover', css`
    ${popupBase}

    &&& .${prefixCls}-popconfirm-message-text,
    &&& .${prefixCls}-popconfirm-description {
      ${popupFontStyles}
    }

    /* The Yes/No buttons keep antd's own colours so the primary/default distinction survives. */
    &&& .${prefixCls}-popconfirm-buttons .${prefixCls}-btn {
      ${popupButtonFontStyles}
    }
  `);

  /* Image preview overlay opened from a thumbnail. It covers the whole viewport rather than sitting
     next to the field, so it takes none of the file box appearance — only the operations bar
     follows the configured font family. */
  const previewMask = cx('sha-file-list-preview', css`
    &&& .${prefixCls}-image-preview-operations {
      ${isNotNullOrWhiteSpace(model.font?.type) ? `font-family: ${model.font.type};` : ''}
    }
  `);

  return {
    actionsPopover,
    historyPopover,
    confirmPopover,
    previewMask,
  };
});
