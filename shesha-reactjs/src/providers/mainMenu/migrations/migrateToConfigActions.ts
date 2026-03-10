import { getNavigationActionArgumentsByUrl } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IShowModalActionArguments } from '@/providers/dynamicModal/configurable-actions/dialog-arguments';
import {
  ISidebarButton,
  ISidebarGroup,
  ISidebarMenuItem,
  ISidebarMenuItemV0,
} from '@/interfaces/sidebar';
import { ISideBarMenuProps } from '../../../components/configurableSidebarMenu/index';
import { StandardNodeTypes } from '@/interfaces/formComponent';

const getActionConfiguration = (item: ISidebarMenuItemV0): IConfigurableActionConfiguration => {
  if (item.buttonAction === 'navigate') {
    const result: IConfigurableActionConfiguration = {
      _type: StandardNodeTypes.ConfigurableActionConfig,
      actionOwner: 'shesha.common',
      actionName: 'Navigate',
      actionArguments: getNavigationActionArgumentsByUrl(item.target),
      handleFail: false,
      handleSuccess: false,
    };
    return result;
  }
  if (item.buttonAction === 'dialogue') {
    const modalArguments: IShowModalActionArguments = {
      modalTitle: item['modalTitle'],
      formId: item["modalFormId"],
      showModalFooter: true,
    };
    return {
      _type: StandardNodeTypes.ConfigurableActionConfig,
      actionOwner: 'shesha.common',
      actionName: 'Show Dialog',
      actionArguments: modalArguments,
      handleFail: false,
      handleSuccess: false,
    };
  }
  return null;
};

const migrateItem = (item: ISidebarMenuItem): ISidebarMenuItem => {
  const oldItem = item as ISidebarMenuItemV0;
  const { id, title, tooltip, itemType, buttonAction, icon, isHidden, visibility, requiredPermissions } = oldItem;
  const commonProps = { id, title, tooltip, itemType, buttonAction, icon, isHidden, visibility, requiredPermissions };
  if (oldItem.itemType === 'group') {
    const group: ISidebarGroup = {
      ...commonProps,
      childItems: oldItem.childItems?.map(migrateItem)?.filter((childItem) => Boolean(childItem)),
    };
    return group;
  }
  if (oldItem.itemType === 'button') {
    const button: ISidebarButton = {
      ...commonProps,
      actionConfiguration: getActionConfiguration(oldItem),
    };
    return button;
  }
  return null;
};

export const migrateToConfigActions = (prev: ISideBarMenuProps): ISideBarMenuProps => {
  const { items } = prev;
  const newItems = items?.map((item) => migrateItem(item)).filter((item) => Boolean(item));
  return { ...prev, items: newItems };
};
