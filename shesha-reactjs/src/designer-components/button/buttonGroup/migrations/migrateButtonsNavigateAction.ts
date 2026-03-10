import { migrateNavigateAction } from "@/designer-components/_common-migrations/migrate-navigate-action";
import { ButtonGroupItemProps, IButtonGroup, IButtonItem, isButtonItem, isGroup } from "@/providers/buttonGroupConfigurator/models";
import { IButtonGroupComponentProps } from "../models";

export const migrateButtonsNavigateAction = (props: IButtonGroupComponentProps): IButtonGroupComponentProps => {
  const { items } = props;

  const migrateButtonAction = (item: ButtonGroupItemProps): ButtonGroupItemProps => {
    if (isButtonItem(item))
      return { ...item, actionConfiguration: migrateNavigateAction(item.actionConfiguration) } as IButtonItem;

    if (isGroup(item))
      return { ...item, childItems: item.childItems?.map(migrateButtonAction) } as IButtonGroup;

    return item;
  };
  const newItems = items.map((item) => migrateButtonAction(item));

  return { ...props, items: newItems };
};
