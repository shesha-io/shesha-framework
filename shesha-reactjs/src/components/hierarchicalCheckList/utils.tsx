import { CheckSquareOutlined, CloseSquareOutlined } from '@ant-design/icons';
import React, { Key } from 'react';
import _ from 'lodash';
import { CheckListSelectionType, ICheckListItemSelection, IDataNode, ISaveSelectionsInput } from './interface';
import { CheckListItemModel } from '../../apis/checkList';
import { treeToList } from '../../utils/tree';

// We do not want clicking anywhere on the tree to trigger the visibility of the overlay
// By default, when you focus the text area, because this is part of the tree title, it'll trigger onSelect.
//  So, in here, we're preventing that default event propagation
export const onPreventDefaultClickClick = (
  e: React.MouseEvent<HTMLDivElement | HTMLTextAreaElement, MouseEvent> | React.FocusEvent<HTMLTextAreaElement>
) => {
  e.preventDefault();
  e?.stopPropagation();
};

export const getParentKey = (key: Key, tree: IDataNode[]) => {
  let parentKey: string = '';
  for (const node of tree) {
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  
  return parentKey;
};

export const getParentNode = (tree: CheckListItemModel[], key: Key) => {
  let parentKey: CheckListItemModel = null;
  for (const node of tree) {
    if (node.childItems) {
      if (node.childItems.some(item => item.id === key)) {
        parentKey = node;
      } else if (getParentNode(node.childItems, key)) {
        parentKey = getParentNode(node.childItems, key);
      }
    }
  }
  return parentKey;
};

export const getNodeById = (tree: CheckListItemModel[], nodeId: string): CheckListItemModel => {
  const list = treeToList(tree, 'childItems');

  return list?.find(({ id }) => id === nodeId);
};

export const getNodeFullTitle = (tree: CheckListItemModel[], nodeId: string) => {
  if (!tree || !nodeId) return null;

  let node = getNodeById(tree, nodeId);

  if (!node) return null;

  let fullName = node?.name;

  while (node) {
    node = getParentNode(tree, node?.id);
    if (node) {
      fullName = `${node?.name}/${fullName}`;
    } else {
      break;
    }
  }
  return fullName;
};

export const getFirstSelectedLeaf = (tree: CheckListItemModel[], selectedKeys: string[]) => {
  let foundNode: CheckListItemModel;
  selectedKeys.forEach(key => {
    foundNode = getNodeById(tree, key);

    if (!foundNode?.childItems?.length) {
      return null;
    }
  });

  return foundNode;
};

// It's just a simple demo. You can use tree map to optimize update perf.
export function updateTreeData(list: IDataNode[], key: React.Key, children: IDataNode[]): IDataNode[] {
  return list.map(localNode => {
    const node = {
      ...localNode,
      icon: localNode.isLeaf
        ? ({ selected }: { selected: boolean }) => (selected ? <CheckSquareOutlined /> : <CloseSquareOutlined />)
        : null,
    };
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }

    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
        // icon: null
      };
    }
    return node;
  });
}

export function deepFlattenTree<T>(r: T[], a: T[], key: keyof T) {
  const b = {};
  Object.keys(a).forEach(k => {
    if (k !== key) {
      b[k] = a[k];
    }
  });
  r.push(b as T);
  if (Array.isArray(a[key as string])) {
    return a[key as string].reduce(deepFlattenTree, r);
  }
  return r;
}

export const filterOnSelectionsChange = (
  selections: ICheckListItemSelection[],
  { id, ownerId, ownerType }: { id: string; ownerId: string; ownerType: string }
): ISaveSelectionsInput => {
  let allChecked = true;

  const response: ISaveSelectionsInput = {
    id,
    ownerId,
    ownerType,
    selection: selections.map(({ checkListItemId, selection, comments }) => {
      if (selection !== CheckListSelectionType.Yes && allChecked) {
        allChecked = false;
      }

      return {
        checkListItemId,
        selection,
        comments,
      };
    }),
  };

  return { ...response, allChecked };
};

type ChecklistErrorTypes =
  | 'noCommentsNoSelections'
  | 'numberOfSelectionsInvalid'
  | 'minSelectionsRequired'
  | 'maxSelectionsExceeded';

export const getValidationError = (errorType: ChecklistErrorTypes, requiredNum: number) => {
  switch (errorType) {
    case 'noCommentsNoSelections':
      return "Please make sure that for all the checklists that have comments, you've either made a selection or entered comments";
    case 'numberOfSelectionsInvalid':
      return `Please make sure that you have selected only ${requiredNum} selections`;
    case 'minSelectionsRequired':
      return `make sure you have have made at least ${requiredNum} selections`;
    case 'maxSelectionsExceeded':
      return `make sure the number of selections does not exceed ${requiredNum}`;
    default:
      return 'Invalid';
  }
};
