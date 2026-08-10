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

  return (
    <>
      {node.flags.isUpdated && (
        <span
          role="img"
          aria-label="Has manual changes"
          title="Has manual changes"
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'orange',
            verticalAlign: 'middle',
            marginLeft: 4,
          }}
        />
      )}
      {node.flags.isCodegenPending && (
        <ExclamationCircleOutlined
          role="img"
          aria-label="Code generation pending"
          title="Code generation pending"
          style={{ color: theme.colorError, marginLeft: 4 }}
        />
      )}
    </>
  );
};
