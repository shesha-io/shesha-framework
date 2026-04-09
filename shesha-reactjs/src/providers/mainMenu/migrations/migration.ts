import { ComponentSettingsMigrator } from "@/components/configurableComponent";
import { IConfigurableMainMenu } from "..";
import { migrateToConfigActions } from "./migrateToConfigActions";
import { migrateFunctionToProp } from "@/designer-components/_common-migrations/migrateSettings";
import { ISideBarMenuProps } from "@/components/configurableSidebarMenu";

export const mainMenuMigration: ComponentSettingsMigrator<IConfigurableMainMenu> = (m) => m
  .add(1, (prev) => migrateToConfigActions(prev as ISideBarMenuProps))
  .add(2, (prev) => {
    const { items } = prev;
    const newItems = items.map((item) => migrateFunctionToProp(item, 'hidden', 'visibility', undefined, true));
    return { ...prev, items: newItems };
  });
