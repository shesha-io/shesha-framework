import { FormIdentifier, IEntityReferenceDto } from "@/index";
import { IDataColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { Key, MutableRefObject, ReactNode } from "react";
import { GroupingItem, ISortingItem } from "@/providers/dataTable/interfaces";
import { SizeType } from "antd/lib/config-provider/SizeContext";

/**
 * Converts array of strings into IDataColumnsProps array
 * @param fields - array of strings
 * @returns IDataColumnsProps array
 */
export function getColumns(fields: string[]): IDataColumnsProps[] {
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

export type AutocompleteDataSourceType = 'entitiesList' | 'url';

export type QueryParamFunc = (searchText: string, selected: any[]) => object;
export type FilterSelectedFunc = (value: any) => object;
export type KayValueFunc = (value: any, args: any) => string;
export type DisplayValueFunc = (value: any, args: any) => string;
export type OutcomeValueFunc = (value: any, args: any) => string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | any;

export interface ISelectOption<TValue = any> {
  // TODO: make generic
  value: string | number;
  label: string | React.ReactNode;
  data: TValue;
  color?: string;
  icon?: string;
}

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

export interface IAutocompleteBaseProps {
  disableRefresh?: MutableRefObject<boolean>;

  uid: string;
  onChange?: (value: any) => void;
  onSearch?: (searchText: string) => void;
  value?: any;

  /** Type of entity */
  entityType?: string;
  /** Data source type */
  dataSourceType: AutocompleteDataSourceType;
  /** Data source URL (required for dataSourceType === 'url', alternative for dataSourceType === 'entitiesList') */
  dataSourceUrl?: string;
  /** Placeholder */
  placeholder?: string;
  /** Hide border */
  hideBorder?: boolean;
  /** A property used as label */
  displayPropName?: string;
  /** A property used as key/value */
  keyPropName?: string;
  /** Permanent filter (json logig) */
  filter?: object;
  /** Read only */
  readOnly?: boolean;
  /** Disable text search */
  disableSearch?: boolean;
  /** Selection mode */
  mode?: 'single' | 'multiple';
  /** Fields to fetch */
  fields?: string[];
  /** Query params, applicable only for dataSourceType === 'url' */
  queryParams?: IQueryParamProp[];

  /** Quickview setting */
  /** Use Quickview */
  quickviewEnabled?: boolean;
  /** Form path */
  quickviewFormPath?: FormIdentifier;
  /** A property used as label, шf empty, the displayPropName field is used. */
  quickviewDisplayPropertyName?: string;
  /** Get Entity details Url */
  quickviewGetEntityUrl?: string;
  /** Quickview form width */
  quickviewWidth?: number;

  /** Not found content */
  notFoundContent?: ReactNode;
  /** Style */
  style?: React.CSSProperties;
  /** Filter (json logic) that used for filter selected values */
  filterKeysFunc?: FilterSelectedFunc | null | undefined;
  /** Function for get key (string) from value (outcome value format) */
  keyValueFunc?: KayValueFunc | null | undefined;
  /** Function for get label from item (received from the backend)*/
  displayValueFunc?: DisplayValueFunc | null | undefined;
  /** Function for get value (outcome value format) from item (received from the backend) */
  outcomeValueFunc?: OutcomeValueFunc | null | undefined;
  /** Sorting */
  sorting?: ISortingItem[];
  /** Grouping */
  grouping?: GroupingItem;
  /** Size */
  size?: SizeType;

  allowFreeText?: boolean;
  allowClear?: boolean;

  // not implemented
  defaultValue?: any | any[];

  // need to review (not used)
  allowInherited?: boolean;

  /**
   * @deprecated
   */
  typeShortAlias?: string;
}

export interface IAutocompleteProps extends Omit<IAutocompleteBaseProps, 'uid'> {

}