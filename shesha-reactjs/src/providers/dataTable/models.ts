import { IModelMetadata } from "@/interfaces";
import { IDataTableActionsContext } from "./interfaces.actions";
import { IDataTableStateContext } from "./interfaces.state";
import { ColumnSorting, DataFetchingMode, DatasetEvents, FilterExpression, GroupingItem, ISortingItem, SortMode } from "./interfaces";
import { SubscribeFunc } from "@/utils/subscriptions/subscriptionManager";
import { IDataTableProviderBaseProps } from "./provider.props";

export type DatatableInitArgs = {
  // TODO V1: move outside the provider, it's used for generation of default columns only
  metadata: IModelMetadata | undefined;
  userConfigId: string | undefined;
  sortMode: SortMode;

  dataFetchingMode: DataFetchingMode;
  initialPageSize?: number | undefined;

  standardSorting?: ISortingItem[] | undefined;
  strictSortBy?: string | undefined;
  strictSortOrder?: ColumnSorting | undefined;

  grouping?: GroupingItem[] | undefined;

  allowReordering?: boolean | undefined;
  /**
   * Custom reorder endpoint
   */
  customReorderEndpoint?: string | undefined;

  permanentFilter?: FilterExpression | undefined;

  /*
needToRegisterContext
onBeforeRowReorder
onAfterRowReorder
contextValidation

disableRefresh

actionOwnerId
actionOwnerName
  */
};

type MissingProperties<A, B> = Pick<A, Exclude<keyof A, keyof B>>;
export type MissingProps = keyof MissingProperties<IDataTableProviderBaseProps, DatatableInitArgs>;


export type IDatasetInstance = IDataTableActionsContext & {
  init: (args: DatatableInitArgs) => Promise<void>;
  state: IDataTableStateContext;
  subscribe: SubscribeFunc<DatasetEvents, IDatasetInstance>;
};
