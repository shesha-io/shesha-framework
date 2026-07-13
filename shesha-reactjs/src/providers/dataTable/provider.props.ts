import { IConfigurableActionConfiguration } from '@/providers/configurableActionsDispatcher';
import {
  DataFetchingMode,
  IFilterItem,
  SortMode,
  ColumnSorting,
  GroupingItem,
  ISortingItem,
  FilterExpression,
} from './interfaces';
import { IModelValidation } from '@/utils/errors';

export interface IDataTableProviderBaseProps {
  /**
   * Used for storing the data table state in the global store and publishing and listening to events
   * If not provided, the state will not be saved globally and the user cannot listen to and publish events
   */
  actionOwnerId?: string | undefined;
  actionOwnerName?: string | undefined;

  defaultFilter?: IFilterItem[] | undefined;

  initialPageSize?: number | undefined;

  dataFetchingMode: DataFetchingMode;

  standardSorting?: ISortingItem[] | undefined;

  /** Id of the user config, is used for saving of the user settings (sorting, paging etc) to the local storage. */
  userConfigId?: string | undefined;

  grouping?: GroupingItem[] | undefined;
  sortMode?: SortMode | undefined;
  strictSortBy?: string | undefined;
  strictSortOrder?: ColumnSorting | undefined;
  allowReordering?: boolean | undefined;
  /**
   * Permanent filter exepression. Always applied irrespectively of other filters
   */
  permanentFilter?: FilterExpression | undefined;

  /**
   * Disable refresh data expression
   * Return 'true' if datatableContext is not ready to refresh data (filter data is not ready, etc...)
   */
  disableRefresh?: boolean | undefined;

  /**
   * Custom reorder endpoint
   */
  customReorderEndpoint?: string | undefined;

  needToRegisterContext?: boolean | undefined;
  /**
   * Action to execute before row reorder (allows validation and cancellation)
   */
  onBeforeRowReorder?: IConfigurableActionConfiguration | undefined;

  /**
   * Action to execute after row reorder (receives API response)
   */
  onAfterRowReorder?: IConfigurableActionConfiguration | undefined;

  /**
   * Validation result from parent DataContext component
   */
  contextValidation?: IModelValidation | undefined;
}
