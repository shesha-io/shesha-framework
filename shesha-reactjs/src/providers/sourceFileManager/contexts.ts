import { createNamedContext } from "@/utils/react";

export interface ISourcesFolderContext {
  /**
   * Folder name
   */
  folder: string;
  /**
   * Folder full path
   */
  path: string;
}
export const SourcesFolderContext = createNamedContext<ISourcesFolderContext>(undefined, "SourcesFolderContext");
