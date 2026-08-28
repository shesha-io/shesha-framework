import { createStyles } from '@/styles';
import { INotesComponentProps } from './interfaces';
import { dimensionsStyles, fontStyles, marginStyles, paddingStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: INotesComponentProps) => {
  const font = fontStyles(model.font);

  /* The same font without its alignment, for elements whose position is set by their own layout
     rather than by the text flow: the author/time header is a two-part row, and the expand link is
     inline inside the note paragraph and already follows it. Aligning either would move it
     independently of the text it belongs to. */
  const fontWithoutAlign = fontStyles({ ...model.font, align: undefined });

  const notes = cx('sha-notes-component', css`
    ${dimensionsStyles(model.dimensions)}

    /* antd sets the font on each of these elements directly, so a rule on the component root is
       overridden rather than inherited - the configured font has to be restated on every element
       that actually holds text. The repeated class beats both antd's own rules and the notes
       renderer's base styles, which reach the same elements through a single class.

       The editor: the new-note textarea and the one shown while editing an existing note. Both are
       plain antd inputs, and the placeholder is styled separately from the value. */
    &&& .${prefixCls}-input,
    &&& textarea.${prefixCls}-input {
      ${font}
      ${paddingStyles(model.stylingBoxJson)}
    }

    &&& ${prefixCls}-card-body {
      ${paddingStyles(model.stylingBoxJson)}
    }

    &&& .${prefixCls}-input::placeholder,
    &&& textarea.${prefixCls}-input::placeholder {
      ${font}
    }

    /* The note text itself. Typography sets its own size and colour on .ant-typography, and the
       base styles reach it as '.ant-comment-inner .ant-typography'. */
    &&& .${prefixCls}-comment-content,
    &&& .${prefixCls}-comment-content-detail,
    &&& .${prefixCls}-comment-content-detail .${prefixCls}-typography {
      ${font}
    }

    /* The author name and the timestamp above each note, and the 'more' link the note text
       collapses behind - all positioned by their own layout, so they take the font without its
       alignment. */
    &&& .${prefixCls}-comment-content-author-name,
    &&& .${prefixCls}-comment-content-author-time,
    &&& .${prefixCls}-typography-expand {
      ${fontWithoutAlign}
    }

    /* The empty-state text shown when there are no notes yet, which antd centres itself. */
    &&& .${prefixCls}-empty-description {
      ${fontWithoutAlign}
    }

    /* The scrollbar of the notes list, carried over from the previous renderer styles. */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-thumb {
      background-color: gray;
    }

    ::-webkit-scrollbar-track {
      background-color: lightgrey;
    }
  `);

  return {
    notes,
  };
});
