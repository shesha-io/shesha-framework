import { Key } from 'react';
import { FormIdentifier } from '../../providers';
import { IConfigurableFormComponent } from '../../providers/form/models';
import { AutocompleteDataSourceType } from '../../components/autocomplete';

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
    mode?: 'tags' | 'multiple';
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
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    allowFreeText?: boolean;
}