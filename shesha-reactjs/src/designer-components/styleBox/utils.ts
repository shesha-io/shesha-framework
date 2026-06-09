import { StyleBoxValue } from "../../providers/form/models";
import { jsonSafeParse } from "@/utils/object";

export const getStyleBoxValue = (value: string | StyleBoxValue): StyleBoxValue => {
  if (typeof value === 'string')
    return { ...jsonSafeParse<StyleBoxValue>(value), _type: 'styleBox' };
  if (value !== null && typeof value === 'object' && !Array.isArray(value))
    return { ...value, _type: 'styleBox' };
  return { _type: 'styleBox' };
};
