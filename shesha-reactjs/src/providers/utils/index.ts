function removeNullUndefined<T extends Object>(obj: T): T {
  const newObj = {} as T;
  if (!obj) {
    return obj;
  }
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object') {
        newObj[key] = removeNullUndefined(value);
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj;
}

export { removeNullUndefined };
