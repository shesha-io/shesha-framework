import { ILayerGroup, LayerGroupItemProps } from './models';

export interface IItemPosition {
  ownerArray: LayerGroupItemProps[];
  index: number;
}

export const getItemPositionById = (items: LayerGroupItemProps[], id: string): IItemPosition | null => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };

    const children = (item as ILayerGroup)?.childItems;

    if (children) {
      const itemPosition: IItemPosition | null = getItemPositionById(children, id);
      if (itemPosition) return itemPosition;
    }
  }

  return null;
};

export const getItemById = (items: LayerGroupItemProps[], id: string): LayerGroupItemProps | null => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};

export const getComponentModel = (item: LayerGroupItemProps): LayerGroupItemProps & { visible: boolean; allowChangeVisibility: boolean } => ({
  ...item,
  visible: item.visible ?? true,
  allowChangeVisibility: item.allowChangeVisibility ?? true,
});

/**
 * Immutably update an item at any nesting depth by cloning the entire path
 */
export const updateItemAtPath = (
  items: LayerGroupItemProps[],
  targetId: string,
  updateFn: (item: LayerGroupItemProps) => LayerGroupItemProps,
): LayerGroupItemProps[] => {
  return items.map((item) => {
    // If this is the target item, apply the update
    if (item.id === targetId) {
      return updateFn(item);
    }

    // If this is a group, recursively search and clone children
    const group = item as ILayerGroup;
    if (group.childItems) {
      const updatedChildren = updateItemAtPath(group.childItems, targetId, updateFn);
      // Only clone if children actually changed
      if (updatedChildren !== group.childItems) {
        return { ...group, childItems: updatedChildren };
      }
    }

    return item;
  });
};

/**
 * Immutably delete an item at any nesting depth by cloning the entire path
 */
export const deleteItemAtPath = (
  items: LayerGroupItemProps[],
  targetId: string,
): LayerGroupItemProps[] => {
  return items.reduce<LayerGroupItemProps[]>((acc, item) => {
    // If this is the target item, exclude it
    if (item.id === targetId) {
      return acc;
    }

    // If this is a group, recursively search and clone children
    const group = item as ILayerGroup;
    if (group.childItems) {
      const filteredChildren = deleteItemAtPath(group.childItems, targetId);
      // Only clone if children actually changed
      if (filteredChildren.length !== group.childItems.length) {
        acc.push({ ...group, childItems: filteredChildren });
        return acc;
      }
    }

    acc.push(item);
    return acc;
  }, []);
};

/**
 * Immutably update childItems at a specific path by cloning all parents along the way
 */
export const updateChildItemsAtPath = (
  items: LayerGroupItemProps[],
  path: number[],
  newChildren: LayerGroupItemProps[],
): LayerGroupItemProps[] => {
  if (path.length === 0) {
    // Base case: replace root items
    return newChildren;
  }

  const [currentIndex, ...restPath] = path;

  return items.map((item, idx) => {
    if (idx !== currentIndex) {
      return item;
    }

    // Clone this item
    const group = item as ILayerGroup;

    if (restPath.length === 0) {
      // This is the target parent - update its children
      return { ...group, childItems: newChildren };
    }

    // Recursively update nested children
    if (group.childItems) {
      return {
        ...group,
        childItems: updateChildItemsAtPath(group.childItems, restPath, newChildren),
      };
    }

    return item;
  });
};
