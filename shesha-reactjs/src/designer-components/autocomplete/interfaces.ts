import { Key } from 'react';
import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { FormIdentifier } from '@/providers';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { GroupingItem, ISortingItem } from '@/providers/dataTable/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { ComponentDefinition } from '@/interfaces';
import { IDimensionsValue, IFontValue } from '../_settings/utils';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

export interface IAutocompleteComponentProps extends IConfigurableFormComponent {
  entityType?: string | IEntityTypeIdentifier | undefined;
  hideBorder?: boolean | undefined;
  dataSourceUrl?: string | undefined;
  dataSourceType: AutocompleteDataSourceType;
  mode?: 'single' | 'multiple' | undefined;
  keyPropName?: string | undefined;
  filter?: JsonLogicFilter | undefined;
  disableSearch?: boolean | undefined;
  placeholder?: string | undefined;
  width?: string | number | undefined;
  height?: string | number | undefined;
  minWidth?: string | number | undefined;
  maxWidth?: string | number | undefined;
  borderSize?: string | number | undefined;
  borderRadius?: number | undefined;
  // borderType?: string | undefined;
  borderColor?: string | undefined;
  fontSize?: string | number | undefined;
  fontWeight?: string | number | undefined;
  stylingBox?: string | undefined;
  backgroundColor?: string | undefined;
  queryParams?: IQueryParamProp[] | undefined;
  quickviewEnabled?: boolean | undefined;
  quickviewFormPath?: FormIdentifier | undefined;
  quickviewDisplayPropertyName?: string | undefined;
  quickviewGetEntityUrl?: string | undefined;
  quickviewWidth?: number | undefined;
  displayPropName?: string | undefined;
  fields?: string[] | undefined;
  valueFormat?: 'simple' | 'entityReference' | 'custom' | undefined;
  keyValueFunc?: string | undefined;
  displayValueFunc?: string | undefined;
  outcomeValueFunc?: string | undefined;
  filterKeysFunc?: string | undefined;
  sorting?: ISortingItem[] | undefined;
  grouping?: GroupingItem[] | undefined;
  allowFreeText?: boolean | undefined;
  font?: IFontValue | undefined;
  dimensions?: IDimensionsValue | undefined;
}

export type AutocompleteComponentDefinition = ComponentDefinition<"autocomplete", IAutocompleteComponentProps>;
