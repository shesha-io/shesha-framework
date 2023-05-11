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
}

export interface ILayerFormModel extends ILayerGroupItemBase {
    label?: string;
    orderIndex?: number;
    description?: string;
    visibility?: boolean;
    allowChangeVisibility?: boolean;
    useExpression?: boolean;
    entityType?: string;
    permissions?: any;
    properties?: string[];
    ownerId?: string;
    queryParamsExpression?: string;
    readOnly?: boolean;
    icon?: string;
    color?: {
        hex: string;
    };
    customApiUrl?: string;
    apiSource?: 'entity' | 'custom';
}

export interface ILayerGroup extends ILayerGroupItemBase {
    childItems?: LayerGroupItemProps[];
}
