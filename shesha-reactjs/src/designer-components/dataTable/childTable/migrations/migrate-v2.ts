import { IChildTableComponentProps } from '..';
import { upgradeActionConfig } from '../../../../components/formDesigner/components/_common-migrations/upgrade-action-owners';
import { SettingsMigrationContext } from '../../../../interfaces/formDesigner';
import { IButtonGroupButton } from '../../../../providers/buttonGroupConfigurator/models';

export const migrateV1toV2 = (
  props: IChildTableComponentProps,
  context: SettingsMigrationContext
): IChildTableComponentProps => {
  const { toolbarItems } = props;

  const newToolbarItems = toolbarItems?.map((item) => {
    if (item.itemType !== 'item') return item;

    const button = item as IButtonGroupButton;
    if (button.itemSubType !== 'button') return button;

    return { ...button, actionConfiguration: upgradeActionConfig(button.actionConfiguration, context) };
  });

  return { ...props, toolbarItems: newToolbarItems ?? [] };
};
