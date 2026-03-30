import { IButtonGroupItemBase, isDynamicItem, isGroup } from "@/providers/buttonGroupConfigurator/models";
import { getStringPropertyOrUndefined } from "@/utils/object";

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
                entityType: getStringPropertyOrUndefined(item.dynamicItemsConfiguration?.settings, "entityTypeShortAlias"),
                entityTypeShortAlias: undefined,
              },
            }
            : item.dynamicItemsConfiguration,
        }
        : item
    ;
  });
};
