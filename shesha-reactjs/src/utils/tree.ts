import treeToListHelper from 'tree-to-list';

export const treeToList = <T>(tree: T[], key: keyof T): T[] => treeToListHelper(tree, key as string);
