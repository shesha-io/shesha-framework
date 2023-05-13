import { IColor, ICoords } from 'index';
import { LatLngExpression } from 'leaflet';
import { IConfigurableFormComponent } from '../../../../providers/form/models';

export interface IMapProps extends IConfigurableFormComponent {
  description?: string;
  customIcon?: boolean;
  icon?: string;
  color?: IColor;
  height?: string;
  width?: string;
  mapType?: 'single' | 'layers';
  defaultLat?: string;
  defaultLng?: string;
  defaultZoom?: string;
  latitude?: string;
  longitude?: string;
  layers?: ILayersEntity[];
}

export interface ILayersEntity {
  id: string;
  sortOrder: number;
  name: string;
  label: string;
  layertype: LayerTypeKeys;
  description: string;
  icon?: string;
  iconColor?: IColor;
  iconSize?: number;
  visible?: boolean;
  allowChangeVisibility?: boolean;
  dataSource: 'entity' | 'custom';
  entityType?: string;
  latitude?: string;
  longitude?: string;
  customUrl?: string;
  ownerId?: string;
  filters: { [key in string]: any };
  boundary?: string;
  markers?: IMapMarker[] | LatLngExpression[];
}

export interface IMapMarker {
  size?: string;
  color: string | IColor;
  icon: string;
  position: ICoords;
}

export type LayerTypeKeys = 'polygon' | 'points';

export interface ICoordinates {
  polygonPoints: LatLngExpression[];
  markerPoints: IMapMarker[];
}
