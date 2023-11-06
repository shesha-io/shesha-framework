import { useGet, UseGetProps } from '../hooks/useGet';
import { useMutateForEndpoint } from '../hooks/useMutate';
import { IAjaxResponse, IAjaxResponseBase } from '../interfaces/ajaxResponse';

/**
 * Check list item model
 */
export interface CheckListItemModel {
  id?: string;
  /**
   * Item type (group = 1, two state = 2, tri state = 3), see Shesha.Domain.Enums.RefListCheckListItemType
   */
  itemType?: number;
  /**
   * Item name
   */
  name?: string | null;
  /**
   * Item description
   */
  description?: string | null;
  /**
   * If true, the user is able to add comments to this item/group
   */
  allowAddComments?: boolean;
  /**
   * Heading of the comments box
   */
  commentsHeading?: string | null;
  /**
   * Custom visibility of comments (javascript expression)
   */
  commentsVisibilityExpression?: string | null;
  /**
   * Child items
   */
  childItems?: CheckListItemModel[] | null;
}

/**
 * Check list item selection made by the user
 */
export interface CheckListItemSelectionDto {
  /**
   * Check list item id
   */
  checkListItemId?: string;
  /**
   * User selection (yes = 1, no = 2, na = 3), see Shesha.Domain.Enums.RefListCheckListSelectionType
   */
  selection?: number | null;
  /**
   * User comments
   */
  comments?: string | null;
  name?: string | null;
}

/**
 * Checklist model
 */
export interface CheckListModel {
  id?: string;
  /**
   * Name of the check list
   */
  name?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Items of the check list
   */
  items?: CheckListItemModel[] | null;
}

/**
 * Save check list selection input
 */
export interface SaveSelectionInput {
  /**
   * Owner entity Id
   */
  id: string;
  /**
   * Owner entity type short alias
   */
  ownerType: string;
  /**
   * Check list id
   */
  ownerId: string;
  /**
   * User selection
   */
  selection: CheckListItemSelectionDto[];
}

export type CheckListItemSelectionDtoListAjaxResponse = IAjaxResponse<CheckListItemSelectionDto[] | null>;

export interface CheckListGetSelectionPathParams {
  /**
   * Check list Id
   */
  id: string;
}

export interface CheckListGetSelectionQueryParams {
  /**
   * Owner entity type short alias
   */
  ownerType: string;
  /**
   * Owner entity Id
   */
  ownerId: string;
}

export type UseCheckListGetSelectionProps = Omit<
  UseGetProps<
    CheckListItemSelectionDtoListAjaxResponse,
    //IAjaxResponseBase,
    CheckListGetSelectionQueryParams,
    CheckListGetSelectionPathParams
  >,
  'path'
> &
  CheckListGetSelectionPathParams;
/**
 * Get user selection
 */
export const useCheckListGetSelection = ({ id, ...props }: UseCheckListGetSelectionProps) =>
  useGet<
    CheckListItemSelectionDtoListAjaxResponse,
    IAjaxResponseBase,
    CheckListGetSelectionQueryParams,
    CheckListGetSelectionPathParams
  >((paramsInPath: CheckListGetSelectionPathParams) => `/checkList/${paramsInPath.id}/selection`, {
    pathParams: { id },
    ...props,
  });

export interface CheckListGetCheckListTreePathParams {
  id: string;
}
export type CheckListModelAjaxResponse = IAjaxResponse<CheckListModel>;
export type UseCheckListGetCheckListTreeProps = Omit<
  UseGetProps<CheckListModelAjaxResponse, void, CheckListGetCheckListTreePathParams>,
  'path'
> &
  CheckListGetCheckListTreePathParams;

/**
 * Get check list tree
 */
export const useCheckListGetCheckListTree = ({ id, ...props }: UseCheckListGetCheckListTreeProps) =>
  useGet<CheckListModelAjaxResponse, IAjaxResponseBase, void, CheckListGetCheckListTreePathParams>(
    (paramsInPath: CheckListGetCheckListTreePathParams) => `/checkList/${paramsInPath.id}/tree`,
    { pathParams: { id }, ...props }
  );

export const useCheckListSaveSelection = () =>
  useMutateForEndpoint<SaveSelectionInput>({ url: (data) => `/checkList/${data.id}/selection`, httpVerb: 'POST' });
