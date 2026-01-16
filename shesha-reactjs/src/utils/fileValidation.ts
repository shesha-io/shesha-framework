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

  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === fileName.length - 1) {
    return false; // No extension found
  }
  const fileExt = fileName.substring(dotIndex + 1).toLowerCase();
  return allowedFileTypes.some((type) => {
    const normalizedType = type.startsWith('.') ? type.substring(1).toLowerCase() : type.toLowerCase();
    return fileExt === normalizedType;
  });
};