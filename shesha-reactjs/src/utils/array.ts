interface IAnyObject {
  [value: string]: any;
}

const removeUndefined = (input: IAnyObject) => {
  const newObj = {};

  Object.keys(input).forEach((key) => {
    if (input[key] === Object(input[key])) newObj[key] = removeUndefined(input[key]);
    else if (input[key] !== undefined) newObj[key] = input[key];
  });

  return newObj;
};

export const removeUndefinedProperties = (input: IAnyObject, nested = false) => {
  const obj = { ...input };

  if (nested) {
    return removeUndefined(input);
  }

  Object.keys(obj).forEach((key) => (obj[key] === undefined ? delete obj[key] : {}));

  return obj;
};

const arrayMoveMutate = (array, from, to) => {
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
};

export const arrayMove = (array, from, to) => {
  array = array.slice();
  arrayMoveMutate(array, from, to);
  return array;
};