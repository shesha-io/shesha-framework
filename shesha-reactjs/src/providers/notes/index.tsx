import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import { notesReducer } from './reducer';
import {
  NotesActionsContext,
  NotesStateContext,
  COMMENTS_CONTEXT_INITIAL_STATE,
  INote,
  ICreateNotePayload,
  INoteSettings,
} from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  fetchNotesRequestAction,
  fetchNotesSuccessAction,
  fetchNotesErrorAction,
  postNotesRequestAction,
  postNotesSuccessAction,
  postNotesErrorAction,
  deleteNotesRequestAction,
  deleteNotesSuccessAction,
  deleteNotesErrorAction,
  onNoteAddedAction,
  onNoteRemovedAction,
  setSettingsAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
} from './actions';
import { useNoteGetList, useNoteCreate, CreateNoteDto, NoteDto } from '../../apis/note';
import { useMutate } from 'restful-react';
import { useSignalR } from '../signalR';
import { IShaHttpResponse } from '../../interfaces/shaHttpResponse';
import { useSheshaApplication } from '../..';

const NotesProvider: FC<PropsWithChildren<INoteSettings>> = ({
  children,
  ownerId,
  ownerType,
  category,
  allCategories = true,
}) => {
  const [state, dispatch] = useReducer(notesReducer, COMMENTS_CONTEXT_INITIAL_STATE);

  const { connection } = useSignalR(false) ?? {};
  const { httpHeaders: headers } = useSheshaApplication();

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
  }, []);
  //#endregion

  useEffect(() => {
    dispatch(setSettingsAction({ ownerId, ownerType, category, allCategories }));
  }, [ownerId, ownerType, category, allCategories]);

  //#region Fetch notes
  const { refetch: refetchNotesHttp, loading: fetchingNotes, data, error: fetchNotesResError } = useNoteGetList({
    queryParams: { ownerId, ownerType, category, allCategories },
    lazy: true,
    requestOptions: {
      headers,
    },
  });

  // Refetch notes when the main parameters change
  useEffect(() => {
    if (ownerId && ownerType) {
      fetchNotesRequest();
    }
  }, [ownerId, ownerType, category, allCategories]);

  useEffect(() => {
    if (!fetchingNotes && data) {
      // The Api is misleading us in here by saying it returns `NoteDto[]` when it actually returns IShaHttpResponse<NoteDto[]>
      const { result, success } = (data as unknown) as IShaHttpResponse<NoteDto[]>;

      if (success && result && Array.isArray(result)) {
        fetchNotesSuccess(result);
      } else {
        fetchNotesError();
      }
    }
  }, [fetchingNotes]);

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

  const refreshNotes = () => refetchNotesHttp();
  //#endregion

  //#region Save notes
  const { mutate: saveNotesHttp, error: saveNotesResError } = useNoteCreate({
    requestOptions: {
      headers,
    },
  });
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

  const postNotesSuccess = (newNotes: INote) => {
    dispatch(postNotesSuccessAction(newNotes));
  };

  const postNotesError = () => {
    dispatch(postNotesErrorAction(saveNotesResError?.data));
  };
  //#endregion

  //#region Delete notes
  const { mutate: deleteNotesHttp, error: deleteNotesResError } = useMutate({
    queryParams: { Id: state.commentIdToBeDeleted }, // Important if you'll be calling this as a side-effect
    path: '/api/services/app/Note',
    verb: 'DELETE',
    requestOptions: {
      headers,
    },
  });

  const deleteNotesRequest = (commentIdToBeDeleted: string) => {
    dispatch(deleteNotesRequestAction(commentIdToBeDeleted));

    deleteNotesHttp('Delete', { queryParams: { Id: commentIdToBeDeleted } })
      .then(() => {
        dispatch(deleteNotesSuccessAction(commentIdToBeDeleted));
      })
      .catch(() => dispatch(deleteNotesErrorAction(deleteNotesResError?.data)));
  };
  //#endregion

  /* NEW_ACTION_DECLARATION_GOES_HERE */

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

export { NotesProvider, useNotesState, useNotesActions, useNotes };
