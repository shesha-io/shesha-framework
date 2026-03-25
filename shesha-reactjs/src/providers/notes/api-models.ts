import { GuidEntityReferenceDto } from "@/apis/common";
import { IEntityTypeIdentifierQueryParams } from "@/interfaces/metadata";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";

export const NOTES_URLS = {
  GET_LIST: "/api/services/app/Note/GetList",
  NOTE_CREATE: "/api/services/app/Note/Create",
  NOTE_UPDATE: "/api/services/app/Note/Update",
  NOTE_DELETE: "/api/services/app/Note/Delete",
};

export type GetNotesListPayload = {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type short alias of the owner entity
   */
  ownerType: IEntityTypeIdentifierQueryParams;
  /**
   * Category of the note. Is used to split notes into groups
   */
  category?: string | undefined;
  /**
   * Set to true to get notes of all categories
   */
  allCategories?: boolean | undefined;
};

export interface NoteDto {
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
}

export type CreateNoteDto = {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type short alias of the owner entity
   */
  ownerType: string | IEntityTypeIdentifier;
  /**
   * Category of the note. Is used to split notes into groups
   */
  category?: string | undefined;
  /**
   * Note importance (priority)
   */
  priority?: number | undefined;
  /**
   * Id of the parent note
   */
  parentId?: string | undefined;
  /**
   * Text
   */
  noteText: string;
};
