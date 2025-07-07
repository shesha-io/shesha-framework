import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import { CreateNoteDto, NoteDto, useNoteCreate, useNoteGetList, useNoteUpdate } from '@/apis/note';
import { useMutate } from '@/hooks';
import { IShaHttpResponse } from '@/interfaces/shaHttpResponse';
import { useSignalR } from '@/providers/signalR';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  deleteNotesErrorAction,
  deleteNotesRequestAction,
  deleteNotesSuccessAction,
  fetchNotesErrorAction,
  fetchNotesRequestAction,
  fetchNotesSuccessAction,
  onNoteAddedAction,
  onNoteRemovedAction,
  onNoteUpdatedAction,
  postNotesErrorAction,
  postNotesRequestAction,
  postNotesSuccessAction,
  setSettingsAction,
  updateNotesErrorAction,
  updateNotesRequestAction,
  updateNotesSuccessAction,
} from './actions';
import {
  COMMENTS_CONTEXT_INITIAL_STATE,
  ICreateNotePayload,
  INote,
  INoteSettings,
  NotesActionsContext,
  NotesStateContext,
} from './contexts';
import { notesReducer } from './reducer';

const NotesProvider: FC<PropsWithChildren<INoteSettings>> = ({
  children,
  ownerId,
  ownerType,
  allCategories = false,
  category,
}) => {
  const [state, dispatch] = useReducer(notesReducer, COMMENTS_CONTEXT_INITIAL_STATE);

  const { connection } = useSignalR(false) ?? {};
  const shouldShowAllCategories = !category || allCategories;

  //#region Register signal r events
  useEffect(() => {
    connection?.on('OnNoteAdded', (eventData: INote | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as INote);

      dispatch(onNoteAddedAction(patient));
    });

    connection?.on('OnFiNoteleted', (eventData: INote | string) => {
      const patient = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as INote);

      dispatch(onNoteRemovedAction(patient?.id));
    });
    connection?.on('OnNoteUpdated', (eventData: INote | string) => {
      const note = typeof eventData === 'object' ? eventData : (JSON.parse(eventData) as INote);
      dispatch(onNoteUpdatedAction(note));
    });
  }, []);
  //#endregion

  useEffect(() => {
    dispatch(setSettingsAction({ ownerId, ownerType, category, allCategories: shouldShowAllCategories }));
  }, [ownerId, ownerType, category, allCategories]);

  //#region Fetch notes
  const {
    refetch: refetchNotesHttp,
    loading: fetchingNotes,
    data,
    error: fetchNotesResError,
  } = useNoteGetList({
    queryParams: { ownerId, ownerType, category, allCategories: shouldShowAllCategories },
    lazy: true,
  });

  const fetchNotesRequest = () => {
    dispatch(fetchNotesRequestAction());
    refetchNotesHttp();
  };

  const fetchNotesSuccess = (notes: INote[]) => {
    dispatch(fetchNotesSuccessAction(notes));
  };

  const fetchNotesError = () => {
    dispatch(fetchNotesErrorAction(fetchNotesResError?.data));
  };

  // Refetch notes when the main parameters change
  useEffect(() => {
    if (ownerId && ownerType) {
      fetchNotesRequest();
    }
  }, [ownerId, ownerType, category, allCategories]);

  useEffect(() => {
    if (!fetchingNotes && data) {
      // The Api is misleading us in here by saying it returns `NoteDto[]` when it actually returns IShaHttpResponse<NoteDto[]>
      const { result, success } = data as unknown as IShaHttpResponse<NoteDto[]>;

      if (success && result && Array.isArray(result)) {
        fetchNotesSuccess(result);
      } else {
        fetchNotesError();
      }
    }
  }, [fetchingNotes]);

  const refreshNotes = () => refetchNotesHttp();
  //#endregion

  //#region Save notes

  const postNotesSuccess = (newNotes: INote) => {
    dispatch(postNotesSuccessAction(newNotes));
  };

  const { mutate: saveNotesHttp, error: saveNotesResError } = useNoteCreate();

  const postNotesError = () => {
    dispatch(postNotesErrorAction(saveNotesResError?.data));
  };

  const postNotesRequest = (newNotes: ICreateNotePayload) => {
    if (newNotes) {
      dispatch(postNotesRequestAction(newNotes));

      const payload = newNotes;

      if (!newNotes.ownerId) {
        payload.ownerId = ownerId;
      }

      if (!newNotes.ownerType) {
        payload.ownerType = ownerType;
      }

      if (!newNotes.category) {
        payload.category = category;
      }

      saveNotesHttp(payload as CreateNoteDto)
        .then((response: any) => {
          // The Api is misleading us in here by saying it returns `NoteDto` when it actually returns IShaHttpResponse<NoteDto[]>
          const { result, success } = response as IShaHttpResponse<NoteDto>;
          if (success && result) {
            postNotesSuccess(result);
          } else {
            postNotesError();
          }
        })
        .catch(() => postNotesError());
    }
  };

  //#endregion

  //#region Delete notes
  const { mutate: deleteNotesHttp, error: deleteNotesResError } = useMutate();

  const deleteNotesRequest = (commentIdToBeDeleted: string) => {
    dispatch(deleteNotesRequestAction(commentIdToBeDeleted));

    deleteNotesHttp({ url: `/api/services/app/Note/Delete?id=${commentIdToBeDeleted}`, httpVerb: 'DELETE' })
      .then(() => {
        dispatch(deleteNotesSuccessAction(commentIdToBeDeleted));
      })
      .catch(() => dispatch(deleteNotesErrorAction(deleteNotesResError?.data)));
  };
  //#endregion

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  //#region updates notes
  const updateNotesSuccess = (newNotes: ICreateNotePayload) => {
    dispatch(updateNotesSuccessAction(newNotes));
  };

  const { mutate: updateNotesHttp, error: updateNotesResError } = useNoteUpdate();

  const updateNotesError = () => {
    dispatch(updateNotesErrorAction(updateNotesResError?.data));
  };

  const updateNotesRequest = (newNotes: ICreateNotePayload) => {
    if (newNotes) {
      dispatch(updateNotesRequestAction(newNotes));

      const payload = newNotes;

      if (!newNotes.ownerId) {
        payload.ownerId = ownerId;
      }

      if (!newNotes.ownerType) {
        payload.ownerType = ownerType;
      }

      if (!newNotes.category) {
        payload.category = category;
      }

      updateNotesHttp(payload as CreateNoteDto)
        .then((response: any) => {
          // The Api is misleading us in here by saying it returns `NoteDto` when it actually returns IShaHttpResponse<NoteDto[]>
          const { result, success } = response as IShaHttpResponse<NoteDto>;
          if (success && result) {
            updateNotesSuccess(result);
          } else {
            updateNotesError();
          }
        })
        .catch(() => updateNotesError());
    }
  };


  //#endregion
  return (
    <NotesStateContext.Provider value={state}>
      <NotesActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          fetchNotesRequest,
          postNotes: postNotesRequest,
          deleteNotes: deleteNotesRequest,
          refreshNotes,
          /* NEW_ACTION_GOES_HERE */
          updateNotes:updateNotesRequest
        }}
      >
        {children}
      </NotesActionsContext.Provider>
    </NotesStateContext.Provider>
  );
};

function useNotesState() {
  const context = useContext(NotesStateContext);

  if (context === undefined) {
    throw new Error('useNotesState must be used within a NotesProvider');
  }

  return context;
}

function useNotesActions() {
  const context = useContext(NotesActionsContext);

  if (context === undefined) {
    throw new Error('useNotesActions must be used within a NotesProvider');
  }

  return context;
}

function useNotes() {
  return { ...useNotesState(), ...useNotesActions() };
}

export default NotesProvider;

export { NotesProvider, useNotes, useNotesActions, useNotesState };
