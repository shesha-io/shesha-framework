import { CSSProperties } from 'react';
import { createStyles } from '@/styles';
import { IAttachmentsEditorProps } from './interfaces';
import { fontStyles } from '../_common/styles/utils';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';
import { withFontFallback } from '@/designer-components/_settings/utils/font/utils';

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

     A popup takes **font family only**.

     Colour is deliberately excluded along with size, weight and alignment. A popup is a floating
     panel whose layout antd sizes from its own type scale — the action row, the history list and the
     confirm dialog all rely on it — so a field configured at 15px/700 would resize and re-align the
     panel's rows rather than just recolouring them; and its text, secondary and danger colours carry
     meaning that a single configured colour would flatten. The family is what makes the popup read
     as belonging to the field that opened it; the rest is the panel's own business.

     Background, border, dimensions and shadow are excluded too: the panel is a surface antd paints
     and elevates itself, the field width would clip it, and a configured shadow offset would throw
     a band of colour across whatever the popup covers.

     antd 6 renders the panel as `-popover-container` (it is what carries the background, radius and
     elevation) with `-popover-title` and `-popover-content` inside it — not the `-popover-inner` /
     `-popover-inner-content` of antd 5. */
  /* Narrowed to the family alone. `fontStyles` emits every property it is given, so passing the
     whole Font model would leak colour, size, weight and alignment into the panel — the very
     properties the note above says are excluded. */
  const popupFontStyles = fontStyles(
    { type: model.font?.type, color: undefined, size: undefined, weight: undefined, align: undefined },
    { fontFamily: model.styleCss?.fontFamily },
  );

  const popupBase = `
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
      ${popupFontStyles}
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
      ${popupFontStyles}
    }
  `);

  /* Image preview overlay opened from a thumbnail. It covers the whole viewport rather than sitting
     next to the field, so it takes none of the file box appearance — only the operations bar
     follows the configured font family. */
  const previewMask = cx('sha-file-list-preview', css`
    &&& .${prefixCls}-image-preview-operations {
      ${isNotNullOrWhiteSpace(model.font?.type) ? `font-family: ${withFontFallback(model.font.type)};` : ''}
    }
  `);

  return {
    actionsPopover,
    historyPopover,
    confirmPopover,
    previewMask,
  };
});
