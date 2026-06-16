import React, { FC } from 'react';
import { Tree } from 'antd';
import type { GetProps } from 'antd';
import { Monaco } from '@monaco-editor/react';
import { UriComponents } from 'monaco-editor';
import { DownOutlined } from '@ant-design/icons';
import { useSourcesTreeNodes } from './hooks';
import { FileTreeNode } from './models';
import { getNodeIcon } from './icons';

const { DirectoryTree } = Tree;

type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree<FileTreeNode>>;

export interface IFileTreeProps {
  monaco: Monaco;
  defaultSelection?: UriComponents | undefined;
  onSelect?: (fileUri?: UriComponents) => void;
}

export const FileTree: FC<IFileTreeProps> = (props) => {
  const { monaco } = props;
  const treeNodes = useSourcesTreeNodes(monaco);

  const onSelect: DirectoryTreeProps['onSelect'] = (_keys, info) => {
    if (props.onSelect) {
      props.onSelect(info.node.uri);
    }
  };
  const getParentNodes = (uri: UriComponents): React.Key[] => {
    const result: React.Key[] = [];
    const node = treeNodes.map[uri.toString()];
    if (!node)
      return result;

    const getParentNode = (node: FileTreeNode): FileTreeNode | undefined => {
      return node.parentId
        ? treeNodes.map[node.parentId]
        : undefined;
    };

    let currentNode = getParentNode(node);
    while (currentNode) {
      result.push(currentNode.key);
      currentNode = getParentNode(currentNode);
    }
    return result;
  };

  return (
    <>
      <DirectoryTree<FileTreeNode>
        switcherIcon={<DownOutlined />}
        blockNode={true}
        onSelect={onSelect}
        treeData={treeNodes.nodes}
        {...(props.defaultSelection
          ? {
            defaultSelectedKeys: [props.defaultSelection.toString()],
            defaultExpandedKeys: getParentNodes(props.defaultSelection),
          }
          : {})}
        icon={getNodeIcon}
      />
    </>
  );
};
