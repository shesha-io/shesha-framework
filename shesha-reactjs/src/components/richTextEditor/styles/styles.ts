import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
    const shaRichTextEditor = cx("sha-rich-text-editor", css`
        background-color: white;
  
        .jodit-react-container {
            height: 100%;
        }
        .jodit-container {
            height: 100% !important;
            display: flex;
            flex-direction: column;

            .jodit-workplace {
                flex: 1;
            }
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