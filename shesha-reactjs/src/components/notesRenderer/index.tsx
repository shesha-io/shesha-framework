import React, { FC, CSSProperties } from 'react';
import { useNotes } from '@/providers';
import NotesRendererBase from '@/components/notesRendererBase';
import { useStyles } from './styles/styles';

export interface INotesRendererProps {
  showCommentBox?: boolean;
  ownerId?: string;
  ownerType?: string;
  commentListStyles?: CSSProperties;
  buttonPostion?: 'left' | 'right';
  autoSize?: boolean;
  allowDelete?: boolean;
}

export const NotesRenderer: FC<INotesRendererProps> = ({ autoSize, buttonPostion, showCommentBox = true, allowDelete }) => {
  const { notes, deleteNotes, isInProgress, postNotes } = useNotes();
  const { styles } = useStyles();

  const { fetchNotes: isFetchingNotes, postNotes: isPostingNotes } = isInProgress;

  return (
    <div className={styles.shaNotesRenderer}>
      <NotesRendererBase
        deleteNotes={deleteNotes}
        postNotes={postNotes}
        notes={notes}
        showCommentBox={showCommentBox}
        isFetchingNotes={isFetchingNotes}
        isPostingNotes={isPostingNotes}
        buttonFloatRight={buttonPostion === 'right'}
        autoSize={autoSize}
        allowDelete={allowDelete}
      />
    </div>
  );
};

export default NotesRenderer;
