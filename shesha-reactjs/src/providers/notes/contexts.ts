import { createNamedContext } from '@/utils/react';
import { NoteDto } from './api-models';
import { CreateNoteArgs, DeleteNoteArgs, NoteModel, NotesReference, UpdateNoteArgs } from './models';

export type OnNoteCreatedFunc = (note: NoteDto) => void;
export type OnNoteUpdatedFunc = (note: NoteDto) => void;
export type OnNoteDeletedFunc = (note: NoteDto) => void;

export type NotesEventHandlers = {
  onCreated?: OnNoteCreatedFunc | undefined;
  onUpdated?: OnNoteUpdatedFunc | undefined;
  onDeleted?: OnNoteDeletedFunc | undefined;
};

export type INotesEditorActions = {
  init: (notesReference: NotesReference) => void;
  setEventHandlers: (handlers: NotesEventHandlers) => void;
  subscribe: (callback: () => void) => () => void;
  createNoteAsync: (args: CreateNoteArgs) => Promise<void>;
  updateNoteAsync: (args: UpdateNoteArgs) => Promise<void>;
  deleteNoteAsync: (args: DeleteNoteArgs) => Promise<void>;
};

export type INotesEditorState = {
  readonly notes: NoteModel[];
  readonly isFetchingNotes: boolean;
  readonly isPostingNotes: boolean;
};

export type INotesEditorInstance = INotesEditorActions & INotesEditorState;

export const NotesEditorInstanceContext = createNamedContext<INotesEditorInstance | undefined>(undefined, "NotesEditorInstanceContext");
