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
import { isDefined } from '@/utils/nullables';
import { FormIdentifier } from '@/providers/form/models';
import { isFormFullName } from '@/providers/form/utils';

const getActionConfiguration = (item: ISidebarMenuItemV0): IConfigurableActionConfiguration | undefined => {
  if (item.buttonAction === 'navigate') {
    const result: IConfigurableActionConfiguration = {
      _type: StandardNodeTypes.ConfigurableActionConfig,
      actionOwner: 'shesha.common',
      actionName: 'Navigate',
      actionArguments: getNavigationActionArgumentsByUrl(item.target ?? ""),
      handleFail: false,
      handleSuccess: false,
    };
    return result;
  }
  if (item.buttonAction === 'dialogue') {
    const formId = "modalFormId" in item ? item.modalFormId as FormIdentifier : undefined;

    const modalArguments: IShowModalActionArguments = {
      modalTitle: "modalTitle" in item && typeof (item.modalTitle) === "string" ? item.modalTitle : "",
      formId: isFormFullName(formId) ? formId : { module: '', name: '' },
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
  return undefined;
};

const migrateItem = (item: ISidebarMenuItem): ISidebarMenuItem | undefined => {
  const oldItem = item as ISidebarMenuItemV0;
  const { id, title, tooltip, itemType, buttonAction, icon, isHidden, visibility, requiredPermissions } = oldItem;
  const commonProps = { id, title, tooltip, itemType, buttonAction, icon, isHidden, visibility, requiredPermissions };
  if (oldItem.itemType === 'group') {
    const group: ISidebarGroup = {
      ...commonProps,
      childItems: oldItem.childItems?.map(migrateItem).filter((childItem): childItem is ISidebarMenuItem => Boolean(childItem)),
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
  return undefined;
};

export const migrateToConfigActions = (prev: ISideBarMenuProps): ISideBarMenuProps => {
  const { items } = prev;
  const newItems: ISidebarMenuItem[] = [];
  if (isDefined(items)) {
    items.forEach((item) => {
      const newItem = migrateItem(item);
      if (newItem)
        newItems.push(newItem);
    });
  }

  return { ...prev, items: newItems };
};
