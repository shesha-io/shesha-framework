import { isDefined } from "@/utils/nullables";
import { StyleBoxValue } from "../../providers/form/models";
import { jsonSafeParse } from "@/utils/object";

export const getStyleBoxValue = (value: string | StyleBoxValue | undefined | null): StyleBoxValue => {
  if (typeof value === 'string')
    return { ...jsonSafeParse<StyleBoxValue>(value), _type: 'styleBox' };
  if (isDefined(value) && typeof value === 'object' && !Array.isArray(value))
    return { ...value, _type: 'styleBox' };
  return { _type: 'styleBox' };
};
