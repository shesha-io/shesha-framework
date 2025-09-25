import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaRichTextEditor = cx("sha-rich-text-editor", css`
        background-color: white;
  
        .jodit-status-bar__item-right {
            .jodit-status-bar-link {
                display: none;
            }
        }
  `);
  return {
    shaRichTextEditor,
  };
});
