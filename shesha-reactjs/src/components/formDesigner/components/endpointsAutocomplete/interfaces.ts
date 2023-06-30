import { IConfigurableFormComponent } from '../../../../providers/form/models';

export interface IEndpointsAutocompleteComponentProps extends IConfigurableFormComponent {
    httpVerb?: string;
}