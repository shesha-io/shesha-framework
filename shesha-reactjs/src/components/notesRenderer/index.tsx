import React, { FC, CSSProperties } from 'react';
import { useNotes } from '../../providers';
import NotesRendererBase from '../notesRendererBase';

export interface INotesRendererProps {
  showCommentBox?: boolean;
  ownerId?: string;
  ownerType?: string;
  commentListStyles?: CSSProperties;
  buttonPostion?: 'left' | 'right';
}

export const NotesRenderer: FC<INotesRendererProps> = ({ buttonPostion, showCommentBox = true }) => {
  const { notes, deleteNotes, isInProgress, postNotes } = useNotes();

  const { fetchNotes: isFetchingNotes, postNotes: isPostingNotes } = isInProgress;

  return (
    <div className="sha-notes-renderer">
      <NotesRendererBase
        deleteNotes={deleteNotes}
        postNotes={postNotes}
        notes={notes}
        showCommentBox={showCommentBox}
        isFetchingNotes={isFetchingNotes}
        isPostingNotes={isPostingNotes}
        buttonFloatRight={buttonPostion === 'right'}
      />
    </div>
  );
};

export default NotesRenderer;
