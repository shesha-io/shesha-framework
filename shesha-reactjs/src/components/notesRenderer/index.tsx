import { FC } from 'react';
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
   * Makes the whole editor inert: the text area is greyed out and the Save, edit and delete actions
   * are suppressed. The notes stay listed, so the user can read but not change them.
   */
  disabled?: boolean | undefined;
  /**
   * Renders the notes as a pure viewer: the editor is not shown at all and no note can be edited or
   * deleted. Unlike `disabled`, nothing is greyed out - there is simply nothing to interact with.
   *
   * Takes precedence over `allowCreate`/`allowUpdate`/`allowDelete`: a mode that forbids changes
   * must win over a permission that allows them, or the actions stay reachable in a state that is
   * not supposed to permit them.
   */
  readOnly?: boolean | undefined;

  buttonPosition?: 'left' | 'right' | undefined;
  autoSize?: boolean | undefined;
  showCharCount?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;

  className?: string | undefined;
}

export const NotesRenderer: FC<INotesRendererProps> = ({
  allowCreate = true,
  allowUpdate = true,
  allowDelete,
  disabled = false,
  readOnly = false,

  autoSize,
  buttonPosition,
  showCharCount,
  minLength,
  maxLength,

  className,
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

  // a non-editable mode overrides the allow* permissions rather than combining with them, so
  // enabling Allow Edit / Allow Delete cannot bring the actions back in read-only or disabled state
  const isEditable = !readOnly && !isDisabled;

  return (
    <div className={classNames(styles.shaNotesRenderer, className)} {...events}>
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

        allowCreate={allowCreate && !readOnly}
        allowEdit={allowUpdate && isEditable}
        allowDelete={(allowDelete ?? false) && isEditable}

        buttonFloatRight={buttonPosition === 'right'}
        autoSize={autoSize}
        showCharCount={showCharCount}
        minLength={minLength}
        maxLength={maxLength}
      />
    </div>
  );
};

export default NotesRenderer;
