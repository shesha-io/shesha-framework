import { ComponentSettingsMigrator } from "@/components/configurableComponent";
import { IConfigurableMainMenu } from "..";
import { migrateToConfigActions } from "./migrateToConfigActions";
import { migrateFunctionToProp } from "@/designer-components/_common-migrations/migrateSettings";

export const mainMenuMigration: ComponentSettingsMigrator<IConfigurableMainMenu> = (m) => m
  .add(1, (prev) => migrateToConfigActions(prev))
  .add(2, (prev) => {
    const { items } = prev;
    const newItems = items?.map((item) => migrateFunctionToProp(item as any, 'hidden', 'visibility', null, true));
    return { ...prev, items: newItems };
  });
