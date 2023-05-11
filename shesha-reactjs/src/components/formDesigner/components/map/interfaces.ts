import { LatLngLiteral } from 'leaflet';
import { IConfigurableFormComponent } from '../../../../providers/form/models';

export interface IMapProps extends IConfigurableFormComponent {
    text?: string;
    description?: string;
    customIcon?: boolean;
    icon?: string;
    color?: IconColor;
    height?: number;
    width?: number;
    defaultZoom?: number;
    useExpression?: string | boolean;
    filters?: string;
    entityType: string;
    ownerId?: string;
    customApiUrl?: string;
    properties?: string[];
    mapType?: 'single' | 'layers';
    defaultViewPortLat?: string | number;
    defaultViewPortLng?: string | number;
    defaultViewPortZoom?: number;
    onConfirm?: () => void;
    onCancel?: () => void;
    latitude?: number | string;
    longitude?: number | string;
    boundary?: string;
    placeholder?: string;
    layers?: any;
    markers?: any;
}


export interface IMapMarker {
    size?: number | string;
    color: string;
    icon: string | IconColor;
    position: IPosition;
}

export interface IPosition {
    lat: number;
    lng: number;
}


export interface ILayerMarker {
    id: string;
    sortOrder: number;
    name: string;
    label: string;
    dataSource: string;
    layertype: string;
    icon: string;
    iconColor: IconColor | string;
    visible: boolean;
    allowChangeVisibility: boolean;
    entityType: string;
    filters: { [key in string]: any };
    chosen: boolean;
    selected: boolean;
    iconSize: number;
    properties?: string[];
    markers?: IMapMarker[] | IMapMarker;
}

export interface IconColor {
    hsl: Hsl;
    hex: string;
    rgb: Rgb;
    hsv: Hsv;
    oldHue: number;
    source: string;
}
export interface Hsl {
    h: number;
    s: number;
    l: number;
    a: number;
}
export interface Rgb {
    r: number;
    g: number;
    b: number;
    a: number;
}
export interface Hsv {
    h: number;
    s: number;
    v: number;
    a: number;
}

export type LayerTypeKeys = 'polygon' | 'points';

export interface ICoordinates {
    polygonData: LatLngLiteral[][];
    layerMarkers: IMapMarker[];
}