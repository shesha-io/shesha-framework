import { createAction } from 'redux-actions';
import { ICreateNotePayload, INote, INoteSettings, INotesStateContext } from './contexts';

export enum NotesActionEnums {
  FetchNotesRequest = 'FETCH_NOTES_REQUEST',
  FetchNotesSuccess = 'FETCH_NOTES_SUCCESS',
  FetchNotesError = 'FETCH_NOTES_ERROR',
  PostNotesRequest = 'POST_NOTES_REQUEST',
  PostNotesSuccess = 'POST_NOTES_SUCCESS',
  PostNotesError = 'POST_NOTES_ERROR',
  DeleteNotesRequest = 'DELETE_NOTES_REQUEST',
  DeleteNotesSuccess = 'DELETE_NOTES_SUCCESS',
  DeleteNotesError = 'DELETE_NOTES_ERROR',
  OnNoteAdded = 'ON_NOTE_ADDED',
  OnNoteRemoved = 'ON_NOTE_REMOVED',
  SetSettings = 'SET_SETTINGS',
  /* NEW_ACTION_TYPE_GOES_HERE */
  UpdateNotesRequest = 'UPDATE_NOTES_REQUEST',
  UpdateNotesSuccess = 'UPDATE_NOTES_SUCCESS',
  UpdateNotesError = 'UPDATE_NOTES_ERROR',
  OnNoteUpdated = 'ON_NOTE_UPDATED',
}

//#region Fetch notes
export const fetchNotesRequestAction = createAction<INotesStateContext>(NotesActionEnums.FetchNotesRequest, () => ({}));

export const fetchNotesSuccessAction = createAction<INotesStateContext, INote[]>(
  NotesActionEnums.FetchNotesSuccess,
  (notes) => ({ notes })
);

export const fetchNotesErrorAction = createAction<INotesStateContext, any>(
  NotesActionEnums.FetchNotesError,
  (errorInfo) => ({ errorInfo })
);
//#endregion

//#region Post notes
export const postNotesRequestAction = createAction<INotesStateContext, ICreateNotePayload>(
  NotesActionEnums.PostNotesRequest,
  (newNotes) => ({ newNotes })
);
export const postNotesSuccessAction = createAction<INotesStateContext, ICreateNotePayload | INote>(
  NotesActionEnums.PostNotesSuccess,
  (newNotes) => ({ newNotes })
);
export const postNotesErrorAction = createAction<INotesStateContext, any>(
  NotesActionEnums.PostNotesError,
  (errorInfo) => ({
    errorInfo,
  })
);
//#endregion

//#region Delete notes
export const deleteNotesRequestAction = createAction<INotesStateContext, string>(
  NotesActionEnums.DeleteNotesRequest,
  (commentIdToBeDeleted) => ({ commentIdToBeDeleted })
);
export const deleteNotesSuccessAction = createAction<INotesStateContext, string>(
  NotesActionEnums.DeleteNotesSuccess,
  (commentIdToBeDeleted) => ({ commentIdToBeDeleted })
);
export const deleteNotesErrorAction = createAction<INotesStateContext, any>(
  NotesActionEnums.DeleteNotesError,
  (errorInfo) => ({ errorInfo })
);
//#endregion

//#region SignalR Events
export const onNoteAddedAction = createAction<INotesStateContext, INote>(NotesActionEnums.OnNoteAdded, (newNotes) => ({
  newNotes,
}));

export const onNoteUpdatedAction = createAction<INotesStateContext, INote>(NotesActionEnums.OnNoteUpdated, (newNotes) => ({
  newNotes,
}));

export const onNoteRemovedAction = createAction<INotesStateContext, string>(
  NotesActionEnums.OnNoteRemoved,
  (commentIdToBeDeleted) => ({ commentIdToBeDeleted })
);
//#endregion

export const setSettingsAction = createAction<INotesStateContext, INoteSettings>(
  NotesActionEnums.SetSettings,
  (settings) => ({ settings })
);
/* NEW_ACTION_GOES_HERE */

//#region update notes
export const updateNotesRequestAction = createAction<INotesStateContext, ICreateNotePayload>(
  NotesActionEnums.UpdateNotesRequest,
  (newNotes) => ({ newNotes })
);
export const updateNotesSuccessAction = createAction<INotesStateContext, ICreateNotePayload | INote>(
  NotesActionEnums.UpdateNotesSuccess,
  (newNotes) => ({ newNotes })
);
export const updateNotesErrorAction = createAction<INotesStateContext, any>(
  NotesActionEnums.UpdateNotesError,
  (errorInfo) => ({
    errorInfo,
  })
);
//#endregion