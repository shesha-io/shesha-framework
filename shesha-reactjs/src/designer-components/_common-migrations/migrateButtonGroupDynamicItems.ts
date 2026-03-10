import { IButtonGroupItemBase, isDynamicItem, isGroup } from "@/providers/buttonGroupConfigurator/models";

/** Migrate entityTypeShortAlias to entityType */
export const migrateButtonGroupDynamicItems = (items: IButtonGroupItemBase[]): IButtonGroupItemBase[] => {
  return items?.map((item) => {
    return isGroup(item)
      ? {
        ...item,
        childItems: migrateButtonGroupDynamicItems(item.childItems),
      }
      : isDynamicItem(item)
        ? {
          ...item,
          dynamicItemsConfiguration: item.dynamicItemsConfiguration
            ? {
              ...item.dynamicItemsConfiguration,
              settings: {
                ...item.dynamicItemsConfiguration?.settings,
                entityType: item.dynamicItemsConfiguration?.settings?.entityTypeShortAlias,
                entityTypeShortAlias: undefined,
              },
            }
            : item.dynamicItemsConfiguration,
        }
        : item
    ;
  });
};
