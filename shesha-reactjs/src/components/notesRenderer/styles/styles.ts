import { createStyles } from '@/styles';

export const useStyles = createStyles(({ css, cx }) => {
  const shaNotesRenderer = cx("sha-notes-renderer", css`
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
    shaNotesRenderer
  };
});