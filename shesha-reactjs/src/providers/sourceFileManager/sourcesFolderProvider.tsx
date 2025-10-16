import React, { FC, PropsWithChildren, useContext, useMemo } from 'react';
import { ISourcesFolderContext, SourcesFolderContext } from './contexts';

export interface ISourceFilesFolderProviderProps {
  folder: string;
}

/**
 * Returns the ISourcesFolderContext and throws an error if require is true and the SourcesFolderContext is undefined.
 *
 * @param {boolean} require - specifies whether the SourcesFolderContext is required
 * @return {ISourcesFolderContext} the SourcesFolderContext
 */
export const useSourcesFolder = (require: boolean): ISourcesFolderContext => {
  const context = useContext(SourcesFolderContext);

  if (context === undefined && require) {
    throw new Error('useSourcesFolder must be used within a SourcesFolderContext');
  }

  return context;
};

/**
 * Returns the full path of a file or folder within the sources folder.
 *
 * @param {string} fileOrFolderName - The name of the file or folder.
 * @return {string} The full path of the file or folder.
 */
export const useSourceFullPath = (fileOrFolderName: string): string => {
  const parentContext = useSourcesFolder(false);
  return parentContext ? parentContext.path + '/' + fileOrFolderName : fileOrFolderName;
};

/**
 * Component for providing the source files folder to its children.
 *
 * @param {PropsWithChildren<ISourceFilesFolderProviderProps>} folder - The source files folder.
 * @param {ReactNode} children - The child components to render.
 * @return {ReactElement} The JSX element representing the component.
 */
export const SourceFilesFolderProvider: FC<PropsWithChildren<ISourceFilesFolderProviderProps>> = ({ folder, children }) => {
  const fullPath = useSourceFullPath(folder);

  const value = useMemo<ISourcesFolderContext>(() => {
    return { folder: folder, path: fullPath };
  }, [folder, fullPath]);

  return (
    <SourcesFolderContext.Provider
      value={value}
    >
      {children}
    </SourcesFolderContext.Provider>
  );
};
