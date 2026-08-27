import { createStyles } from '@/styles';
import { INotesComponentProps } from './interfaces';
import { dimensionsStyles, fontStyles, marginStyles, paddingStyles } from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: INotesComponentProps) => {
  const notes = cx('sha-notes-component', css`
    ${dimensionsStyles(model.dimensions)}
    ${marginStyles(model.stylingBoxJson)}
    ${paddingStyles(model.stylingBoxJson)}
    ${fontStyles(model.font)}

    /* antd sets font on the note text itself, so a rule on the root is overridden rather than
       inherited. Restate it on the elements that actually hold text. */
    .${prefixCls}-list-item,
    .${prefixCls}-comment-content,
    .${prefixCls}-typography {
      ${fontStyles(model.font)}
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
