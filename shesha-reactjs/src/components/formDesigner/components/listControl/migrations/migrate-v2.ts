import { IListComponentProps } from "../models";
import { SettingsMigrationContext } from "../../../../../interfaces/formDesigner";
import { IButtonGroupButton } from "../../../../../providers/buttonGroupConfigurator/models";
import { upgradeActionConfig } from '../../_common-migrations/upgrade-action-owners';

export const migrateV1toV2 = (props: IListComponentProps, context: SettingsMigrationContext): IListComponentProps => {
    const { buttons } = props;
    const newButtons = buttons.map(item => {
        if (item.itemType !== "item")
            return item;

        const button = item as IButtonGroupButton;
        if (button.itemSubType !== 'button')
            return button;
        return { ...button, actionConfiguration: upgradeActionConfig(button.actionConfiguration, context) };
    });

    return { ...props, buttons: newButtons };
}