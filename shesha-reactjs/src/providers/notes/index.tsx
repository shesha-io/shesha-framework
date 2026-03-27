import React, { FC, PropsWithChildren, useContext, useEffect } from 'react';
import {
  INotesEditorActions,
  INotesEditorInstance,
  INotesEditorState,
  NotesEditorInstanceContext,
} from './contexts';
import { useNotesEditorInstance } from './hooks';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { throwError } from '@/utils/errors';
import { NoteDto } from './api-models';

export type OnNoteCreatedFunc = (note: NoteDto) => void;
export type OnNoteUpdatedFunc = (note: NoteDto) => void;
export type OnNoteDeletedFunc = (note: NoteDto) => void;

export type NotesProviderProps = {
  ownerId: string;
  ownerType: string | IEntityTypeIdentifier;
  category?: string;

  onCreatedAction?: OnNoteCreatedFunc | undefined;
  onUpdatedAction?: OnNoteUpdatedFunc | undefined;
  onDeletedAction?: OnNoteDeletedFunc | undefined;
};

const NotesEditorProvider: FC<PropsWithChildren<NotesProviderProps>> = ({
  children,
  ownerId,
  ownerType,
  category,
}) => {
  const instance = useNotesEditorInstance();
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
  // useNotesEditorSubscription('fileList');
  return {
    notes: instance.notes,
  };
};

export { NotesEditorProvider, useNotesEditorActions, useNotesEditorState };
