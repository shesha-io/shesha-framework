import { IDictionary } from "@/interfaces";
import { IKeyValue } from "@/interfaces/keyValue";

export const mapKeyValueToDictionary = (value: IKeyValue[] | undefined): IDictionary<string> | undefined => {
  if (!value)
    return undefined;

  const result = {};
  value.forEach((item) => {
    if (item.key)
      result[item.key] = item.value;
  });
  return result;
};

export const setOrDelete = <TItem = unknown>(dict: IDictionary<TItem>, key: string, value: TItem | undefined): void => {
  if (value === undefined) {
    delete dict[key];
  } else {
    dict[key] = value;
  }
};
