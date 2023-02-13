import { IButtonGroupProps } from "../models";
import { SettingsMigrationContext } from "../../../../../../interfaces/formDesigner";
import { IButtonGroupButton } from "../../../../../../providers/buttonGroupConfigurator/models";
import { upgradeActionConfig } from '../../../_common-migrations/upgrade-action-owners';

export const migrateV1toV2 = (props: IButtonGroupProps, context: SettingsMigrationContext): IButtonGroupProps => {
    const { items } = props;
    const newItems = items.map(item => {
        if (item.itemType !== "item")
            return item;

        const button = item as IButtonGroupButton;
        if (button.itemSubType !== 'button')
            return button;
        return { ...button, actionConfiguration: upgradeActionConfig(button.actionConfiguration, context) };
    });

    return { ...props, items: newItems };
}