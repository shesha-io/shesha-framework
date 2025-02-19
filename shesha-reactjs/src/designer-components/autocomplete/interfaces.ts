import { Key } from 'react';
import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { FormIdentifier, IInputStyles } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { GroupingItem, ISortingItem } from '@/providers/dataTable/interfaces';

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

export interface IAutocompleteComponentProps extends IConfigurableFormComponent, IInputStyles {
  entityTypeShortAlias?: string;
  entityDisplayProperty?: string;
  hideBorder?: boolean;
  dataSourceUrl?: string;
  dataSourceType: AutocompleteDataSourceType;
  mode?: 'single' | 'multiple';
  keyPropName?: string;
  filter?: object;
  disableSearch?: boolean;
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  stylingBox?: string;
  backgroundColor?: string;
}