/**
 * Validates if a file is allowed based on configured file types
 * @param fileName The name of the file to validate
 * @param allowedFileTypes Array of allowed file extensions (e.g., ['.png', '.jpg'])
 * @returns true if file is allowed, false otherwise
 */
export const isFileTypeAllowed = (fileName: string, allowedFileTypes?: string[]): boolean => {
  if (!allowedFileTypes || allowedFileTypes.length === 0) {
    return true;
  }

  const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return allowedFileTypes.some((type) => fileExt === type.toLowerCase());
};
