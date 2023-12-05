import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IAddressCompomentProps extends IConfigurableFormComponent {
  countryRestriction?: string[];
  debounce?: number;
  googleMapsApiKey?: string;
  latPriority?: number;
  lngPriority?: number;
  minCharactersSearch?: string | number;
  openCageApiKey?: string;
  placeholder?: string;
  prefix?: string;
  radiusPriority?: number;
  showPriorityBounds?: boolean;
}
