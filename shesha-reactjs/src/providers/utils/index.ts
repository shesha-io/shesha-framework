/**
 * Removes all null and undefined properties from an object.
 * If a property is an object, it is recursively processed.
 * @template T
 * @param {T} obj - The object to process.
 * @returns {T} - The processed object.
 */
export const removeNullUndefined = <T extends object>(obj: T): T => {
  const result = {} as T;

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
      if (typeof obj[key] === 'object') {
        result[key] = removeNullUndefined(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
};
