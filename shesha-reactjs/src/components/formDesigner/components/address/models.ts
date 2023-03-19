import { IConfigurableFormComponent } from '../../../../providers/form/models';

export interface IAddressCompomentProps extends IConfigurableFormComponent {
  debounce?: number;
  googleMapsApiKey?: string;
  minCharactersSearch?: string | number;
  openCageApiKey?: string;
  placeholder?: string;
  prefix?: string;
}
