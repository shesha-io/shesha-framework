import React, { FC } from 'react';
import { useNotesEditorActions, useNotesEditorState } from '@/providers';
import NotesRendererBase from '@/components/notesRendererBase';
import { useStyles } from './styles/styles';

export interface INotesRendererProps {
  allowCreate?: boolean;
  allowUpdate?: boolean;
  allowDelete?: boolean;

  buttonPostion?: 'left' | 'right';
  autoSize?: boolean;
  showCharCount?: boolean;
  minLength?: number;
  maxLength?: number;
}

export const NotesRenderer: FC<INotesRendererProps> = ({
  allowCreate = true,
  allowUpdate = true,
  allowDelete,

  autoSize,
  buttonPostion,
  showCharCount,
  minLength,
  maxLength,
}) => {
  const { deleteNoteAsync, createNoteAsync, updateNoteAsync } = useNotesEditorActions();
  const { notes } = useNotesEditorState();
  const { styles } = useStyles();

  return (
    <div className={styles.shaNotesRenderer}>
      <NotesRendererBase
        createNoteAsync={createNoteAsync}
        updateNoteAsync={updateNoteAsync}
        deleteNoteAsync={deleteNoteAsync}

        notes={notes}

        allowCreate={allowCreate}
        allowEdit={allowUpdate}
        allowDelete={allowDelete}

        buttonFloatRight={buttonPostion === 'right'}
        autoSize={autoSize}
        showCharCount={showCharCount}
        minLength={minLength}
        maxLength={maxLength}
      />
    </div>
  );
};

export default NotesRenderer;
