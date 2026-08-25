import { Key } from 'react';
import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { FormIdentifier } from '@/providers';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { GroupingItem, ISortingItem } from '@/providers/dataTable/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { ComponentDefinition } from '@/interfaces';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';

interface IQueryParamProp {
  id: string;
  param?: string;
  value?: Key;
}

export interface IAutocompleteComponentProps extends IConfigurableFormComponent, IInputStyles {
  entityType?: string | IEntityTypeIdentifier | undefined;
  dataSourceUrl?: string | undefined;
  dataSourceType: AutocompleteDataSourceType;
  mode?: 'single' | 'multiple' | undefined;
  keyPropName?: string | undefined;
  filter?: JsonLogicFilter | undefined;
  disableSearch?: boolean | undefined;
  placeholder?: string | undefined;
  minWidth?: string | number | undefined;
  maxWidth?: string | number | undefined;
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
}

export type AutocompleteComponentDefinition = ComponentDefinition<"autocomplete", IAutocompleteComponentProps>;
