import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaRichTextEditor = cx("sha-rich-text-editor", css`
        background-color: white;
        display: flex;
        flex-direction: column;

        /* Only fill 100% while Auto is on; otherwise shrink-wrap so this wrapper tracks Jodit's own (possibly drag-resized) container instead of staying stale. */
        &.auto-width {
          width: 100%;
          .jodit-react-container, .jodit-container:not(.jodit_fullsize) {
            width: inherit !important;
          }
        }
        &:not(.auto-width) {
          width: fit-content;
        }
        &.auto-height {
          height: 100%;
          .jodit-react-container, .jodit-container:not(.jodit_fullsize) {
            height: inherit !important;
          }
        }
        &:not(.auto-height) {
          height: fit-content;
        }

        /* Excludes fullsize mode - a fixed size here would override Jodit's own fullsize inline sizing. */
        .jodit-container:not(.jodit_fullsize) {
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
