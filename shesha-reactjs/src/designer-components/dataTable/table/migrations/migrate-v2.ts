import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";
import { upgradeActionConfig } from '@/components/formDesigner/components/_common-migrations/upgrade-action-owners';
import { IConfigurableActionColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { isDefined } from "@/utils/nullables";

export const migrateV1toV2 = (props: ITableComponentProps, context: SettingsMigrationContext): ITableComponentProps => {
  const { items } = props;

  const newItems = (isDefined(items) ? items : []).map((item) => {
    if (item.itemType !== "item")
      return item;

    const column = item as IConfigurableActionColumnsProps;
    if (column.columnType !== 'action')
      return item;

    return { ...column, actionConfiguration: isDefined(column.actionConfiguration) ? upgradeActionConfig(column.actionConfiguration, context) : undefined };
  });

  return { ...props, items: newItems };
};
