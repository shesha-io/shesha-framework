import { IDictionary } from "@/interfaces";
import { IKeyValue } from "@/interfaces/keyValue";

export const mapKeyValueToDictionary = (value: IKeyValue[]): IDictionary<string> => {
  if (!value)
    return undefined;

  const result = {};
  value.forEach((item) => {
    if (item.key)
      result[item.key] = item.value;
  });
  return result;
};
