import { ownerTypeToString } from "@/utils/entity";
import { NoteDto } from "./api-models";
import { NoteModel, NotesReference } from "./models";

export const noteDto2NoteModel = (note: NoteDto): NoteModel => ({
  id: note.id,
  noteText: note.noteText,
  priority: note.priority,
  parentId: note.parentId,
  creationTime: note.creationTime,
  category: note.category,
  author: note.author,
  ownerType: note.ownerType,
  ownerId: note.ownerId,

  status: 'done',
  error: null,
});

const notesReferenceToString = (ref: NotesReference): string => `${ref.ownerId.toLowerCase()}_${ownerTypeToString(ref.ownerType)}_${ref.category}`;

export const notesReferenceEqual = (ref1: NotesReference, ref2: NotesReference): boolean => {
  return notesReferenceToString(ref1) === notesReferenceToString(ref2);
};
