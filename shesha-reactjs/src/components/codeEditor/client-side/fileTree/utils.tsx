import { Monaco } from '@monaco-editor/react';
import { trimPrefix } from '@/utils/string';
import { Directory, FileItemProps, FileItemType, SourceFile } from './models';

export const isDirectory = (item: FileItemProps): item is Directory => {
  return item && item.type === FileItemType.Directory;
};

export const isFile = (item: FileItemProps): item is SourceFile => {
  return item && item.type === FileItemType.File;
};

type SourceTreeCache = Map<string, Directory | SourceFile>;

const getSourcesDirectory = (path: string[], parentDirectory: Directory, cache: SourceTreeCache): Directory => {
  let currentParent = parentDirectory;
  let fullPath = "";
  path.forEach((dirName) => {
    fullPath = fullPath + "/" + dirName;
    const existingDirectory = cache.get(fullPath);
    if (!existingDirectory) {
      const directory: Directory = {
        id: fullPath,
        files: [],
        dirs: [],
        type: FileItemType.Directory,
        name: dirName,
        parentId: currentParent.id,
      };
      currentParent.dirs.push(directory);

      currentParent = directory;
      cache.set(fullPath, directory);
    } else {
      currentParent = existingDirectory as Directory;
    }
  });
  return currentParent;
};

export const getSourcesTree = (monaco: Monaco): Directory => {
  const rootDir: Directory = {
    files: [],
    dirs: [],
    id: 'root',
    type: FileItemType.Directory,
    name: 'root',
    parentId: '',
  };
  const cache = new Map<string, Directory | SourceFile>();
  cache.set(rootDir.id, rootDir);

  const models = monaco.editor.getModels();

  const tsFilePathPrefix = 'filename';
  models.forEach((model) => {
    if (model.uri.scheme === 'inmemory')
      return;

    const clearFilePath = model.uri.scheme === 'ts' && model.uri.path.startsWith(tsFilePathPrefix)
      ? trimPrefix(model.uri.path, tsFilePathPrefix)
      : model.uri.path;

    if (clearFilePath.startsWith('/')) {
      const pathParts = trimPrefix(clearFilePath, '/').split('/');
      const fileName = pathParts.pop();
      const directory = getSourcesDirectory(pathParts, rootDir, cache);
      const fileId = model.uri.toString();
      const file: SourceFile = {
        // content: model.getValue(),
        id: fileId,
        name: fileName,
        uri: model.uri,
        type: FileItemType.File,
        parentId: directory.id,
      };
      cache.set(fileId, file);
      directory.files.push(file);
    } else {
      console.warn(`LOG: unknown file: '${model.uri}', path: '${clearFilePath}', scheme: '${model.uri.scheme}'`);
    }
  });

  // sort
  cache.forEach((item) => {
    if (isDirectory(item)) {
      item.dirs = [...item.dirs].sort((a, b) => a.name.localeCompare(b.name));
      item.files = [...item.files].sort((a, b) => a.name.localeCompare(b.name));
    }
  });

  return rootDir;
};
