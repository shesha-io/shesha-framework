import { FormIdentifier, IConfigurableActionConfiguration } from '@/providers';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

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
  visible?: boolean;
  allowChangeVisibility?: boolean;
  useQuickView?: boolean;
  quickViewForm?: FormIdentifier;
  dataSource?: 'entity' | 'custom';
  entityType?: string;
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
  queryParamsExpression?: string;
  readOnly?: boolean;
  icon?: string;
  iconColor?: {
    hex: string;
  };
  customUrl?: string;
}

export interface ILayerGroup extends ILayerGroupItemBase {
  childItems?: LayerGroupItemProps[];
}

export interface ICalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  icon?: string;
  showIcon?: boolean;
  color?: string;
  iconColor?: string;
  onDblClick?: IConfigurableActionConfiguration;
  onSelect?: IConfigurableActionConfiguration;
  [key: string]: any; // For additional layer-specific properties
}

export interface ICalendarLayersProps {
  id: string;
  sortOrder: number;
  name: string;
  label: string;
  description: string;
  visible?: boolean;
  allowChangeVisibility?: boolean;
  dataSource: 'entity' | 'custom';
  entityType?: string;
  startTime?: string;
  endTime?: string;
  title?: string;
  color?: string;
  showIcon?: boolean;
  propertyList?: string[];
  overfetch?: boolean;
  customUrl?: string;
  ownerId?: string;
  filters: { [key in string]: any };
  useQuickView?: boolean;
  quickViewForm?: FormIdentifier;
  events?: ICalendarEvent[];
  onSelect?: IConfigurableActionConfiguration;
  onDblClick?: IConfigurableActionConfiguration;
  onSlotClick?: IConfigurableActionConfiguration;
  onViewChange?: IConfigurableActionConfiguration;
  showLegend?: boolean;
  icon?: string;
  iconColor?: string;
}
