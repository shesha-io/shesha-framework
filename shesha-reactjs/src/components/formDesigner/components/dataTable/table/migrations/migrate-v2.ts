import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "../../../../../../interfaces/formDesigner";
import { upgradeActionConfig } from '../../../_common-migrations/upgrade-action-owners';
import { IConfigurableActionColumnsProps } from "../../../../../../providers/datatableColumnsConfigurator/models";

export const migrateV1toV2 = (props: ITableComponentProps, context: SettingsMigrationContext): ITableComponentProps => {
    const { items } = props;

    const newItems = items?.map(item => {
        if (item.itemType !== "item")
            return item;

        const column = item as IConfigurableActionColumnsProps;
        if (column.columnType !== 'action')
            return  item;
            
        return { ...column, actionConfiguration: upgradeActionConfig(column.actionConfiguration, context) };
    });

    return { ...props, items: newItems ?? [] };
}
