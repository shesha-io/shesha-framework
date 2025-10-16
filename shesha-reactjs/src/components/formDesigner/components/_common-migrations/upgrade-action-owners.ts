import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { SettingsMigrationContext } from '@/interfaces';

const actionOwnerTypes = ['datatableContext', 'subForm', 'list', 'wizard'];
const getActionOwner = (value: string, context: SettingsMigrationContext): string => {
  if (!value)
    return value;

  // convert standard actions
  if (value === 'Common')
    return 'shesha.common';
  if (value === 'Configuration Framework')
    return 'shesha.configurationFramework';
  if (value === 'Form')
    return 'shesha.form';

  const { allComponents } = context.flatStructure;
  for (const id in allComponents) {
    if (allComponents.hasOwnProperty(id)) {
      const component = allComponents[id];
      const uniqueStateId = component['uniqueStateId'];
      if (uniqueStateId === value) {
        if (actionOwnerTypes.includes(component.type)) {
          return component.id;
        }
      }
    }
  }

  return value;
};

export const upgradeActionConfig = (config: IConfigurableActionConfiguration, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
  if (!config)
    return config;

  const newOwner = getActionOwner(config.actionOwner, context);

  return {
    ...config,
    actionOwner: newOwner,
    onFail: upgradeActionConfig(config.onFail, context),
    onSuccess: upgradeActionConfig(config.onSuccess, context),
  };
};
