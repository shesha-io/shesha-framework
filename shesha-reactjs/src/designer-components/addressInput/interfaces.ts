import { IConfigurableFormComponent } from '@/providers/form/models';

export interface IAddressInputComponentProps extends IConfigurableFormComponent {
  placeholder?: string;
  googleMapsApiKey?: string;
  enableMapInterface?: boolean;
  latitudePropertyName?: string;
  longitudePropertyName?: string;
  defaultZoom?: number;
  mapHeight?: number;
}
