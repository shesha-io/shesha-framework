import { CSSProperties, FC } from 'react';
import classNames from 'classnames';
import { useNotesEditorActions, useNotesEditorState } from '@/providers';
import NotesRendererBase from '@/components/notesRendererBase';
import { useStyles } from './styles/styles';
import { useFormDesignerOrUndefined } from '@/providers/formDesigner';
import { isDefined } from '@/utils/nullables';
import { EventsObject } from '@/designer-components/_common/events';

const DESIGNER_HINT = 'Notes cannot be posted from the form designer.';
const UNSAVED_OWNER_HINT = 'Notes can be added only after the record has been saved.';
const DISABLED_HINT = 'Notes are read-only here.';

/**
 * DOM event handlers forwarded to the component root. Typed as the exact set `getComponentEvents`
 * produces so the configured events cannot drift from what this component can actually bind.
 */
export interface INotesRendererProps extends EventsObject {
  allowCreate?: boolean | undefined;
  allowUpdate?: boolean | undefined;
  allowDelete?: boolean | undefined;
  /**
   * Makes the whole editor inert: the text area is greyed out and notes can't be created, edited or
   * deleted. Distinct from `allowCreate={false}`, which hides the editor rather than disabling it.
   */
  disabled?: boolean | undefined;

  buttonPostion?: 'left' | 'right' | undefined;
  autoSize?: boolean | undefined;
  showCharCount?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;

  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export const NotesRenderer: FC<INotesRendererProps> = ({
  allowCreate = true,
  allowUpdate = true,
  allowDelete,
  disabled = false,

  autoSize,
  buttonPostion,
  showCharCount,
  minLength,
  maxLength,

  className,
  style,
  ...events
}) => {
  const { deleteNoteAsync, createNoteAsync, updateNoteAsync } = useNotesEditorActions();
  const { notes, isFetchingNotes, isPostingNotes, canPostNotes } = useNotesEditorState();
  const { styles } = useStyles();

  // the preview button only switches formMode, so the designer instance is still available while previewing.
  // Keying on it - rather than on formMode - keeps the editor usable in both, instead of showing the
  // runtime 'record not saved' state for an owner that can never be saved from here
  const isDesignTime = isDefined(useFormDesignerOrUndefined());

  // an explicitly disabled component stays disabled in the designer too, so the mode can be laid out
  // and inspected - unlike the 'record not saved' case, which the designer deliberately relaxes
  const isDisabled = disabled || !canPostNotes;
  const disabledHint = disabled
    ? DISABLED_HINT
    : isDesignTime ? DESIGNER_HINT : UNSAVED_OWNER_HINT;

  return (
    <div className={classNames(styles.shaNotesRenderer, className)} style={style} {...events}>
      <NotesRendererBase
        createNoteAsync={createNoteAsync}
        updateNoteAsync={updateNoteAsync}
        deleteNoteAsync={deleteNoteAsync}

        notes={notes}
        isFetchingNotes={isFetchingNotes}
        isPostingNotes={isPostingNotes}

        disabled={isDisabled}
        // the text area stays usable in the designer so the component can be laid out and tested, only posting is blocked
        inputDisabled={disabled || (!canPostNotes && !isDesignTime)}
        disabledHint={disabledHint}

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
