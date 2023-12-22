import React, { FC, CSSProperties } from 'react';
import { useNotes } from '@/providers';
import NotesRendererBase from '@/components/notesRendererBase';

export interface INotesRendererProps {
  showCommentBox?: boolean;
  ownerId?: string;
  ownerType?: string;
  commentListStyles?: CSSProperties;
  buttonPostion?: 'left' | 'right';
  autoSize?: boolean;
}

export const NotesRenderer: FC<INotesRendererProps> = ({ autoSize, buttonPostion, showCommentBox = true }) => {
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
        autoSize={autoSize}
      />
    </div>
  );
};

export default NotesRenderer;
