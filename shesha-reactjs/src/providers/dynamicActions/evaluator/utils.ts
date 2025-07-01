import { IStyleType } from '@/index';
import {
  ButtonGroupItemProps,
  IButtonGroupItemBase,
  IDynamicItem,
  isDynamicItem,
  isGroup,
} from '@/providers/buttonGroupConfigurator/models';
import { ButtonType } from 'antd/lib/button';

export interface IDynamicItemsEvaluationStore {
  dynamicItems: IResolvedDynamicItem[];
  buttonType?: ButtonType;
  items: ButtonGroupItemProps[];
}

export interface IResolvedDynamicItem extends IDynamicItem, IStyleType {
  isResolved: boolean;
  resolvedItems: ButtonGroupItemProps[];
}

export const isResolvedDynamicItem = (item: IButtonGroupItemBase): item is IResolvedDynamicItem => {
  if (!isDynamicItem(item)) return false;
  const typed = item as IResolvedDynamicItem;
  return typeof typed.isResolved === 'boolean' && Array.isArray(typed.resolvedItems);
};

export const getDynamicActionsItemsLevel = (
  items: ButtonGroupItemProps[],
  onDynamicItem: (dynamicItem: IResolvedDynamicItem) => void
): ButtonGroupItemProps[] => {
  const result = items.map((item) => {
    if (isDynamicItem(item)) {
      if (isResolvedDynamicItem(item)) {
        return item;
      } else {
        // TODO: start promise, on success - fill resolvedItems and fire recalculation of main list
        // TODO: return lists of all promises to be able to cancel loading. it can be used for triggering of recalculations
        const dynamicItem: IResolvedDynamicItem = {
          ...item,
          isResolved: false,
          resolvedItems: [],
        };
        onDynamicItem(dynamicItem);
        return dynamicItem;
      }
    } else if (isGroup(item)) {
      return {
        ...item,
        childItems: item.childItems ? getDynamicActionsItemsLevel(item.childItems, onDynamicItem) : null,
      };
    } else return item;
  });

  return result;
};

export const getItemsWithResolved = (items: ButtonGroupItemProps[]): ButtonGroupItemProps[] => {
  const result: ButtonGroupItemProps[] = [];

  items.forEach((item) => {
    if (isDynamicItem(item)) {
      if (isResolvedDynamicItem(item) && item.isResolved) result.push(...item.resolvedItems);
    } else if (isGroup(item)) {
      result.push({ ...item, childItems: getItemsWithResolved(item.childItems) });
    } else result.push(item);
  });

  return result;
};
