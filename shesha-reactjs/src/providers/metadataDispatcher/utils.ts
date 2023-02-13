export const getClassNameFromFullName = (name: string): string => {
    const idx = name.lastIndexOf('.');
    return idx > -1
        ? name.substring(idx + 1)
        : name;
}