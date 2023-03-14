import { IConfigurableFormComponent } from '../../../../providers';
import { IShaMap } from '../../../mapComponent';

export interface IMapProps extends IConfigurableFormComponent, IShaMap {
  name: string;
  label: string;
  readOnly?: boolean;
  latitude: number;
  longitude: number;
  zoom: number;
}
