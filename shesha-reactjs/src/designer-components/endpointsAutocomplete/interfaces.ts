import { EndpointSelectionMode, IHttpVerb } from '@/components/endpointsAutocomplete/endpointsAutocomplete';
import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IEndpointsAutocompleteComponentProps extends IConfigurableFormComponent {
  httpVerb?: string;
  availableHttpVerbs?: IHttpVerb[];
  mode?: EndpointSelectionMode;
}
