import { IToolbarProps } from "../models";
import { SettingsMigrationContext } from "../../../../../../interfaces/formDesigner";
import { upgradeActionConfig } from '../../../_common-migrations/upgrade-action-owners';
import { IToolbarButton } from "../../../../../../providers/toolbarConfigurator/models";

export const migrateV1toV2 = (props: IToolbarProps, context: SettingsMigrationContext): IToolbarProps => {
    const { items } = props;
    const newItems = items.map(item => {
        if (item.itemType !== "item")
            return item;

        const button = item as IToolbarButton;
        if (button.itemSubType !== 'button')
            return item;
            
        return { ...button, actionConfiguration: upgradeActionConfig(button.actionConfiguration, context) };
    });

    return { ...props, items: newItems };
}