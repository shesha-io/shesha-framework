import React, { FC } from 'react';
import { useNotesEditorActions, useNotesEditorState } from '@/providers';
import NotesRendererBase from '@/components/notesRendererBase';
import { useStyles } from './styles/styles';
import { useFormDesignerOrUndefined } from '@/providers/formDesigner';
import { isDefined } from '@/utils/nullables';

const DESIGNER_HINT = 'Notes cannot be posted from the form designer.';
const UNSAVED_OWNER_HINT = 'Notes can be added only after the record has been saved.';

export interface INotesRendererProps {
  allowCreate?: boolean | undefined;
  allowUpdate?: boolean | undefined;
  allowDelete?: boolean | undefined;

  buttonPostion?: 'left' | 'right' | undefined;
  autoSize?: boolean | undefined;
  showCharCount?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;
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
  const { notes, isFetchingNotes, isPostingNotes, canPostNotes } = useNotesEditorState();
  const { styles } = useStyles();

  // the preview button only switches formMode, so the designer instance is still available while previewing.
  // Keying on it - rather than on formMode - keeps the editor usable in both, instead of showing the
  // runtime 'record not saved' state for an owner that can never be saved from here
  const isDesignTime = isDefined(useFormDesignerOrUndefined());

  return (
    <div className={styles.shaNotesRenderer}>
      <NotesRendererBase
        createNoteAsync={createNoteAsync}
        updateNoteAsync={updateNoteAsync}
        deleteNoteAsync={deleteNoteAsync}

        notes={notes}
        isFetchingNotes={isFetchingNotes}
        isPostingNotes={isPostingNotes}

        disabled={!canPostNotes}
        // the text area stays usable in the designer so the component can be laid out and tested, only posting is blocked
        inputDisabled={!canPostNotes && !isDesignTime}
        disabledHint={isDesignTime ? DESIGNER_HINT : UNSAVED_OWNER_HINT}

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
