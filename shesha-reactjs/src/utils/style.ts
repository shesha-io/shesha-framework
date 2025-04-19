export const addPx = (value) => {
  return !value ? null : /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
};
