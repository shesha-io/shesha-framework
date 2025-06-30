import React, { FC, CSSProperties, useEffect } from 'react';
import { useNotes } from '@/providers';
import NotesRendererBase from '@/components/notesRendererBase';
import { useStyles } from './styles/styles';
import { INote } from '@/providers/notes/contexts';

export interface INotesRendererProps {
  showCommentBox?: boolean;
  ownerId?: string;
  ownerType?: string;
  commentListStyles?: CSSProperties;
  buttonPostion?: 'left' | 'right';
  autoSize?: boolean;
  allowDelete?: boolean;
  onCreated?: (payload: Array<any>) => void;
  showCharCount?: boolean;
  minLength?: number;
  maxLength?: number;
  onDeleteAction?: (noteId: string) => void;
  onCreateAction?: (note: any) => void;
  allowEdit?: boolean;
  onUpdateAction?: (note: INote) => void;
}

export const NotesRenderer: FC<INotesRendererProps> = ({
  autoSize,
  buttonPostion,
  showCommentBox = true,
  allowDelete,
  onCreated,
  showCharCount,
  minLength,
  maxLength,
  onDeleteAction,
  onCreateAction,
  allowEdit = true,
  onUpdateAction
}) => {
  const { notes, deleteNotes, isInProgress, postNotes, updateNotes } = useNotes();
  const { styles } = useStyles();

  const { fetchNotes: isFetchingNotes, postNotes: isPostingNotes } = isInProgress;

  useEffect(() => {
    if (onCreated) {
      onCreated(notes);
    }
  }, [isInProgress, notes]);

  return (
    <div className={styles.shaNotesRenderer}>
      <NotesRendererBase
        deleteNotes={deleteNotes}
        postNotes={postNotes}
        updateNotes={updateNotes}
        notes={notes}
        showCommentBox={showCommentBox}
        isFetchingNotes={isFetchingNotes}
        isPostingNotes={isPostingNotes}
        buttonFloatRight={buttonPostion === 'right'}
        autoSize={autoSize}
        allowDelete={allowDelete}
        allowEdit={allowEdit}
        showCharCount={showCharCount}
        minLength={minLength}
        maxLength={maxLength}
        onDeleteAction={onDeleteAction}
        onCreateAction={onCreateAction}
        onUpdateAction={onUpdateAction}
      />
    </div>
  );
};

export default NotesRenderer;