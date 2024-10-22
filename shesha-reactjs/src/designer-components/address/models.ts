import { IConfigurableFormComponent } from '@/providers/form/models';
import { IInputStyles } from '../textField/interfaces';
import { IStyleType } from '../_settings/components/styleGroup/models';

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
  onSelectCustom?: string;
  styles?: IStyleType;
  desktop?: IInputStyles | IStyleType;
  mobile?: IInputStyles | IStyleType;
  tablet?: IInputStyles | IStyleType;
}
