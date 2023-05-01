import { IConfigurableFormComponent } from 'providers/form/models';

export interface IQueryBuilderComponentProps extends IConfigurableFormComponent {
    jsonExpanded?: boolean;
    modelType?: string;
    fieldsUnavailableHint?: string;
}