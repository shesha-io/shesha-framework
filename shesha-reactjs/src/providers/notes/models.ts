import { GuidEntityReferenceDto } from "@/apis/common";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";

export type CreateNoteArgs = {
  /**
   * Note text
   */
  noteText: string;
  /**
   * Note importance (priority)
   */
  priority?: number | undefined;
  /**
   * Id of the parent note
   */
  parentId?: string | undefined;
};
export type UpdateNoteArgs = {
  id: string;
  noteText: string;
};
export type DeleteNoteArgs = {
  id: string;
};

export type OwnerEntityReference = {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type of the owner entity
   */
  ownerType: string | IEntityTypeIdentifier;
};

/**
 * Represents a reference to a list of notes on backend
 */
export type NotesReference = OwnerEntityReference & {
  /**
   * Category of notes. Is used to split notes into groups
   */
  category?: string | undefined;
};

export type NoteEditingStatus = 'error' | 'done' | 'uploading';

export type NoteModel = {
  id: string;
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type short alias of the owner entity
   */
  ownerType: string;
  /**
   * Creation time
   */
  creationTime: string;
  /**
   * Category of the note. Is used to split notes into groups
   */
  category: string | null;
  /**
   * Note importance (priority)
   */
  priority: number | null;
  /**
   * Id of the parent note
   */
  parentId: string | null;
  /**
   * Text
   */
  noteText: string;
  /**
   * Author
   */
  author: GuidEntityReferenceDto | null;

  status?: NoteEditingStatus;
  error?: unknown | undefined;
};
