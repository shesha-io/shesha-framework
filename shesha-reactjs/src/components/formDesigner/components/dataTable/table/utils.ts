import { nanoid } from 'nanoid/non-secure';

const NEW_KEY = ['{{NEW_KEY}}', '{{GEN_KEY}}'];

export const generateNewKey = (json: object) => {
  try {
    let stringify = JSON.stringify(json);

    NEW_KEY.forEach(key => {
      stringify = stringify.replaceAll(key, nanoid());
    });

    return JSON.parse(stringify);
  } catch (error) {
    return json;
  }
};
