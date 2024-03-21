import { createContext } from "react";

export  interface ISourcesFolderContext {
    /**
     * Folder name
     */
    folder: string;
    /**
     * Folder full path
     */
    path: string;
}
export const SourcesFolderContext = createContext<ISourcesFolderContext>(undefined);