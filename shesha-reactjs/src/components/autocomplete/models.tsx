import { FormIdentifier, IEntityReferenceDto } from "@/interfaces";
import { IDataColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { Key, ReactNode } from "react";
import { GroupingItem, ISortingItem, ITableRowData, JsonLogicFilter } from "@/providers/dataTable/interfaces";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { StringSubtype } from "@/interfaces/utilityTypes";
import { BaseOptionType } from "antd/lib/select";

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
export type FilterSelectedFunc = (value: unknown | unknown[] | undefined) => JsonLogicFilter | undefined;
export type KayValueFunc = (value: unknown, args?: object) => string | undefined;
export type DisplayValueFunc = (value: unknown, args?: object) => string;
export type OutcomeValueFunc = (value: unknown, args?: object) => string | string[] | IEntityReferenceDto | IEntityReferenceDto[] | unknown;

/*
export interface DefaultOptionType extends BaseOptionType {
    label?: React.ReactNode;
    value?: string | number | null;
    children?: Omit<DefaultOptionType, 'children'>[];
}
*/

export interface ISelectOption extends BaseOptionType {
  value: string | number | null;
  label: string | React.ReactNode;
  data: ITableRowData | null;
  color?: string;
  icon?: string;
  description?: string;
}

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

export type EntityAutocompleteProps = {
  /** Type of entity */
  entityType?: string | IEntityTypeIdentifier | undefined;
  /** Sorting */
  sorting?: ISortingItem[] | undefined;
  /** Grouping */
  grouping?: GroupingItem | undefined;
};

export type UrlAutocompleteProps = {
  /** Data source URL (required for dataSourceType === 'url', alternative for dataSourceType === 'entitiesList') */
  dataSourceUrl?: string | undefined;
  /** Query params, applicable only for dataSourceType === 'url' */
  queryParams?: IQueryParamProp[] | undefined;
};

type AutocompleteQuickViewProps = {
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
};

type AutocompleteDisplayProps = {
  /** Placeholder */
  placeholder?: string | undefined;
  /** Hide border */
  hideBorder?: boolean | undefined;
  /** Read only */
  readOnly?: boolean | undefined;
  /** Not found content */
  notFoundContent?: ReactNode;
  /** Style */
  style?: React.CSSProperties | undefined;
  /** Size */
  size?: SizeType | undefined;
};

type AutocompleteDataProps = {
  /** A property used as label */
  displayPropName?: string | undefined;
  /** A property used as key/value */
  keyPropName?: string | undefined;
  /** Fields to fetch */
  fields?: string[] | undefined;
  /** Permanent filter (json logig) */
  filter?: JsonLogicFilter | undefined;

  /** Filter (json logic) that used for filter selected values */
  filterKeysFunc?: FilterSelectedFunc | undefined;
  /** Function for get key (string) from value (outcome value format) */
  keyValueFunc?: KayValueFunc | undefined;
  /** Function for get label from item (received from the backend)*/
  displayValueFunc?: DisplayValueFunc | undefined;
  /** Function for get value (outcome value format) from item (received from the backend) */
  outcomeValueFunc?: OutcomeValueFunc | undefined;
};

export type IAutocompleteBaseProps<TValue = unknown> =
  EntityAutocompleteProps &
  UrlAutocompleteProps &
  AutocompleteQuickViewProps &
  AutocompleteDisplayProps &
  AutocompleteDataProps & {

    onChange?: ((value: TValue | TValue[] | null) => void) | undefined;
    value?: TValue | undefined;

    /** Data source type */
    dataSourceType: AutocompleteDataSourceType;

    /** Selection mode */
    mode?: 'single' | 'multiple' | undefined;

    allowFreeText?: boolean | undefined;
    allowClear?: boolean | undefined;
  };

export type IAutocompleteProps<TValue = unknown> = Omit<IAutocompleteBaseProps<TValue>, 'uid'>;
