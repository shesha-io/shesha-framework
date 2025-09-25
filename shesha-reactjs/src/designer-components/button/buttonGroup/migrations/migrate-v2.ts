import { IButtonGroupComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";
import { IButtonGroupItem, IButtonItem } from "@/providers/buttonGroupConfigurator/models";
import { upgradeActionConfig } from '@/components/formDesigner/components/_common-migrations/upgrade-action-owners';

export const migrateV1toV2 = (props: IButtonGroupComponentProps, context: SettingsMigrationContext): IButtonGroupComponentProps => {
  const { items } = props;
  const newItems = items.map((item) => {
    if (item.itemType !== "item")
      return item;

    const button = item as IButtonGroupItem;
    if (button.itemSubType !== 'button')
      return button;
    return { ...button, actionConfiguration: upgradeActionConfig((button as IButtonItem).actionConfiguration, context) };
  });

  return { ...props, items: newItems };
};
