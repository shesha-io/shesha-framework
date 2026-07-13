import { IConfigurableFormComponent } from '@/providers/form/models';

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

export interface IAddressCompomentProps extends IConfigurableFormComponent, IAddressCompomentBaseProps {
  onSelectCustom?: string | undefined;
  onFocusCustom?: string | undefined;
  onBlurCustom?: string | undefined;
}
