import { ButtonType } from 'antd/lib/button';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { migrateFunctionToProp } from '@/designer-components/_common-migrations/migrateSettings';
import { IConfigurableActionConfiguration } from '@/providers/configurableActionsDispatcher/index';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ButtonGroupItemType, IToolbarButton, IToolbarProps, ToolbarItemSubType } from './models';

export interface ToolbarButtonGroupProps extends IConfigurableFormComponent {
  items: IButtonGroupButton[];
  size?: SizeType;
  permissions?: string[];
  spaceSize?: SizeType;
  isInline?: boolean;
  noStyles?: boolean;
}

interface IButtonGroupButton {
  id: string;
  name: string;
  label?: string | React.ReactNode;
  tooltip?: string;
  sortOrder: number;
  danger?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  isDynamic?: boolean;
  itemType: ButtonGroupItemType;
  icon?: string;
  buttonType?: ButtonType;
  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  style?: string;
  size?: SizeType;
  itemSubType: ToolbarItemSubType;
  actionConfiguration?: IConfigurableActionConfiguration;
  isInline?: boolean;
}

export const migrateToButtonGroup = (model: IToolbarProps): ToolbarButtonGroupProps => {
  const result: ToolbarButtonGroupProps = {
    id: model.id,
    parentId: model.parentId,
    componentName: model.componentName,
    propertyName: model.propertyName,
    type: 'buttonGroup',
    isInline: true,
    items: model.items.filter((item) => item && item.itemType === 'item')
      .map<IButtonGroupButton>((item) => {
        const button = item as IToolbarButton;
        let newItem: IButtonGroupButton = {
          id: item.id,
          name: item.label, // note: exchange label and name
          label: item.name,
          tooltip: item.tooltip,
          sortOrder: item.sortOrder,
          danger: item.danger,
          isDynamic: false,
          itemType: item.itemType,
          icon: item.icon,
          buttonType: item.buttonType,
          permissions: item.permissions,
          actionConfiguration: button.actionConfiguration,
          itemSubType: button.itemSubType,
          customVisibility: item.customVisibility,
          customEnabled: item.customEnabled,
        };
        const removeContext = (s: string): string | undefined => s?.replace('context.', '')?.replace('context?.', '');
        const result = migrateFunctionToProp(
          migrateFunctionToProp(newItem as any, 'hidden', 'customVisibility', removeContext, true),
          'disabled',
          'customEnabled',
          removeContext,
          true);
        return result;
      }),
    version: 5, // version available at the moment of the migration
  };
  return result;
};
