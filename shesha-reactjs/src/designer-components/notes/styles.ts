import { createStyles } from '@/styles';
import { INotesComponentProps } from './interfaces';
import {
  backgroundStyles,
  borderStyles,
  dimensionsStyles,
  fontStyles,
  marginStyles,
  paddingStyles,
  shadowStyles,
} from '../_common/styles/utils';

export const useStyles = createStyles(({ css, cx, prefixCls }, model: INotesComponentProps) => {
  /* The configured box appearance, kept in one place so the base rule and the stateful rule below
     cannot drift apart. */
  const configuredAppearance = `
    ${borderStyles(model.border)}
    ${backgroundStyles(model.background)}
    ${shadowStyles(model.shadow)}
  `;

  const notes = cx('sha-notes-component', css`
    ${dimensionsStyles(model.dimensions)}
    ${marginStyles(model.stylingBoxJson)}
    ${paddingStyles(model.stylingBoxJson)}
    ${configuredAppearance}
    ${fontStyles(model.font, model.styleCss)}

    /* antd repaints the background on hover/focus and on the validation statuses, and the status
       rules use the background shorthand, which would also wipe a configured image or gradient.
       Re-assert the configured appearance in each of those states so they only affect what the
       user did not configure. */
    &&&&:hover,
    &&&&:focus,
    &&&&:focus-within,
    &&&&[class*="-status-error"],
    &&&&[class*="-status-warning"] {
      ${configuredAppearance}
    }

    /* The list and its card are structural containers inside the component, not separate surfaces:
       let the configured background show through instead of antd painting them white. */
    .${prefixCls}-card,
    .${prefixCls}-card-body,
    .${prefixCls}-list {
      background: transparent;
    }

    /* antd sets font on the note text itself, so a rule on the root is overridden rather than
       inherited. Restate it on the elements that actually hold text. */
    .${prefixCls}-list-item,
    .${prefixCls}-comment-content,
    .${prefixCls}-typography {
      ${fontStyles(model.font, model.styleCss)}
    }

    /* The Custom style must beat antd everywhere, so it gets its own rule at higher specificity.
       Emits nothing extra when no Custom style is set. */
    &&& .${prefixCls}-list-item,
    &&& .${prefixCls}-comment-content,
    &&& .${prefixCls}-typography {
      ${fontStyles(model.font, model.styleCss)}
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
