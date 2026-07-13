import { IButtonGroupItemBase, isDynamicItem, isGroup } from "@/providers/buttonGroupConfigurator/models";
import { isDefined } from "@/utils/nullables";
import { getStringPropertyOrUndefined } from "@/utils/object";

/** Migrate entityTypeShortAlias to entityType */
export const migrateButtonGroupDynamicItems = (items: IButtonGroupItemBase[] | undefined): IButtonGroupItemBase[] => {
  if (!isDefined(items))
    return [];

  return items.map((item) => {
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
                ...item.dynamicItemsConfiguration.settings,
                entityType: item.dynamicItemsConfiguration.settings ? getStringPropertyOrUndefined(item.dynamicItemsConfiguration.settings, "entityTypeShortAlias") : undefined,
                entityTypeShortAlias: undefined,
              },
            }
            : item.dynamicItemsConfiguration,
        }
        : item
    ;
  });
};
