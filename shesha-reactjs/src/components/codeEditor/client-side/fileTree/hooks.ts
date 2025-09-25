import { Monaco } from "@monaco-editor/react";
import { getSourcesTree, isDirectory, isFile } from "./utils";
import { Directory, FileItemProps, FileTreeNode } from "./models";
import { useDisposableSubscriptions } from "../hooks";
import { useEffect, useMemo, useState } from "react";

export const useSourcesTree = (monaco: Monaco): Directory => {
  const subscriptions = useDisposableSubscriptions();
  const [state, setState] = useState(() => getSourcesTree(monaco));

  useEffect(() => {
    const onCreate = monaco.editor.onDidCreateModel(() => {
      setState(getSourcesTree(monaco));
    });
    subscriptions.add(onCreate);

    const onDispose = monaco.editor.onWillDisposeModel(() => {
      setState(getSourcesTree(monaco));
    });
    subscriptions.add(onDispose);

    return () => {
      subscriptions.clear();
    };
  }, [monaco, monaco.editor]);

  return state;
};

const mapFileItemToNode = (item: FileItemProps, onAdd: (node: FileTreeNode) => void): FileTreeNode => {
  if (isDirectory(item)) {
    const subDirs = item.dirs.map((i) => mapFileItemToNode(i, onAdd));
    const files = item.files.map((i) => mapFileItemToNode(i, onAdd));
    const result: FileTreeNode = {
      key: item.id,
      title: item.name,
      isLeaf: false,
      children: [...subDirs, ...files],
      parentId: item.parentId,
    };
    onAdd(result);
    return result;
  }
  if (isFile(item)) {
    const file: FileTreeNode = {
      key: item.id,
      title: item.name,
      uri: item.uri,
      isLeaf: true,
      parentId: item.parentId,
    };
    onAdd(file);
    return file;
  }
  throw new Error(`Invalid type of source tree item: '${item.type}'`);
};

export interface TreeNodeMap {
  [key: string]: FileTreeNode;
};
export interface UseTreeNodesResponse {
  nodes: FileTreeNode[];
  map: TreeNodeMap;
}

export const useSourcesTreeNodes = (monaco: Monaco): UseTreeNodesResponse => {
  const rootDir = useSourcesTree(monaco);

  const treeNodes = useMemo<UseTreeNodesResponse>(() => {
    const result: UseTreeNodesResponse = {
      nodes: [],
      map: {},
    };
    const root = mapFileItemToNode(rootDir, (node) => {
      result.map[node.key.toString()] = node;
    });
    result.nodes = root.children;

    return result;
  }, [rootDir]);

  return treeNodes;
};
