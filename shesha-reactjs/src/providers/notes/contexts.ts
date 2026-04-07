import { createNamedContext } from '@/utils/react';
import { CreateNoteArgs, DeleteNoteArgs, NoteModel, NotesReference, UpdateNoteArgs } from './models';

export type INotesEditorActions = {
  init: (notesReference: NotesReference) => void;
  createNoteAsync: (args: CreateNoteArgs) => Promise<void>;
  updateNoteAsync: (args: UpdateNoteArgs) => Promise<void>;
  deleteNoteAsync: (args: DeleteNoteArgs) => Promise<void>;
};

export type INotesEditorState = {
  readonly notes: NoteModel[];
};

export type INotesEditorInstance = INotesEditorActions & INotesEditorState;

export const NotesEditorInstanceContext = createNamedContext<INotesEditorInstance | undefined>(undefined, "NotesEditorInstanceContext");
