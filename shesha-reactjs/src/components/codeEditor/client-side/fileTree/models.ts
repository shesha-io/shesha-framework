import type { TreeDataNode } from 'antd';
import { UriComponents } from 'monaco-editor';

export enum FileItemType {
  File,
  Directory,
}

export interface FileItemProps {
  id: string;
  type: FileItemType;
  name: string;
  parentId: string | undefined;
  // depth: number;
}

export interface SourceFile extends FileItemProps {
  content?: string;
  uri?: UriComponents;
}
export interface Directory extends FileItemProps {
  files: SourceFile[];
  dirs: Directory[];
}

export type FileTreeNode = TreeDataNode & {
  dirName?: string;
  uri?: UriComponents;
  parentId?: string;
};
