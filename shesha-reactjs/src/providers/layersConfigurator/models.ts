import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IMapMarker } from 'components/formDesigner/components/map/interfaces';

export type LayerGroupItemProps = ILayerFormModel | ILayerGroup;

export interface ILayerGroupItemBase {
  id: string;
  name: string;
  block?: boolean;
  label?: string;
  tooltip?: string;
  sortOrder: number;
  danger?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  isDynamic?: boolean;
  icon?: string;
  LayerType?: 'point' | 'polygon';
  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  style?: string;
  size?: SizeType;
}

export interface ILayerFormModel extends ILayerGroupItemBase {
  label?: string;
  orderIndex?: number;
  description?: string;
  visible?: boolean;
  allowChangeVisibility?: boolean;
  useExpression?: boolean;
  entityType?: string;
  permissions?: any;
  properties?: string[];
  ownerId?: string;
  queryParamsExpression?: string;
  readOnly?: boolean;
  icon?: string;
  iconColor?: {
    hex: string;
  };
  customUrl?: string;
  dataSource?: 'entity' | 'custom';
  layertype?: 'points' | 'polygon';
  boundary?: string;
  longitude?: string;
  latitude?: string;
  markers?: IMapMarker;
}

export interface ILayerGroup extends ILayerGroupItemBase {
  childItems?: LayerGroupItemProps[];
}
