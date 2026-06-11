import { FormIdentifier, IEntityReferenceDto } from "@/interfaces";
import { IDataColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { Key, ReactNode } from "react";
import { GroupingItem, ISortingItem, JsonLogicFilter } from "@/providers/dataTable/interfaces";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { StringSubtype } from "@/interfaces/utilityTypes";

/**
 * Converts array of strings into IDataColumnsProps array
 * @param fields - array of strings
 * @returns IDataColumnsProps array
 */
export function getColumns(fields: string[] | undefined): IDataColumnsProps[] {
  return (fields ?? []).map((field, index) => {
    return {
      id: `${index}`,
      columnType: 'data',
      caption: '',
      sortOrder: index,
      isVisible: true,
      itemType: 'item',
      propertyName: field,
      allowSorting: false,
    };
  });
}

export const AUTOCOMPLETE_DATA_SOURCE_TYPE = ["entitiesList", "url"] as const;
export type AutocompleteDataSourceType = StringSubtype<typeof AUTOCOMPLETE_DATA_SOURCE_TYPE>;

export type QueryParamFunc = (searchText: string, selected: unknown[]) => object;
export type FilterSelectedFunc = (value: unknown | unknown[] | undefined) => JsonLogicFilter;
export type KayValueFunc = (value: unknown, args?: object) => unknown;
export type DisplayValueFunc = (value: unknown, args?: object) => string;
export type OutcomeValueFunc = (value: unknown, args?: object) => string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | unknown;

export interface ISelectOption<TValue = unknown> {
  // TODO: make generic
  value: string | number;
  label: string | React.ReactNode;
  data: TValue;
  color?: string;
  icon?: string;
  description?: string;
}

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

export interface IAutocompleteBaseProps<TValue = unknown> {
  disableRefresh?: ((value: boolean) => void) | undefined;

  uid: string;
  onChange?: ((value: TValue | TValue[] | null) => void) | undefined;
  onSearch?: ((searchText: string) => void) | undefined;
  value?: TValue | undefined;

  /** Type of entity */
  entityType?: string | IEntityTypeIdentifier | undefined;
  /** Data source type */
  dataSourceType: AutocompleteDataSourceType;
  /** Data source URL (required for dataSourceType === 'url', alternative for dataSourceType === 'entitiesList') */
  dataSourceUrl?: string | undefined;
  /** Placeholder */
  placeholder?: string | undefined;
  /** Hide border */
  hideBorder?: boolean | undefined;
  /** A property used as label */
  displayPropName?: string | undefined;
  /** A property used as key/value */
  keyPropName?: string | undefined;
  /** Permanent filter (json logig) */
  filter?: JsonLogicFilter | undefined;
  /** Read only */
  readOnly?: boolean | undefined;
  /** Disable text search */
  disableSearch?: boolean | undefined;
  /** Selection mode */
  mode?: 'single' | 'multiple' | undefined;
  /** Fields to fetch */
  fields?: string[] | undefined;
  /** Query params, applicable only for dataSourceType === 'url' */
  queryParams?: IQueryParamProp[] | undefined;

  /** Quickview setting */
  /** Use Quickview */
  quickviewEnabled?: boolean | undefined;
  /** Form path */
  quickviewFormPath?: FormIdentifier | undefined;
  /** A property used as label, шf empty, the displayPropName field is used. */
  quickviewDisplayPropertyName?: string | undefined;
  /** Get Entity details Url */
  quickviewGetEntityUrl?: string | undefined;
  /** Quickview form width */
  quickviewWidth?: string | number | undefined;

  /** Not found content */
  notFoundContent?: ReactNode;
  /** Style */
  style?: React.CSSProperties | undefined;
  /** Filter (json logic) that used for filter selected values */
  filterKeysFunc?: FilterSelectedFunc | undefined;
  /** Function for get key (string) from value (outcome value format) */
  keyValueFunc?: KayValueFunc | undefined;
  /** Function for get label from item (received from the backend)*/
  displayValueFunc?: DisplayValueFunc | undefined;
  /** Function for get value (outcome value format) from item (received from the backend) */
  outcomeValueFunc?: OutcomeValueFunc | undefined;
  /** Sorting */
  sorting?: ISortingItem[] | undefined;
  /** Grouping */
  grouping?: GroupingItem | undefined;
  /** Size */
  size?: SizeType | undefined;

  allowFreeText?: boolean | undefined;
  allowClear?: boolean | undefined;

  // need to review (not used)
  allowInherited?: boolean | undefined;

  /**
   * @deprecated
   */
  typeShortAlias?: string | undefined;
}

export type IAutocompleteProps<TValue = unknown> = Omit<IAutocompleteBaseProps<TValue>, 'uid'>;
