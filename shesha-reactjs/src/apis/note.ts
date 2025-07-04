import { useGet, UseGetProps } from '@/hooks/useGet';
import { useMutateForEndpoint } from '@/hooks/useMutate';
import { IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { GuidEntityReferenceDto } from './common';

export interface NoteDto {
  id?: string;
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
  creationTime?: string | null;
  /**
   * Category of the note. Is used to split notes into groups
   */
  category?: string;
  /**
   * Note importance (priority)
   */
  priority?: number | null;
  /**
   * Id of the parent note
   */
  parentId?: string | null;
  /**
   * Text
   */
  noteText: string;
  author?: GuidEntityReferenceDto;
}

export interface CreateNoteDto {
  id?: string;
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type short alias of the owner entity
   */
  ownerType: string;
  /**
   * Category of the note. Is used to split notes into groups
   */
  category?: string;
  /**
   * Note importance (priority)
   */
  priority?: number | null;
  /**
   * Id of the parent note
   */
  parentId?: string | null;
  /**
   * Text
   */
  noteText: string;
}

export interface NoteGetListQueryParams {
  /**
   * Id of the owner entity
   */
  ownerId: string;
  /**
   * Type short alias of the owner entity
   */
  ownerType: string;
  /**
   * Category of the note. Is used to split notes into groups
   */
  category?: string;
  /**
   * Set to true to get notes of all categories
   */
  allCategories?: boolean;
  /**
   * The requested API version
   */
  'api-version'?: string;
}
export type NoteDtoListAjaxResponse = IAjaxResponse<NoteDto[] | null>;

export type UseNoteGetListProps = Omit<UseGetProps<NoteDtoListAjaxResponse, NoteGetListQueryParams, void>, 'path'>;

export const useNoteGetList = (props: UseNoteGetListProps) =>
  useGet<NoteDtoListAjaxResponse, IAjaxResponseBase, NoteGetListQueryParams, void>(
    `/api/services/app/Note/GetList`,
    props
  );

export const useNoteCreate = () => useMutateForEndpoint({ url: `/api/services/app/Note/Create`, httpVerb: 'POST' });
export const useNoteUpdate = () => useMutateForEndpoint({ url: `/api/services/app/Note/Update`, httpVerb: 'PUT' });
