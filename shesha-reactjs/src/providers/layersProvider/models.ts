import { FormIdentifier, IConfigurableActionConfiguration } from '@/providers';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { isDefined } from '@/utils/nullables';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface ICalendarEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  icon?: string | undefined;
  showIcon?: boolean | undefined;
  color?: string | undefined;
  iconColor?: string | undefined;
  onDblClick?: IConfigurableActionConfiguration | undefined;
  onSelect?: IConfigurableActionConfiguration | undefined;
  titleTemplate?: string | undefined;
  [key: string]: unknown; // For additional layer-specific properties
}

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
  entityType?: string | IEntityTypeIdentifier;
}

export interface ILayerFormModel extends ILayerGroupItemBase {
  orderIndex?: number;
  description?: string;
  useExpression?: boolean;
  properties?: string[];
  queryParamsExpression?: string;
  readOnly?: boolean;
  iconColor?: string;
  customUrl?: string;
}

export interface ILayerGroup extends ILayerGroupItemBase {
  childItems?: LayerGroupItemProps[];
}

export const isLayerGroup = (item: ILayerGroupItemBase | undefined): item is ILayerGroup => isDefined(item) && "childItems" in item && isDefined(item.childItems) && Array.isArray(item.childItems);

export interface ICalendarLayersProps {
  id: string;
  sortOrder: number;
  name: string;
  label: string;
  description: string;
  visible?: boolean | undefined;
  allowChangeVisibility?: boolean | undefined;
  dataSource: 'entity' | 'custom';
  entityType?: string | IEntityTypeIdentifier | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
  title?: string | undefined;
  color?: string | undefined;
  showIcon?: boolean | undefined;
  propertyList?: string[] | undefined;
  overfetch?: boolean | undefined;
  customUrl?: string | undefined;
  ownerId?: string | undefined;
  filters: { [key in string]: unknown };
  useQuickView?: boolean | undefined;
  quickViewForm?: FormIdentifier | undefined;
  events?: ICalendarEvent[] | undefined;
  onSelect?: IConfigurableActionConfiguration | undefined;
  onDblClick?: IConfigurableActionConfiguration | undefined;
  onSlotClick?: IConfigurableActionConfiguration | undefined;
  onViewChange?: IConfigurableActionConfiguration | undefined;
  showLegend?: boolean | undefined;
  icon?: string | undefined;
  iconColor?: string | undefined;
}
