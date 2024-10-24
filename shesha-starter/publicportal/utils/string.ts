export const capitalizeFirstLetter = (str: string) => {
  if (!str) return null;

  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`;
};

export const camelCase = <T = object>(obj: object): T => {
  const newObj = {};
  for (const d in obj) {
    if (obj.hasOwnProperty(d)) {
      newObj[
        d.toLowerCase().replace(/(_\w)/g, function (k) {
          return k[1].toUpperCase();
        })
      ] = obj[d];
    }
  }
  return newObj as T;
};
