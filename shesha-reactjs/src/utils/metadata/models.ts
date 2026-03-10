/**
 * Pair of type name and absolute path
 * */
export interface TypeAndLocation {
  /** Type name */
  typeName: string;
  /** Absolute path to the file */
  filePath?: string;
}

export const EOL = '\r\n';
