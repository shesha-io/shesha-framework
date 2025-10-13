import { isConfigItemTreeNode, TreeNode } from '@/configuration-studio/models';
import { useStyles } from '@/configuration-studio/styles';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { FC } from 'react';

export interface INodeIndicatorProps {
  node: TreeNode;
}

export const NodeIndicator: FC<INodeIndicatorProps> = ({ node }) => {
  const { theme } = useStyles();
  if (!isConfigItemTreeNode(node))
    return undefined;

  return node.flags.isCodegenPending
    ? (
      <ExclamationCircleOutlined style={{ color: theme.colorError }} />
    )
    : undefined;
};
