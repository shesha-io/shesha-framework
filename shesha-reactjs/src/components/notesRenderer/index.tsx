import React, { FC, CSSProperties, useEffect, useRef } from 'react';
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
  onDeleteAction?: (note: INote) => void;
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
  onUpdateAction,
}) => {
  const { notes, deleteNotes, isInProgress, postNotes, updateNotes } = useNotes();
  const { styles } = useStyles();
  const prevNotes = useRef(notes);
  const { fetchNotes: isFetchingNotes, postNotes: isPostingNotes } = isInProgress;

  useEffect(() => {
    if (prevNotes.current && notes?.length > prevNotes.current.length) {
      const newNotes = notes.filter((note) => !prevNotes.current.some((prev) => prev.id === note.id));
      if (onCreated && newNotes.length > 0) {
        onCreated(newNotes);
      }
    }
    prevNotes.current = notes;
  }, [notes]);

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
