import { INotesStateContext, INote } from './contexts';
import { NotesActionEnums } from './actions';
import flagsReducer from '../utils/flagsReducer';

export function notesReducer(
  incomingState: INotesStateContext,
  action: ReduxActions.Action<INotesStateContext>
): INotesStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action) as INotesStateContext;

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case NotesActionEnums.FetchNotesRequest:
    case NotesActionEnums.FetchNotesSuccess:
    case NotesActionEnums.FetchNotesError:
    case NotesActionEnums.PostNotesRequest:
    case NotesActionEnums.PostNotesError:
    case NotesActionEnums.DeleteNotesRequest:
    case NotesActionEnums.DeleteNotesError:

    case NotesActionEnums.SetSettings:
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };
    case NotesActionEnums.OnNoteAdded:
    case NotesActionEnums.PostNotesSuccess: {
      const { notes, settings } = state;
      const { newNotes } = payload;

      const notesToAdd = newNotes as INote;

      const foundNote = notes?.find(note => note?.id === notesToAdd?.id);

      if (settings?.ownerId !== notesToAdd?.ownerId || foundNote) {
        return {
          ...state,
        };
      }

      return {
        ...state,
        notes: Array.isArray(notes) ? [notesToAdd, ...notes] : [notesToAdd],
      };
    }
    case NotesActionEnums.OnNoteRemoved:
    case NotesActionEnums.DeleteNotesSuccess: {
      const { notes } = state;
      const { commentIdToBeDeleted } = payload;
      return {
        ...state,
        notes: notes.filter(({ id }) => id !== commentIdToBeDeleted),
        commentIdToBeDeleted: null,
      };
    }

    default:
      return state;
  }
}
