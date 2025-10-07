interface IAnyObject {
  [value: string]: any;
}

const removeUndefined = (input: IAnyObject): IAnyObject => {
  const newObj = {};

  Object.keys(input).forEach((key) => {
    if (input[key] === Object(input[key])) newObj[key] = removeUndefined(input[key]);
    else if (input[key] !== undefined) newObj[key] = input[key];
  });

  return newObj;
};

export const removeUndefinedProperties = (input: IAnyObject, nested = false): IAnyObject => {
  const obj = { ...input };

  if (nested) {
    return removeUndefined(input);
  }

  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));

  return obj;
};

