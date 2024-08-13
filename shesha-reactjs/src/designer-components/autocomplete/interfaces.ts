import { Key } from 'react';
import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { FormIdentifier } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

export interface IAutocompleteComponentProps extends IConfigurableFormComponent {
  entityTypeShortAlias?: string;
  entityDisplayProperty?: string;
  hideBorder?: boolean;
  dataSourceUrl?: string;
  dataSourceType: AutocompleteDataSourceType;
  mode?: 'single' | 'multiple';
  useRawValues: boolean;
  queryParams?: IQueryParamProp[];
  keyPropName?: string;
  valuePropName?: string;
  filter?: object;
  disableSearch?: boolean;
  placeholder?: string;
  quickviewEnabled?: boolean;
  quickviewFormPath?: FormIdentifier;
  quickviewDisplayPropertyName?: string;
  quickviewGetEntityUrl?: string;
  quickviewWidth?: number;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  allowFreeText?: boolean;
  borderSize?: string | number;
  borderRadius?: number;
  borderType?: string;
  borderColor?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  stylingBox?: string;
  height?: string | number;
  backgroundColor?: string;
  variant?: 'borderless' | 'outlined' | 'filled';
}
