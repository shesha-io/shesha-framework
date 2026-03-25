import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaRichTextEditor = cx("sha-rich-text-editor", css`
        background-color: white;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;

        /* Ensure the jodit container fills available space */
        .jodit-react-container {
          width: 100% !important;
          height: 100% !important;
        }

        .jodit-container {
            width: 100% !important;
            height: 100% !important;
            display: flex;
            flex-direction: column;

        }

        .jodit-workplace {
            flex: 1;
        }
  
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
