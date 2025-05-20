export const addPx = (value) => {
  return !value ? null : /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
};

export const hasNumber = (str: string | number) => typeof str === 'number' ? true : /\d/.test(str);
