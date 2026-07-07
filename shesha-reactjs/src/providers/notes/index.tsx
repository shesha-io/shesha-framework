import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import {
  INotesEditorActions,
  INotesEditorInstance,
  INotesEditorState,
  NotesEditorInstanceContext,
  OnNoteCreatedFunc,
  OnNoteDeletedFunc,
  OnNoteUpdatedFunc,
} from './contexts';
import { useNotesEditorInstance } from './hooks';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { throwError } from '@/utils/errors';

export type { OnNoteCreatedFunc, OnNoteUpdatedFunc, OnNoteDeletedFunc };

export type NotesProviderProps = {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  category?: string | undefined;

  onCreatedAction?: OnNoteCreatedFunc | undefined;
  onUpdatedAction?: OnNoteUpdatedFunc | undefined;
  onDeletedAction?: OnNoteDeletedFunc | undefined;
};

const NotesEditorProvider: FC<PropsWithChildren<NotesProviderProps>> = ({
  children,
  ownerId,
  ownerType,
  category,
  onCreatedAction,
  onUpdatedAction,
  onDeletedAction,
}) => {
  const instance = useNotesEditorInstance();

  // keep the latest handlers on the instance (closures change on every render)
  instance.setEventHandlers({
    onCreated: onCreatedAction,
    onUpdated: onUpdatedAction,
    onDeleted: onDeletedAction,
  });

  useEffect(() => {
    instance.init({ ownerId, ownerType, category });
  }, [instance, ownerId, ownerType, category]);

  return (
    <NotesEditorInstanceContext.Provider value={instance}>
      {children}
    </NotesEditorInstanceContext.Provider>
  );
};

const useNotesEditor = (): INotesEditorInstance => useContext(NotesEditorInstanceContext) ?? throwError('useNotesEditor must be used within a NotesEditorProvider');

const useNotesEditorActions = (): INotesEditorActions => useNotesEditor();

const useNotesEditorState = (): INotesEditorState => {
  const instance = useNotesEditor();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => instance.subscribe(forceUpdate), [instance]);

  return {
    notes: instance.notes,
    isFetchingNotes: instance.isFetchingNotes,
    isPostingNotes: instance.isPostingNotes,
  };
};

export { NotesEditorProvider, useNotesEditorActions, useNotesEditorState };
