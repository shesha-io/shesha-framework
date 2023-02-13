import React, { ReactNode, Key } from 'react';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { LabeledValue } from 'antd/lib/select';
import { IReadOnly } from '../../interfaces/readOnly';

export type AutocompleteDataSourceType = 'entitiesList' | 'url';

export interface ISelectOption<TValue = any> {
  // todo: make generic
  value: string | number;
  label: string | React.ReactNode;
  data: TValue;
}

interface IQueryParams {
  // tslint:disable-next-line:typedef-whitespace
  [prop: string]: Key;
}

export type CustomLabeledValue<TValue = any> = LabeledValue & { data: TValue };

export interface ICommonAutocompleteProps<TValue = any> extends IReadOnly {
  /**
   * The value of the autocomplete
   *
   * If the value is of this form, then we do not need to fetch items from the server
   */
  value?: TValue | TValue[];

  /**
   * Default value
   */
  defaultValue?: TValue | TValue[];

  /**
   * Get option from an item fetched from the back-end
   */
  getOptionFromFetchedItem?: (fetchedItem: object) => ISelectOption<TValue>;

  /**
   * Get CustomLabeledValue from value
   */
  getLabeledValue?: (value: TValue, options: ISelectOption<TValue>[]) => CustomLabeledValue<TValue>;

  /**
   * Specify content to show when no result matches
   */
  notFoundContent?: ReactNode;

  /**
   * The placeholder to display on the autocomplete
   */
   placeholder?: string;

  /**
   * A callback for when the value of this component changes
   */
  onChange?: any;

  /**
   * Whether this control is disabled
   */
  disabled?: boolean;

  /**
   * Wether the component is bordered
   */
  bordered?: boolean;

  /**
   * Styles to apply to the select component that gets rendered by this control
   */
  style?: React.CSSProperties;

  /**
   * The size of the control
   */
  size?: SizeType;

  /**
   * The size of the control
   */
  mode?: 'multiple' | 'tags';

  allowClear?: boolean;

  /**
   * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
   */
  readOnly?: boolean;

  /**
   * If true, search mode will be disabled for the autocomplete
   */
  disableSearch?: boolean;

  /**
   *
   */
  readOnlyMultipleMode?: 'raw' | 'tags';

  /**
   * A list of event names which, when triggered, will trigger the autocomplete to refetch items
   */
  subscribedEventNames?: string[];
}

export interface IAutocompleteProps<TValue = any>
  extends IEntityAutocompleteProps<TValue>,
    IUrlAutocompleteProps<TValue> {
  /**
   * Data source of this Autocomplete
   */
  dataSourceType: AutocompleteDataSourceType;
}

export interface IEntityAutocompleteProps<TValue = any> extends ICommonAutocompleteProps<TValue> {
  /**
   * The short alias if this is a reference list
   */
  typeShortAlias?: string;
  
  /**
   * Name of the property to display. Live empty to use default display name property defined on the back-end
   */
  entityDisplayProperty?: string;

  /**
   * Applies if this is a reference list
   */
  allowInherited?: boolean;

  /**
   * Deteremines if quickview is enabled when in read only mode
   */
  quickviewEnabled?: boolean;

  /**
   * Specifies the form to use when quickview is enabled
   */
  quickviewFormPath?: string;

  /**
   * Specifies which property to display for the quickview
   */
  quickviewDisplayPropertyName?: string;

  /**
   * The Url that details of the entity are retreived
   */
  quickviewGetEntityUrl?: string;

  /**
   * The width of the quickview
   */
  quickviewWidth?: number;

  filter?: string;
}

export interface IUrlAutocompleteProps<TValue = any> extends ICommonAutocompleteProps<TValue> {
  /**
   * Data source url. Applies if `dataSourceType` is `url`
   */
  dataSourceUrl?: string;

  /**
   * Query string params
   */
  queryParams?: IQueryParams;

  /**
   * If true, autocomplete allows to use free text that is missing in the source
   */
  allowFreeText?: boolean;
}

export interface IUrlFetcherQueryParams {
  term?: string | null;
  selectedValue?: string | null;
}
