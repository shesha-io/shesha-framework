import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';

export interface IAddressCompomentBaseProps {
  countryRestriction?: string[] | undefined;
  debounce?: number | undefined;
  googleMapsApiKey?: string | undefined;
  latPriority?: number | undefined;
  lngPriority?: number | undefined;
  minCharactersSearch?: string | number | undefined;
  openCageApiKey?: string | undefined;
  placeholder?: string | undefined;
  prefix?: string | undefined;
  radiusPriority?: number | undefined;
  showPriorityBounds?: boolean | undefined;
};

export interface IAddressCompomentProps extends IConfigurableFormComponent, IInputStyles, IAddressCompomentBaseProps {
  onSelectCustom?: string | undefined;
  onFocusCustom?: string | undefined;
  onBlurCustom?: string | undefined;
  desktop?: IInputStyles | undefined;
  tablet?: IInputStyles | undefined;
  mobile?: IInputStyles | undefined;
}

export type AddressComponentDefinition = ComponentDefinition<"address", IAddressCompomentProps>;
